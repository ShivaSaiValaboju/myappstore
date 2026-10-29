/**
 * Pure business logic rules for Nexora Store:
 * - Pricing, tax & discount calculation
 * - License key generation & validation
 * - Architecture compatibility matching
 * - Entitlement status & device activation checks
 */

import type { PlatformId, CpuArchitecture, ApplicationRecord, LicensePlan, Entitlement } from '../types/store';

export const TAX_RATE = 0.08; // 8% standard digital goods tax rate

export interface CouponRule {
  code: string;
  discountPercentage: number;
  minSubtotal: number;
  description: string;
}

export const VALID_COUPONS: Record<string, CouponRule> = {
  LAUNCH25: {
    code: 'LAUNCH25',
    discountPercentage: 25,
    minSubtotal: 20,
    description: '25% Launch Celebration Discount',
  },
  SAHRIVA10: {
    code: 'SAHRIVA10',
    discountPercentage: 10,
    minSubtotal: 0,
    description: '10% SAHRIVA Store Welcome Voucher',
  },
  NEXORA10: {
    code: 'NEXORA10',
    discountPercentage: 10,
    minSubtotal: 0,
    description: '10% Store Welcome Voucher',
  },
  STUDIO50: {
    code: 'STUDIO50',
    discountPercentage: 50,
    minSubtotal: 100,
    description: '50% Studio Suite Tier Incentive',
  },
};

export interface OrderCalculation {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  tax: number;
  total: number;
  appliedCoupon?: CouponRule;
  valid: boolean;
  error?: string;
}

/**
 * Calculates cart order totals with coupon application and tax
 */
export function calculateOrderTotals(
  items: { priceUsd: number }[],
  couponCode?: string
): OrderCalculation {
  const subtotal = items.reduce((acc, item) => acc + Math.max(0, item.priceUsd), 0);
  const roundedSubtotal = Math.round(subtotal * 100) / 100;

  let discount = 0;
  let appliedCoupon: CouponRule | undefined;
  let error: string | undefined;

  if (couponCode) {
    const normalizedCode = couponCode.trim().toUpperCase();
    const rule = VALID_COUPONS[normalizedCode];
    if (!rule) {
      error = 'Invalid coupon code';
    } else if (roundedSubtotal < rule.minSubtotal) {
      error = `Coupon requires minimum order of $${rule.minSubtotal.toFixed(2)}`;
    } else {
      discount = Math.round(((roundedSubtotal * rule.discountPercentage) / 100) * 100) / 100;
      appliedCoupon = rule;
    }
  }

  const taxableAmount = Math.max(0, roundedSubtotal - discount);
  const tax = Math.round(taxableAmount * TAX_RATE * 100) / 100;
  const total = Math.round((taxableAmount + tax) * 100) / 100;

  return {
    subtotal: roundedSubtotal,
    discount,
    taxableAmount,
    tax,
    total,
    appliedCoupon,
    valid: !error,
    error,
  };
}

/**
 * Formats USD currency with tabular precision
 */
export function formatCurrency(amount: number): string {
  if (amount === 0) return 'Free';
  return `$${amount.toFixed(2)}`;
}

/**
 * Generates an authentic cryptographically structured license key
 * Format: NEX-XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenseKey(prefix = 'NEX'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous characters (0, O, 1, I)
  const segment = (len: number) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };
  return `${prefix}-${segment(4)}-${segment(4)}-${segment(4)}-${segment(4)}`;
}

/**
 * Validates license key format
 */
export function isValidLicenseKeyFormat(key: string): boolean {
  const regex = /^[A-Z0-9]{3}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return regex.test(key.trim().toUpperCase());
}

/**
 * Checks platform compatibility and returns valid builds
 */
export function getAvailableBuildsForPlatform(
  app: ApplicationRecord,
  platform: PlatformId
) {
  const support = app.platformSupport[platform];
  if (!support || !support.supported) {
    return {
      supported: false,
      reason: support ? support.statusText : `Not officially supported on ${platform}`,
      builds: [],
    };
  }

  const builds = app.builds.filter((b) => b.platform === platform && b.verifiedStatus === 'verified');
  return {
    supported: builds.length > 0,
    reason: builds.length > 0 ? 'Official verified release available' : 'Build in verification pipeline',
    builds,
  };
}

/**
 * Checks if user is entitled to download an app
 */
export function verifyDownloadEntitlement(
  app: ApplicationRecord,
  entitlements: Entitlement[]
): {
  authorized: boolean;
  reason: 'free_application' | 'valid_license' | 'license_required';
  licenseKey?: string;
} {
  // Free apps are entitled to everyone
  if (app.licenseModel === 'free' || app.licenseModel === 'open_source' || app.basePriceUsd === 0) {
    return { authorized: true, reason: 'free_application' };
  }

  // Find active entitlement
  const activeEntitlement = entitlements.find(
    (e) => e.appId === app.id && e.status === 'active'
  );

  if (activeEntitlement) {
    return {
      authorized: true,
      reason: 'valid_license',
      licenseKey: activeEntitlement.licenseKey,
    };
  }

  return {
    authorized: false,
    reason: 'license_required',
  };
}

/**
 * Checks if a device can be activated under entitlement limits
 */
export function canActivateDevice(
  entitlement: Entitlement,
  deviceName: string,
  platform: PlatformId
): { allowed: boolean; reason?: string } {
  if (entitlement.status !== 'active') {
    return { allowed: false, reason: 'Entitlement is inactive or revoked' };
  }

  // Check if device already activated
  const existing = entitlement.activeDevices.find(
    (d) => d.deviceName.toLowerCase() === deviceName.trim().toLowerCase()
  );
  if (existing) {
    return { allowed: true, reason: 'Device already registered and activated' };
  }

  if (entitlement.activationsUsed >= entitlement.maxActivations) {
    return {
      allowed: false,
      reason: `Maximum device activations reached (${entitlement.maxActivations} devices limit)`,
    };
  }

  return { allowed: true };
}
