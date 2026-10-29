import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderTotals,
  formatCurrency,
  generateLicenseKey,
  isValidLicenseKeyFormat,
  getAvailableBuildsForPlatform,
  verifyDownloadEntitlement,
  canActivateDevice,
  TAX_RATE,
} from './rules.ts';
import type { ApplicationRecord, Entitlement } from '../types/store.ts';

test('calculateOrderTotals computes standard subtotal and tax accurately without coupon', () => {
  const items = [{ priceUsd: 49.0 }, { priceUsd: 29.0 }];
  const calc = calculateOrderTotals(items);

  assert.equal(calc.subtotal, 78.0);
  assert.equal(calc.discount, 0);
  assert.equal(calc.taxableAmount, 78.0);
  // 78 * 0.08 = 6.24
  assert.equal(calc.tax, 6.24);
  assert.equal(calc.total, 84.24);
  assert.equal(calc.valid, true);
});

test('calculateOrderTotals applies valid LAUNCH25 coupon for orders above $20', () => {
  const items = [{ priceUsd: 100.0 }];
  const calc = calculateOrderTotals(items, 'LAUNCH25');

  assert.equal(calc.subtotal, 100.0);
  assert.equal(calc.discount, 25.0);
  assert.equal(calc.taxableAmount, 75.0);
  // 75 * 0.08 = 6.00
  assert.equal(calc.tax, 6.0);
  assert.equal(calc.total, 81.0);
  assert.equal(calc.valid, true);
});

test('calculateOrderTotals catches invalid coupon code safely', () => {
  const items = [{ priceUsd: 50.0 }];
  const calc = calculateOrderTotals(items, 'NONEXISTENT_CODE');

  assert.equal(calc.valid, false);
  assert.equal(calc.discount, 0);
  assert.equal(calc.error, 'Invalid coupon code');
});

test('generateLicenseKey produces correct format and character set', () => {
  const key = generateLicenseKey();
  assert.equal(typeof key, 'string');
  assert.equal(isValidLicenseKeyFormat(key), true);
  assert.equal(key.startsWith('NEX-'), true);
  assert.equal(key.length, 23); // NEX-4444-4444-4444-4444 = 4+5+5+5+4 = 23
});

test('verifyDownloadEntitlement grants instant access to free applications', () => {
  const mockFreeApp = {
    id: 'app-free-1',
    basePriceUsd: 0,
    licenseModel: 'free',
  } as ApplicationRecord;

  const result = verifyDownloadEntitlement(mockFreeApp, []);
  assert.equal(result.authorized, true);
  assert.equal(result.reason, 'free_application');
});

test('verifyDownloadEntitlement requires purchase for paid apps when no entitlement exists', () => {
  const mockPaidApp = {
    id: 'app-paid-1',
    basePriceUsd: 99.0,
    licenseModel: 'perpetual',
  } as ApplicationRecord;

  const result = verifyDownloadEntitlement(mockPaidApp, []);
  assert.equal(result.authorized, false);
  assert.equal(result.reason, 'license_required');
});

test('verifyDownloadEntitlement approves download when active entitlement exists', () => {
  const mockPaidApp = {
    id: 'app-paid-1',
    basePriceUsd: 99.0,
    licenseModel: 'perpetual',
  } as ApplicationRecord;

  const entitlements: Entitlement[] = [
    {
      id: 'ent-1',
      userId: 'usr-1',
      appId: 'app-paid-1',
      licensePlanId: 'plan-1',
      purchasedAt: '2026-10-29T00:00:00Z',
      licenseKey: 'NEX-TEST-1234-5678-9999',
      status: 'active',
      activationsUsed: 1,
      maxActivations: 3,
      activeDevices: [{ deviceName: 'MacBook Pro', platform: 'macos', activatedAt: '2026-10-29T00:00:00Z' }],
    },
  ];

  const result = verifyDownloadEntitlement(mockPaidApp, entitlements);
  assert.equal(result.authorized, true);
  assert.equal(result.reason, 'valid_license');
  assert.equal(result.licenseKey, 'NEX-TEST-1234-5678-9999');
});

test('canActivateDevice respects device limits and duplicates', () => {
  const entitlement: Entitlement = {
    id: 'ent-1',
    userId: 'usr-1',
    appId: 'app-1',
    licensePlanId: 'plan-1',
    purchasedAt: '2026-10-29T00:00:00Z',
    licenseKey: 'NEX-TEST-1234-5678-9999',
    status: 'active',
    activationsUsed: 2,
    maxActivations: 2,
    activeDevices: [
      { deviceName: 'Studio-Mac', platform: 'macos', activatedAt: '2026-10-28T00:00:00Z' },
      { deviceName: 'Linux-Workstation', platform: 'linux', activatedAt: '2026-10-29T00:00:00Z' },
    ],
  };

  // Re-activating the same device should be allowed
  const dupCheck = canActivateDevice(entitlement, 'Studio-Mac', 'macos');
  assert.equal(dupCheck.allowed, true);

  // New device when limit reached should be rejected
  const limitCheck = canActivateDevice(entitlement, 'Surface-Laptop', 'windows');
  assert.equal(limitCheck.allowed, false);
  assert.match(limitCheck.reason || '', /Maximum device activations reached/);
});
