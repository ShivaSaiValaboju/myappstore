/**
 * Express API routes for Nexora Store
 */

import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import { db } from './db';
import {
  calculateOrderTotals,
  generateLicenseKey,
  verifyDownloadEntitlement,
  canActivateDevice,
} from '../utils/rules';
import type {
  CartItem,
  OrderRecord,
  Entitlement,
  DownloadAuthorization,
} from '../types/store';

export const apiRouter = Router();

// Express 4 doesn't catch rejected promises, so forward async errors to the error handler
function asyncRoute(handler: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };
}

// Helper to extract demo user from Authorization or session header
async function getAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return undefined;
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  // Simple token resolution for demo: "user-demo-1" or "user-admin-1" or "usr_<id>"
  if (token.startsWith('usr_')) {
    const id = token.replace('usr_', '');
    return await db.getUserById(id);
  }
  return await db.getUserById(token);
}

// ----------------------------------------------------
// Public Catalog Routes
// ----------------------------------------------------

apiRouter.get('/categories', asyncRoute(async (_req: Request, res: Response) => {
  res.json(await db.getCategories());
}));

apiRouter.get('/apps', asyncRoute(async (req: Request, res: Response) => {
  const { platform, category, search, freeOnly, sort } = req.query;
  const apps = await db.getApplications({
    platform: platform as string,
    category: category as string,
    search: search as string,
    freeOnly: freeOnly === 'true',
    sort: sort as string,
  });
  res.json(apps);
}));

apiRouter.get('/apps/:slug', asyncRoute(async (req: Request, res: Response) => {
  const app = await db.getApplicationBySlug(req.params.slug);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }
  const reviews = await db.getReviewsForApp(app.id);
  res.json({ ...app, reviews });
}));

apiRouter.get('/search', asyncRoute(async (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  if (!q.trim()) {
    return res.json([]);
  }
  const results = await db.getApplications({ search: q });
  res.json(results);
}));

// ----------------------------------------------------
// Authentication Routes
// ----------------------------------------------------

apiRouter.post('/auth/login', asyncRoute(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await db.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Demo password validation: any password accepted for demo users
  const token = `usr_${user.id}`;
  const { passwordHash: _, ...profile } = user;
  res.json({ token, user: profile });
}));

apiRouter.post('/auth/register', asyncRoute(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = await db.getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const user = await db.createUser(name, email, 'hash_' + password);
  const token = `usr_${user.id}`;
  res.status(201).json({ token, user });
}));

apiRouter.get('/auth/me', asyncRoute(async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json(user);
}));

// ----------------------------------------------------
// Library & Entitlements
// ----------------------------------------------------

apiRouter.get('/library', asyncRoute(async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const entitlements = await db.getUserEntitlements(user.id);
  // Join application info
  const items = await Promise.all(
    entitlements.map(async (ent) => {
      const app = await db.getApplicationBySlug(ent.appId);
      return {
        entitlement: ent,
        app,
      };
    })
  );

  res.json(items);
}));

// Activate a device for an entitlement
apiRouter.post('/library/activate', asyncRoute(async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { entitlementId, deviceName, platform } = req.body;
  const entitlements = await db.getUserEntitlements(user.id);
  const ent = entitlements.find((e) => e.id === entitlementId);

  if (!ent) {
    return res.status(404).json({ error: 'Entitlement not found' });
  }

  const check = canActivateDevice(ent, deviceName, platform);
  if (!check.allowed) {
    return res.status(400).json({ error: check.reason });
  }

  const existing = ent.activeDevices.find(
    (d) => d.deviceName.toLowerCase() === deviceName.trim().toLowerCase()
  );
  if (!existing) {
    ent.activeDevices.push({
      deviceName: deviceName.trim(),
      platform,
      activatedAt: new Date().toISOString(),
    });
    ent.activationsUsed = ent.activeDevices.length;
    await db.updateEntitlement(ent);
  }

  res.json({ success: true, entitlement: ent });
}));

// ----------------------------------------------------
// Wishlist Routes
// ----------------------------------------------------

apiRouter.get('/wishlist', asyncRoute(async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.json([]);
  }
  const appIds = await db.getUserWishlist(user.id);
  const apps = (await Promise.all(appIds.map((id) => db.getApplicationBySlug(id)))).filter(Boolean);
  res.json(apps);
}));

apiRouter.post('/wishlist/toggle', asyncRoute(async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const { appId } = req.body;
  if (!appId) {
    return res.status(400).json({ error: 'appId is required' });
  }
  const updatedList = await db.toggleWishlist(user.id, appId);
  res.json({ wishlist: updatedList });
}));

// ----------------------------------------------------
// Cart & Checkout Routes
// ----------------------------------------------------

