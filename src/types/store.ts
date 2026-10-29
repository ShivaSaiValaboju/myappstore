/**
 * Nexora Store - Core Type Definitions
 * Complete domain data models for cross-platform software store
 */

export type PlatformId = 'macos' | 'windows' | 'linux' | 'android';

export type CpuArchitecture =
  | 'universal'
  | 'apple_silicon'
  | 'intel_x86_64'
  | 'win_x64'
  | 'win_arm64'
  | 'linux_x86_64'
  | 'linux_arm64'
  | 'android_universal'
  | 'android_arm64';

export type PackageFormat =
  | 'dmg'
  | 'pkg'
  | 'exe'
  | 'msi'
  | 'appimage'
  | 'deb'
  | 'rpm'
  | 'tar_gz'
  | 'apk'
  | 'google_play';

export type LicenseModel = 'free' | 'freemium' | 'perpetual' | 'subscription' | 'open_source';

export interface ApplicationBuild {
  id: string;
  appId: string;
  platform: PlatformId;
  architecture: CpuArchitecture;
  architectureLabel: string;
  version: string;
  releaseDate: string;
  packageFormat: PackageFormat;
  packageFormatLabel: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  sha256Checksum: string;
  minOsVersion: string;
  downloadUrl: string; // Internal protected endpoint or official link
  isOfficialStoreListing?: boolean;
  externalStoreUrl?: string;
  requiresLicense: boolean;
  notes?: string;
  verifiedStatus: 'verified' | 'unverified';
}

export interface PlatformSupportMatrix {
  platform: PlatformId;
  supported: boolean;
  statusText: string;
  recommendedBuildId?: string;
  architectures: CpuArchitecture[];
  minRequirements: {
    os: string;
    ram: string;
    storage: string;
    gpu?: string;
  };
}

export interface LicensePlan {
  id: string;
  appId: string;
  name: string;
  tier: 'personal' | 'commercial' | 'studio' | 'free_community';
  priceUsd: number;
  billingPeriod?: 'one_time' | 'monthly' | 'yearly';
  maxDeviceActivations: number;
  features: string[];
  isPopular?: boolean;
}

export interface ApplicationReview {
  id: string;
  appId: string;
  userName: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  date: string;
  platformUsed: PlatformId;
  verifiedBuyer: boolean;
}

export interface ApplicationRecord {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  developer: string;
  developerWebsite?: string;
  category: string;
  secondaryCategory?: string;
  licenseModel: LicenseModel;
  basePriceUsd: number; // 0 for free
  rating: number;
  reviewCount: number;
  featured: boolean;
  editorialBadge?: 'Editor’s Choice' | 'Essential' | 'Developer Pick' | 'Newly Updated';
  iconSvgName: string;
  accentColor: string;
  description: string;
  features: string[];
  supportedPlatforms: PlatformId[];
  platformSupport: Record<PlatformId, PlatformSupportMatrix>;
  builds: ApplicationBuild[];
  licensePlans: LicensePlan[];
  screenshots: { title: string; caption: string; style: string }[];
  changelog: { version: string; date: string; changes: string[] }[];
  faqs: { question: string; answer: string }[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Entitlement {
  id: string;
  userId: string;
  appId: string;
  licensePlanId: string;
  orderId?: string;
  purchasedAt: string;
  licenseKey: string;
  status: 'active' | 'revoked' | 'expired';
  activationsUsed: number;
  maxActivations: number;
  activeDevices: { deviceName: string; platform: PlatformId; activatedAt: string }[];
  lastDownloadedAt?: string;
  lastDownloadedBuildId?: string;
}

export interface CartItem {
  appId: string;
  planId: string;
  appName: string;
  planName: string;
  priceUsd: number;
  developer: string;
  iconSvgName: string;
  accentColor: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  createdAt: string;
  items: {
    appId: string;
    appName: string;
    planId: string;
    planName: string;
    unitPriceUsd: number;
    licenseKey: string;
  }[];
  subtotalUsd: number;
  discountUsd: number;
  couponCode?: string;
  taxUsd: number;
  totalUsd: number;
  paymentMethod: 'demo_credit_card' | 'demo_upi' | 'demo_apple_pay';
  status: 'completed' | 'refunded';
  receiptUrl?: string;
}

export interface DownloadAuthorization {
  token: string;
  appId: string;
  appName: string;
  buildId: string;
  platform: PlatformId;
  version: string;
  filename: string;
  fileSizeBytes: number;
  sha256Checksum: string;
  expiresAt: string;
  downloadUrl: string;
  requiresLicense: boolean;
  entitlementId?: string;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  userEmail: string;
  subject: string;
  message: string;
  category: 'download' | 'license' | 'refund' | 'compatibility' | 'other';
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface StoreCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  appCount: number;
}

export interface OrderCalculation {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  tax: number;
  total: number;
  appliedCoupon?: {
    code: string;
    discountPercentage: number;
    minSubtotal: number;
    description: string;
  };
  valid: boolean;
  error?: string;
}