apiRouter.post('/checkout/validate', asyncRoute(async (req: Request, res: Response) => {
  const { items, couponCode } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  // Security: Re-verify real prices from database rather than trusting client numbers
  const verifiedItems = await Promise.all(
    items.map(async (item: CartItem) => {
      const app = await db.getApplicationBySlug(item.appId);
      if (!app) return { priceUsd: 0 };
      const plan = app.licensePlans.find((p) => p.id === item.planId);
      return { priceUsd: plan ? plan.priceUsd : app.basePriceUsd };
    })
  );

  const calculation = calculateOrderTotals(verifiedItems, couponCode);
  res.json(calculation);
}));

apiRouter.post('/checkout/complete', asyncRoute(async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please sign in to complete purchase' });
  }

  const { items, couponCode, paymentMethod } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  // Server-authoritative price calculation
  const cartApps = await Promise.all(
    items.map((item: CartItem) => db.getApplicationBySlug(item.appId))
  );
  const missingIndex = cartApps.findIndex((app) => !app);
  if (missingIndex >= 0) {
    return res.status(400).json({ error: `Invalid application: ${items[missingIndex].appId}` });
  }

  const verifiedItemsWithMeta = items.map((item: CartItem, index: number) => {
    const app = cartApps[index]!;
    const plan = app.licensePlans.find((p) => p.id === item.planId) || {
      id: 'default',
      name: 'Standard License',
      priceUsd: app.basePriceUsd,
      maxDeviceActivations: 2,
    };
    return {
      app,
      plan,
      priceUsd: plan.priceUsd,
    };
  });

  const totals = calculateOrderTotals(
    verifiedItemsWithMeta.map((i) => ({ priceUsd: i.priceUsd })),
    couponCode
  );

  const orderId = `ord-${Date.now()}`;
  const orderNumber = `NEX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const orderItems = await Promise.all(verifiedItemsWithMeta.map(async (entry) => {
    const licenseKey = generateLicenseKey();

    // Create persistent entitlement for each purchased app
    const entitlement: Entitlement = {
      id: `ent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: user.id,
      appId: entry.app.id,
      licensePlanId: entry.plan.id,
      orderId,
      purchasedAt: new Date().toISOString(),
      licenseKey,
      status: 'active',
      activationsUsed: 0,
      maxActivations: entry.plan.maxDeviceActivations || 2,
      activeDevices: [],
    };
    await db.addEntitlement(entitlement);

    return {
      appId: entry.app.id,
      appName: entry.app.name,
      planId: entry.plan.id,
      planName: entry.plan.name,
      unitPriceUsd: entry.priceUsd,
      licenseKey,
    };
  }));

  const order: OrderRecord = {
    id: orderId,
    orderNumber,
    userId: user.id,
    userEmail: user.email,
    createdAt: new Date().toISOString(),
    items: orderItems,
    subtotalUsd: totals.subtotal,
    discountUsd: totals.discount,
    couponCode: totals.appliedCoupon?.code,
    taxUsd: totals.tax,
    totalUsd: totals.total,
    paymentMethod: paymentMethod || 'demo_credit_card',
    status: 'completed',
  };

  await db.createOrder(order);
  res.status(201).json({ success: true, order });
}));

apiRouter.get('/orders', asyncRoute(async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const orders = await db.getUserOrders(user.id);
  res.json(orders);
}));

apiRouter.get('/orders/:id', asyncRoute(async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const order = await db.getOrderById(req.params.id);
  if (!order || (order.userId !== user.id && user.role !== 'admin')) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
}));

// ----------------------------------------------------
// Secure Downloads Infrastructure
// ----------------------------------------------------

apiRouter.post('/downloads/authorize', asyncRoute(async (req: Request, res: Response) => {
  const { appId, buildId } = req.body;
  if (!appId || !buildId) {
    return res.status(400).json({ error: 'appId and buildId are required' });
  }

  const app = await db.getApplicationBySlug(appId);
  if (!app) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const build = app.builds.find((b) => b.id === buildId);
  if (!build) {
    return res.status(404).json({ error: 'Requested platform build not found' });
  }

  // Check user entitlement
  const user = await getAuthUser(req);
  const entitlements = user ? await db.getUserEntitlements(user.id) : [];
  const entitlementCheck = verifyDownloadEntitlement(app, entitlements);

  if (!entitlementCheck.authorized) {
    return res.status(403).json({
      error: 'Entitlement required',
      message: 'This application requires an authorized license or active purchase.',
      appId: app.id,
      basePriceUsd: app.basePriceUsd,
    });
  }

  // Issue short-lived cryptographic signed token (valid for 60 minutes)
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + 60 * 60 * 1000;

  // Build filename based on app and format
  const extension = build.packageFormat === 'dmg' ? '.dmg' : build.packageFormat === 'exe' ? '.exe' : build.packageFormat === 'msi' ? '.msi' : build.packageFormat === 'appimage' ? '.AppImage' : build.packageFormat === 'deb' ? '.deb' : build.packageFormat === 'apk' ? '.apk' : '.bin';
  const cleanAppName = app.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = `${cleanAppName}-${build.version}-${build.architecture}${extension}`;

  await db.createDownloadToken(token, expiresAt, {
    appId: app.id,
    buildId: build.id,
    userId: user?.id,
    filename,
    fileSizeBytes: build.fileSizeBytes,
    sha256Checksum: build.sha256Checksum,
    platform: build.platform,
    version: build.version,
  });

  if (user) {
    await db.recordDownload(user.id, app.id, build.id);
  }

  const authData: DownloadAuthorization = {
    token,
    appId: app.id,
    appName: app.name,
    buildId: build.id,
    platform: build.platform,
    version: build.version,
    filename,
    fileSizeBytes: build.fileSizeBytes,
    sha256Checksum: build.sha256Checksum,
    expiresAt: new Date(expiresAt).toISOString(),
    downloadUrl: `/api/downloads/file/${token}`,
    requiresLicense: build.requiresLicense,
    entitlementId: entitlementCheck.licenseKey,
  };

  res.json(authData);
}));

// Stream verified installer file payload
apiRouter.get('/downloads/file/:token', asyncRoute(async (req: Request, res: Response) => {
  const token = req.params.token;
  const tokenData = await db.getDownloadToken(token);

  if (!tokenData) {
    return res.status(403).send('Download link is invalid or has expired. Please re-authorize in SAHRIVA Store.');
  }

  if (Date.now() > tokenData.expiresAt) {
    await db.deleteDownloadToken(token);
    return res.status(403).send('Download link has expired. Please request a fresh authorization token.');
  }

  // Set verified download headers
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${tokenData.filename}"`);
  res.setHeader('X-Nexora-SHA256', tokenData.sha256Checksum);
  res.setHeader('X-Nexora-Platform', tokenData.platform);
  res.setHeader('X-Nexora-Version', tokenData.version);

  // Generate an authentic installer archive header and mock verified package buffer
  const payloadHeader = `NEXORA_AUTHORIZED_PACKAGE\nApp: ${tokenData.appId}\nVersion: ${tokenData.version}\nPlatform: ${tokenData.platform}\nSHA256: ${tokenData.sha256Checksum}\nTimestamp: ${new Date().toISOString()}\n`;
  const buffer = Buffer.from(payloadHeader.padEnd(2048, '\0'));

  res.send(buffer);
}));

// ----------------------------------------------------
// Reviews & Support
// ----------------------------------------------------

apiRouter.post('/apps/:appId/reviews', asyncRoute(async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Please sign in to submit a review' });
  }

  const { rating, title, comment, platformUsed } = req.body;
  if (!rating || !comment || !title) {
    return res.status(400).json({ error: 'Rating, title, and comment are required' });
  }

  const entitlements = await db.getUserEntitlements(user.id);
  const isVerifiedBuyer = entitlements.some((e) => e.appId === req.params.appId);

  const review = {
    id: `rev-${Date.now()}`,
    appId: req.params.appId,
    userName: user.name,
    rating: Math.max(1, Math.min(5, Number(rating))),
    title,
    comment,
    date: new Date().toISOString().split('T')[0],
    platformUsed: platformUsed || 'macos',
    verifiedBuyer: isVerifiedBuyer,
  };

  await db.addReview(review);
  res.status(201).json({ success: true, review });
}));

apiRouter.post('/support/tickets', asyncRoute(async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  const { userEmail, subject, message, category } = req.body;

  if (!subject || !message || (!user && !userEmail)) {
    return res.status(400).json({ error: 'Email, subject, and message are required' });
  }

  const ticket = {
    id: `ticket-${Date.now()}`,
    userId: user?.id,
    userEmail: user ? user.email : userEmail,
    subject,
    message,
    category: category || 'other',
    status: 'open' as const,
    createdAt: new Date().toISOString(),
  };

  await db.createTicket(ticket);
  res.status(201).json({ success: true, ticket });
}));

// ----------------------------------------------------
// Admin Routes
// ----------------------------------------------------

apiRouter.get('/admin/overview', asyncRoute(async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required' });
  }

  const apps = await db.getApplications();
  const orders = await db.getAllOrders();
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalUsd, 0);

  const platformCount: Record<string, number> = {
    macos: 0,
    windows: 0,
    linux: 0,
    android: 0,
  };

  apps.forEach((app) => {
    app.supportedPlatforms.forEach((p) => {
      platformCount[p] = (platformCount[p] || 0) + 1;
    });
  });

  res.json({
    totalApps: apps.length,
    totalOrders: orders.length,
    totalRevenueUsd: Math.round(totalRevenue * 100) / 100,
    platformCount,
    recentOrders: orders.slice(0, 5),
    tickets: await db.getTickets(),
  });
}));

apiRouter.post('/admin/apps', asyncRoute(async (req: Request, res: Response) => {
  const user = await getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required' });
  }

  const appData = req.body;
  if (!appData.name || !appData.slug) {
    return res.status(400).json({ error: 'App name and slug are required' });
  }

  await db.addApplication(appData);
  res.status(201).json({ success: true, app: appData });
}));
