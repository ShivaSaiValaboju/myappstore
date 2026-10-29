/**
 * Server database layer with disk persistence (data/nexora-store.json)
 * and rich authentic seed data for cross-platform applications.
 */

import fs from 'node:fs';
import path from 'node:path';
import type {
  ApplicationRecord,
  StoreCategory,
  UserProfile,
  Entitlement,
  OrderRecord,
  SupportTicket,
  ApplicationReview,
} from '../types/store';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'nexora-store.json');

export interface DatabaseSchema {
  categories: StoreCategory[];
  applications: ApplicationRecord[];
  users: (UserProfile & { passwordHash: string })[];
  entitlements: Entitlement[];
  orders: OrderRecord[];
  wishlists: Record<string, string[]>; // userId -> appId[]
  reviews: ApplicationReview[];
  tickets: SupportTicket[];
}

// Initial seed categories
const SEED_CATEGORIES: StoreCategory[] = [
  {
    id: 'cat-developer',
    slug: 'developer-tools',
    name: 'Developer Tools',
    description: 'Terminals, database IDEs, compilers, profilers, and cloud environments',
    icon: 'Terminal',
    appCount: 3,
  },
  {
    id: 'cat-creative',
    slug: 'creative-design',
    name: 'Creative & Design',
    description: 'Vector illustration, motion graphics, audio workstations, and UI prototyping',
    icon: 'PenTool',
    appCount: 3,
  },
  {
    id: 'cat-productivity',
    slug: 'productivity',
    name: 'Productivity & Writing',
    description: 'Markdown editors, technical document suites, and workflow accelerators',
    icon: 'Sparkles',
    appCount: 2,
  },
  {
    id: 'cat-security',
    slug: 'security-utilities',
    name: 'Security & Utilities',
    description: 'Cryptographic key rings, zero-knowledge vaults, and system monitors',
    icon: 'ShieldCheck',
    appCount: 2,
  },
];

// Initial seed applications
const SEED_APPLICATIONS: ApplicationRecord[] = [
  {
    id: 'app-hyperflow',
    slug: 'hyperflow-studio',
    name: 'HyperFlow Studio',
    tagline: 'Professional node-based motion graphics & responsive UI prototype engine',
    developer: 'Voxelwave Labs',
    developerWebsite: 'https://voxelwave.dev/hyperflow',
    category: 'Creative & Design',
    secondaryCategory: 'Developer Tools',
    licenseModel: 'perpetual',
    basePriceUsd: 79.0,
    rating: 4.9,
    reviewCount: 328,
    featured: true,
    editorialBadge: 'Editor’s Choice',
    iconSvgName: 'Layers',
    accentColor: '#8B5CF6',
    description:
      'HyperFlow Studio is an advanced GPU-accelerated motion canvas and responsive design workshop. Built for high-fidelity interactive prototyping, micro-interaction tuning, and fluid multi-timeline exports for modern web, desktop, and mobile products.',
    features: [
      'Multi-timeline spline animation with real-time Bezier physics',
      'Hardware-accelerated Metal, DirectX 12 & Vulkan rendering pipeline',
      'Lottie, SVG, MP4, and WebM lossless vector frame exports',
      'Interactive reactive state machines with zero-code trigger scripting',
      'Color-managed HDR canvas supporting Display P3 & Adobe RGB gamut',
    ],
    supportedPlatforms: ['macos', 'windows', 'linux'],
    platformSupport: {
      macos: {
        platform: 'macos',
        supported: true,
        statusText: 'Native Universal binary optimized for Apple Silicon (M1–M4) and Intel',
        recommendedBuildId: 'build-hyperflow-mac-arm64',
        architectures: ['apple_silicon', 'intel_x86_64', 'universal'],
        minRequirements: {
          os: 'macOS 13.0 Ventura or later',
          ram: '8 GB unified memory (16 GB recommended)',
          storage: '1.2 GB available SSD space',
          gpu: 'Metal 3 capable hardware',
        },
      },
      windows: {
        platform: 'windows',
        supported: true,
        statusText: 'Verified x64 & ARM64 package with DirectX 12 optimization',
        recommendedBuildId: 'build-hyperflow-win-x64',
        architectures: ['win_x64', 'win_arm64'],
        minRequirements: {
          os: 'Windows 11 (64-bit) 22H2 or later',
          ram: '8 GB RAM (16 GB recommended)',
          storage: '1.4 GB available SSD space',
          gpu: 'DirectX 12 feature level 12_0 compatible GPU',
        },
      },
      linux: {
        platform: 'linux',
        supported: true,
        statusText: 'Native AppImage & Debian package with Wayland & X11 support',
        recommendedBuildId: 'build-hyperflow-linux-appimage',
        architectures: ['linux_x86_64'],
        minRequirements: {
          os: 'Ubuntu 22.04 LTS, Fedora 39, Arch Linux or newer',
          ram: '8 GB RAM',
          storage: '1.5 GB available space',
          gpu: 'Vulkan 1.3 capable graphics drivers',
        },
      },
      android: {
        platform: 'android',
        supported: false,
        statusText:
          'HyperFlow Studio is architected exclusively for desktop workstations. A mobile companion viewer is currently in closed beta.',
        architectures: [],
        minRequirements: {
          os: 'Android 12+ (Companion Viewer in Private Beta)',
          ram: '4 GB RAM',
          storage: '150 MB space',
        },
      },
    },
    builds: [
      {
        id: 'build-hyperflow-mac-arm64',
        appId: 'app-hyperflow',
        platform: 'macos',
        architecture: 'apple_silicon',
        architectureLabel: 'Apple Silicon (M1/M2/M3/M4)',
        version: '3.4.1',
        releaseDate: '2026-10-18',
        packageFormat: 'dmg',
        packageFormatLabel: 'Apple Disk Image (.dmg)',
        fileSizeBytes: 218103808,
        fileSizeFormatted: '208 MB',
        sha256Checksum: 'e83a9f821cb984210a48b562e847c9443587b1c3182ef4991104e76d9bf764d1',
        minOsVersion: 'macOS 13.0 Ventura',
        downloadUrl: '/api/downloads/file/hyperflow-studio-3.4.1-arm64.dmg',
        requiresLicense: true,
        verifiedStatus: 'verified',
        notes: 'Notarized by Apple. Optimized with AVX/NEON vector instructions.',
      },
      {
        id: 'build-hyperflow-mac-intel',
        appId: 'app-hyperflow',
        platform: 'macos',
        architecture: 'intel_x86_64',
        architectureLabel: 'Intel x86_64',
        version: '3.4.1',
        releaseDate: '2026-10-18',
        packageFormat: 'dmg',
        packageFormatLabel: 'Apple Disk Image (.dmg)',
        fileSizeBytes: 224395264,
        fileSizeFormatted: '214 MB',
        sha256Checksum: '91d5cb082fa349bc91f45037d0c3eb7203b584e0374e64ba2c7e098492ef51e8',
        minOsVersion: 'macOS 12.0 Monterey',
        downloadUrl: '/api/downloads/file/hyperflow-studio-3.4.1-x86_64.dmg',
        requiresLicense: true,
        verifiedStatus: 'verified',
      },
      {
        id: 'build-hyperflow-win-x64',
        appId: 'app-hyperflow',
        platform: 'windows',
        architecture: 'win_x64',
        architectureLabel: 'Windows x64 (Intel/AMD)',
        version: '3.4.1',
        releaseDate: '2026-10-19',
        packageFormat: 'msi',
        packageFormatLabel: 'Windows Installer Package (.msi)',
        fileSizeBytes: 241172480,
        fileSizeFormatted: '230 MB',
        sha256Checksum: '7c4e519c67be89b023f0442ab3c94892e59dfba4c017bc79f16d9348ec749102',
        minOsVersion: 'Windows 11 / 10 21H2',
        downloadUrl: '/api/downloads/file/hyperflow-studio-3.4.1-win64.msi',
        requiresLicense: true,
        verifiedStatus: 'verified',
        notes: 'Digitally signed with EV Authenticode certificate.',
      },
      {
        id: 'build-hyperflow-linux-appimage',
        appId: 'app-hyperflow',
        platform: 'linux',
        architecture: 'linux_x86_64',
        architectureLabel: 'Linux x86_64',
        version: '3.4.1',
        releaseDate: '2026-10-20',
        packageFormat: 'appimage',
        packageFormatLabel: 'Universal AppImage (.AppImage)',
        fileSizeBytes: 247463936,
        fileSizeFormatted: '236 MB',
        sha256Checksum: 'b3f52c1e6e9a7428f57dc49013e847c1340a6b98687f87db24419cb7d10e82c7',
        minOsVersion: 'glibc 2.31+',
        downloadUrl: '/api/downloads/file/hyperflow-studio-3.4.1-x86_64.AppImage',
        requiresLicense: true,
        verifiedStatus: 'verified',
      },
    ],
    licensePlans: [
      {
        id: 'plan-hf-individual',
        appId: 'app-hyperflow',
        name: 'Individual Creator License',
        tier: 'personal',
        priceUsd: 79.0,
        billingPeriod: 'one_time',
        maxDeviceActivations: 2,
        features: [
          'Perpetual license for 1 user across 2 personal devices',
          'Free updates for all v3.x releases',
          'Commercial project export rights',
          'Full offline rendering capabilities',
        ],
        isPopular: true,
      },
      {
        id: 'plan-hf-studio',
        appId: 'app-hyperflow',
        name: 'Studio Workstation Pack',
        tier: 'studio',
        priceUsd: 189.0,
        billingPeriod: 'one_time',
        maxDeviceActivations: 5,
        features: [
          'Floating workstation license for up to 5 team devices',
          'Team asset sync & shared component libraries',
          'Priority direct email & technical desk support',
          'Early access to experimental v4 alpha builds',
        ],
      },
    ],
    screenshots: [
      {
        title: 'Timeline & Kinetic Curve Editor',
        caption: 'Fine-tune Bezier velocity curves with sub-millisecond precision.',
        style: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      },
      {
        title: 'Multi-device Responsive Preview',
        caption: 'Simultaneously view viewport reflow across macOS, Windows, and mobile viewports.',
        style: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
      {
        title: 'Node-based Logic Graph',
        caption: 'Connect UI interaction events into zero-latency reactive state machines.',
        style: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
      },
    ],
    changelog: [
      {
        version: '3.4.1',
        date: '2026-10-18',
        changes: [
          'Added native hardware-accelerated AV1 timeline decoding for Linux and Windows.',
          'Resolved an intermittent sub-pixel rounding glitch during SVG path batch export.',
          'Reduced memory consumption when caching high-resolution HDR color profiles.',
        ],
      },
      {
        version: '3.4.0',
        date: '2026-09-25',
        changes: [
          'Introduced full Apple Silicon M4 unified memory pipeline optimizations.',
          'Added interactive spring physics easing curves to the timeline toolbox.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does the license require an active internet connection to run?',
        answer:
          'No. SAHRIVA Store issues verified cryptographic license keys that validate locally on your device. Once activated, HyperFlow works 100% offline.',
      },
      {
        question: 'Can I install this on both my Mac laptop and Windows desktop?',
        answer:
          'Yes! The Individual Creator license permits activating up to 2 machines of any supported operating system owned by you.',
      },
    ],
  },
  {
    id: 'app-orbit-terminal',
    slug: 'orbit-terminal',
    name: 'Orbit Terminal',
    tagline: 'Ultra-low-latency GPU-accelerated terminal and cloud environment orchestrator',
    developer: 'Hexagon Systems',
    developerWebsite: 'https://orbit-term.dev',
    category: 'Developer Tools',
    secondaryCategory: 'Security & Utilities',
    licenseModel: 'freemium',
    basePriceUsd: 0.0,
    rating: 4.95,
    reviewCount: 842,
    featured: true,
    editorialBadge: 'Essential',
    iconSvgName: 'Terminal',
    accentColor: '#38BDF8',
    description:
      'Orbit Terminal is built from the ground up in Rust with a customized GPU text rendering engine that renders at sustained 120 FPS. Features split panes, multiplexed SSH sessions, integrated Docker container inspectors, and AI-free deterministic command completion.',
    features: [
      'Sub-millisecond input-to-photon latency with Metal & Vulkan glyph rasterization',
      'Multiplexed multi-pane workspace with seamless session restore across restarts',
      'Integrated remote SSH tunnel manager with hardware FIDO2 key support',
      'TrueColor 24-bit RGB with automatic Sixel and Kitty graphics protocol support',
      'Zero telemetry, zero third-party analytics, 100% locally audited execution',
    ],
    supportedPlatforms: ['macos', 'windows', 'linux', 'android'],
    platformSupport: {
      macos: {
        platform: 'macos',
        supported: true,
        statusText: 'Native Universal build with Metal glyph caching and Touch Bar support',
        recommendedBuildId: 'build-orbit-mac-universal',
        architectures: ['apple_silicon', 'intel_x86_64', 'universal'],
        minRequirements: {
          os: 'macOS 12.0 Monterey or later',
          ram: '4 GB RAM',
          storage: '85 MB available space',
          gpu: 'Metal capable graphics',
        },
      },
      windows: {
        platform: 'windows',
        supported: true,
        statusText: 'Native Windows x64 and ARM64 MSI installer with Windows Terminal integration',
        recommendedBuildId: 'build-orbit-win-x64',
        architectures: ['win_x64', 'win_arm64'],
        minRequirements: {
          os: 'Windows 10 (1903+) or Windows 11',
          ram: '4 GB RAM',
          storage: '95 MB available space',
        },
      },
      linux: {
        platform: 'linux',
        supported: true,
        statusText: 'Officially maintained AppImage, Debian (.deb) & RPM packages',
        recommendedBuildId: 'build-orbit-linux-deb',
        architectures: ['linux_x86_64', 'linux_arm64'],
        minRequirements: {
          os: 'Any modern Linux distribution with glibc 2.28+',
          ram: '2 GB RAM',
          storage: '80 MB available space',
        },
      },
      android: {
        platform: 'android',
        supported: true,
        statusText: 'Official companion SSH & remote terminal client on Google Play and direct APK',
        recommendedBuildId: 'build-orbit-android-apk',
        architectures: ['android_arm64', 'android_universal'],
        minRequirements: {
          os: 'Android 10.0 (API level 29) or later',
          ram: '2 GB RAM',
          storage: '35 MB space',
        },
      },
    },
    builds: [
      {
        id: 'build-orbit-mac-universal',
        appId: 'app-orbit-terminal',
        platform: 'macos',
        architecture: 'universal',
        architectureLabel: 'Universal Binary (Apple Silicon + Intel)',
        version: '2.8.0',
        releaseDate: '2026-10-24',
        packageFormat: 'dmg',
        packageFormatLabel: 'Apple Disk Image (.dmg)',
        fileSizeBytes: 67108864,
        fileSizeFormatted: '64 MB',
        sha256Checksum: '58f766324a0d922bc3efd0a876a3e1445b497b79da93b749d0383184cfcf38bc',
        minOsVersion: 'macOS 12.0',
        downloadUrl: '/api/downloads/file/orbit-terminal-2.8.0-universal.dmg',
        requiresLicense: false,
        verifiedStatus: 'verified',
      },
      {
        id: 'build-orbit-win-x64',
        appId: 'app-orbit-terminal',
        platform: 'windows',
        architecture: 'win_x64',
        architectureLabel: 'Windows x64 (.msi)',
        version: '2.8.0',
        releaseDate: '2026-10-24',
        packageFormat: 'msi',
        packageFormatLabel: 'Windows Installer (.msi)',
        fileSizeBytes: 73400320,
        fileSizeFormatted: '70 MB',
        sha256Checksum: '419ce3f46a9b9a67e45e9987f0b987541240c0362143ad07584102c9823f03b5',
        minOsVersion: 'Windows 10/11',
        downloadUrl: '/api/downloads/file/orbit-terminal-2.8.0-x64.msi',
        requiresLicense: false,
        verifiedStatus: 'verified',
      },
      {
        id: 'build-orbit-linux-deb',
        appId: 'app-orbit-terminal',
        platform: 'linux',
        architecture: 'linux_x86_64',
        architectureLabel: 'Linux x86_64 (.deb)',
        version: '2.8.0',
        releaseDate: '2026-10-24',
        packageFormat: 'deb',
        packageFormatLabel: 'Debian Package (.deb)',
        fileSizeBytes: 61865984,
        fileSizeFormatted: '59 MB',
        sha256Checksum: '3c85f768b449b772093d5be7769cf949a885be093b584025a176e33db37328bf',
        minOsVersion: 'glibc 2.28+',
        downloadUrl: '/api/downloads/file/orbit-terminal_2.8.0_amd64.deb',
        requiresLicense: false,
        verifiedStatus: 'verified',
      },
      {
        id: 'build-orbit-android-apk',
        appId: 'app-orbit-terminal',
        platform: 'android',
        architecture: 'android_arm64',
        architectureLabel: 'Android ARM64 APK',
        version: '2.8.0',
        releaseDate: '2026-10-25',
        packageFormat: 'apk',
        packageFormatLabel: 'Android Package Kit (.apk)',
        fileSizeBytes: 33554432,
        fileSizeFormatted: '32 MB',
        sha256Checksum: 'a87265cdb98462002319ef47812bb09c62934149fa5489066cb5561a0303ec41',
        minOsVersion: 'Android 10.0+',
        downloadUrl: '/api/downloads/file/orbit-terminal-companion-2.8.0.apk',
        isOfficialStoreListing: true,
        externalStoreUrl: 'https://play.google.com/store/apps/details?id=dev.hexagonsystems.orbit',
        requiresLicense: false,
        verifiedStatus: 'verified',
        notes: 'Also available officially on Google Play. Verified publisher APK provided here.',
      },
    ],
    licensePlans: [
      {
        id: 'plan-orbit-free',
        appId: 'app-orbit-terminal',
        name: 'Community Open Core',
        tier: 'free_community',
        priceUsd: 0.0,
        maxDeviceActivations: 10,
        features: [
          'Full core GPU terminal emulation without artificial restrictions',
          'Unlimited tabs, panes, and custom shell profiles',
          'Offline documentation and community forum support',
        ],
      },
      {
        id: 'plan-orbit-pro',
        appId: 'app-orbit-terminal',
        name: 'Orbit Pro Developer Pass',
        tier: 'personal',
        priceUsd: 39.0,
        billingPeriod: 'one_time',
        maxDeviceActivations: 3,
        features: [
          'Encrypted cloud session synchronization (end-to-end client encrypted)',
          'Automated SSH key rotation with YubiKey hardware integration',
          'Custom GPU shader backgrounds and audio bell themes',
          'Direct ticket support from core maintainers',
        ],
        isPopular: true,
      },
    ],
    screenshots: [
      {
        title: 'Multiplexed Quad-Pane Grid',
        caption: 'Run 4 parallel shells with synchronous input mirroring across remote hosts.',
        style: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
      },
      {
        title: 'Hardware Key SSH Management',
        caption: 'One-click authenticate into staging clusters using hardware security keys.',
        style: 'linear-gradient(135deg, #0c4a6e 0%, #082f49 100%)',
      },
    ],
    changelog: [
      {
        version: '2.8.0',
        date: '2026-10-24',
        changes: [
          'Rewrote font shaping engine with HarfBuzz 10.0 for seamless ligatures and emoji.',
          'Added automatic window transparency switching when focusing other apps.',
          'Upgraded Android companion client with full physical Bluetooth keyboard mapping.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is the core terminal really free?',
        answer: 'Yes! The Community edition has no time limits, no telemetry, and can be downloaded immediately.',
      },
    ],
  },
  {
    id: 'app-pixelforge',
    slug: 'pixelforge-vector',
    name: 'PixelForge Vector',
    tagline: 'High-precision vector illustration, iconography, and typography workstation',
    developer: 'Atelier Foundry',
    developerWebsite: 'https://atelierfoundry.com/pixelforge',
    category: 'Creative & Design',
    licenseModel: 'perpetual',
    basePriceUsd: 59.0,
    rating: 4.88,
    reviewCount: 412,
    featured: true,
    editorialBadge: 'Developer Pick',
    iconSvgName: 'PenTool',
    accentColor: '#EC4899',
    description:
      'PixelForge Vector is crafted for digital illustrators, icon designers, and brand identity creators who demand pixel-exact grid alignment, mathematical precision curves, and zero-compromise SVG cleanliness.',
    features: [
      'Sub-pixel boolean geometry operations with non-destructive live booleans',
      'Variable font editor with instant OpenType feature inspector',
      'Batch asset slice export with automatic @1x, @2x, @3x, webp, and svg presets',
      'Advanced isometric grid generators and axonometric projection guides',
    ],
    supportedPlatforms: ['macos', 'windows', 'linux'],
    platformSupport: {
      macos: {
        platform: 'macos',
        supported: true,
        statusText: 'Native macOS DMG with Apple Pencil sidecar support on iPad',
        recommendedBuildId: 'build-pixel-mac-universal',
        architectures: ['universal', 'apple_silicon'],
        minRequirements: { os: 'macOS 13.0+', ram: '8 GB RAM', storage: '450 MB space' },
      },
      windows: {
        platform: 'windows',
        supported: true,
        statusText: 'Verified x64 installer with Microsoft Pen Protocol stylus support',
        recommendedBuildId: 'build-pixel-win-x64',
        architectures: ['win_x64'],
        minRequirements: { os: 'Windows 11 / 10 64-bit', ram: '8 GB RAM', storage: '500 MB space' },
      },
      linux: {
        platform: 'linux',
        supported: true,
        statusText: 'Verified AppImage with Wacom tablet pressure support',
        recommendedBuildId: 'build-pixel-linux-appimage',
        architectures: ['linux_x86_64'],
        minRequirements: { os: 'Ubuntu 22.04+ or Arch Linux', ram: '8 GB RAM', storage: '480 MB space' },
      },
      android: {
        platform: 'android',
        supported: false,
        statusText:
          'PixelForge desktop requires dual-monitor workstation precision. A tablet drawing companion is in planning.',
        architectures: [],
        minRequirements: { os: 'Unsupported', ram: '-', storage: '-' },
      },
    },
    builds: [
      {
        id: 'build-pixel-mac-universal',
        appId: 'app-pixelforge',
        platform: 'macos',
        architecture: 'universal',
        architectureLabel: 'macOS Universal (Apple Silicon / Intel)',
        version: '4.1.2',
        releaseDate: '2026-10-15',
        packageFormat: 'dmg',
        packageFormatLabel: 'Apple Disk Image (.dmg)',
        fileSizeBytes: 146800640,
        fileSizeFormatted: '140 MB',
        sha256Checksum: '44fa9012bbec32981045f8e6c71029e09d84c17228a49c69024fbc21004ea189',
        minOsVersion: 'macOS 13.0',
        downloadUrl: '/api/downloads/file/pixelforge-vector-4.1.2.dmg',
        requiresLicense: true,
        verifiedStatus: 'verified',
      },
      {
        id: 'build-pixel-win-x64',
        appId: 'app-pixelforge',
        platform: 'windows',
        architecture: 'win_x64',
        architectureLabel: 'Windows x64 (.exe)',
        version: '4.1.2',
        releaseDate: '2026-10-15',
        packageFormat: 'exe',
        packageFormatLabel: 'Windows Executable (.exe)',
        fileSizeBytes: 157286400,
        fileSizeFormatted: '150 MB',
        sha256Checksum: '900bfa512ce240f931d8e1329cb19047b1e84ca398c09247193b047c92bfa034',
        minOsVersion: 'Windows 10/11',
        downloadUrl: '/api/downloads/file/pixelforge-vector-setup-4.1.2.exe',
        requiresLicense: true,
        verifiedStatus: 'verified',
      },
    ],
    licensePlans: [
      {
        id: 'plan-pixel-standard',
        appId: 'app-pixelforge',
        name: 'Commercial Creator License',
        tier: 'personal',
        priceUsd: 59.0,
        billingPeriod: 'one_time',
        maxDeviceActivations: 2,
        features: [
          'Full commercial royalty-free design creation',
          'Activation on up to 2 workstations',
          'Free minor updates through v4.x series',
        ],
        isPopular: true,
      },
    ],
    screenshots: [
      {
        title: 'Precision Pen & Geometry Curve Workbench',
        caption: 'Create micro-level icons aligned strictly to 16px and 24px pixel grids.',
        style: 'linear-gradient(135deg, #831843 0%, #9d174d 100%)',
      },
    ],
    changelog: [
      {
        version: '4.1.2',
        date: '2026-10-15',
        changes: ['Enhanced SVG clean exporter to strip redundant namespace tags.', 'Added native macOS Sonoma menu bar widget.'],
      },
    ],
    faqs: [
      {
        question: 'Are exports watermarked before purchase?',
        answer: 'You can test in trial mode; purchased licenses remove trial dialogs and enable full batch exporting.',
      },
    ],
  },
  {
    id: 'app-vortex-db',
    slug: 'vortex-db-studio',
    name: 'Vortex DB Studio',
    tagline: 'Modern visual database client, query profiler & schema migration manager',
    developer: 'Vortex Data Labs',
    developerWebsite: 'https://vortexdb.io',
    category: 'Developer Tools',
    licenseModel: 'freemium',
    basePriceUsd: 45.0,
    rating: 4.92,
    reviewCount: 519,
    featured: true,
    editorialBadge: 'Newly Updated',
    iconSvgName: 'Database',
    accentColor: '#10B981',
    description:
      'Vortex DB Studio connects securely to PostgreSQL, MySQL, SQLite, DuckDB, Redis, and ClickHouse. Features an interactive ERD schema diagram builder, visual query plan tree analyzer, and encrypted SSH bastion tunnel management.',
    features: [
      'Interactive visual EXPLAIN plan visualizer with cost bottleneck highlighting',
      'Bidirectional schema synchronization with automated DDL migration generation',
      'Zero-latency autocomplete against large schemas (10,000+ tables)',
      'Built-in data masking and anonymization for compliance with GDPR & HIPAA',
    ],
    supportedPlatforms: ['macos', 'windows', 'linux'],
    platformSupport: {
      macos: {
        platform: 'macos',
        supported: true,
        statusText: 'Native Universal DMG with Apple Keychain integration',
        recommendedBuildId: 'build-vortex-mac',
        architectures: ['universal', 'apple_silicon'],
        minRequirements: { os: 'macOS 12.0+', ram: '4 GB RAM', storage: '210 MB' },
      },
      windows: {
        platform: 'windows',
        supported: true,
        statusText: 'Verified x64 installer with Windows Credential Manager integration',
        recommendedBuildId: 'build-vortex-win',
        architectures: ['win_x64'],
        minRequirements: { os: 'Windows 10/11', ram: '4 GB RAM', storage: '230 MB' },
      },
      linux: {
        platform: 'linux',
        supported: true,
        statusText: 'Verified DEB & AppImage with SecretService API support',
        recommendedBuildId: 'build-vortex-linux',
        architectures: ['linux_x86_64'],
        minRequirements: { os: 'Ubuntu 20.04+, Fedora 38+', ram: '4 GB RAM', storage: '220 MB' },
      },
      android: {
        platform: 'android',
        supported: false,
        statusText: 'Not supported on mobile due to complex multi-monitor database administration requirements.',
        architectures: [],
        minRequirements: { os: 'Unsupported', ram: '-', storage: '-' },
      },
    },
    builds: [
      {
        id: 'build-vortex-mac',
        appId: 'app-vortex-db',
        platform: 'macos',
        architecture: 'universal',
        architectureLabel: 'macOS Universal (Apple Silicon / Intel)',
        version: '1.9.4',
        releaseDate: '2026-10-22',
        packageFormat: 'dmg',
        packageFormatLabel: 'Apple Disk Image (.dmg)',
        fileSizeBytes: 115343360,
        fileSizeFormatted: '110 MB',
        sha256Checksum: 'd7a98b10492cb3e47610498b584e0374e64ba2c7e098492ef51e891d5cb082fa',
        minOsVersion: 'macOS 12.0',
        downloadUrl: '/api/downloads/file/vortex-db-studio-1.9.4.dmg',
        requiresLicense: true,
        verifiedStatus: 'verified',
      },
      {
        id: 'build-vortex-win',
        appId: 'app-vortex-db',
        platform: 'windows',
        architecture: 'win_x64',
        architectureLabel: 'Windows x64 (.msi)',
        version: '1.9.4',
        releaseDate: '2026-10-22',
        packageFormat: 'msi',
        packageFormatLabel: 'Windows Installer (.msi)',
        fileSizeBytes: 125829120,
        fileSizeFormatted: '120 MB',
        sha256Checksum: '2b09c62934149fa5489066cb5561a0303ec41a87265cdb98462002319ef47812',
        minOsVersion: 'Windows 10/11',
        downloadUrl: '/api/downloads/file/vortex-db-studio-1.9.4.msi',
        requiresLicense: true,
        verifiedStatus: 'verified',
      },
    ],
    licensePlans: [
      {
        id: 'plan-vortex-community',
        appId: 'app-vortex-db',
        name: 'Community Open Access',
        tier: 'free_community',
        priceUsd: 0.0,
        maxDeviceActivations: 1,
        features: ['Up to 3 concurrent database connections', 'Full SQL editor with syntax formatting', 'Table data filtering & export to CSV'],
      },
      {
        id: 'plan-vortex-pro',
        appId: 'app-vortex-db',
        name: 'Professional Data Engineer',
        tier: 'personal',
        priceUsd: 45.0,
        billingPeriod: 'one_time',
        maxDeviceActivations: 3,
        features: [
          'Unlimited concurrent database connections & SSH jump bastions',
          'Visual ERD schema generator and visual migration diff tool',
          'Query execution plan analyzer with index recommendations',
          '3 device activations across macOS, Windows, and Linux',
        ],
        isPopular: true,
      },
    ],
    screenshots: [
      {
        title: 'Visual EXPLAIN Plan Cost Analyzer',
        caption: 'Inspect nested loops and sequential scans with millisecond timing graphs.',
        style: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
      },
    ],
    changelog: [
      {
        version: '1.9.4',
        date: '2026-10-22',
        changes: ['Added DuckDB v1.1 file connection support.', 'Improved dark mode contrast for high-density tables.'],
      },
    ],
    faqs: [
      {
        question: 'Are my database credentials stored securely?',
        answer: 'All connection strings and passwords are encrypted using your operating system’s secure hardware keychain (Apple Keychain, Windows Credential Vault, or libsecret).',
      },
    ],
  },
  {
    id: 'app-cipherguard',
    slug: 'cipherguard-pro',
    name: 'CipherGuard Pro',
    tagline: 'Zero-knowledge local password vault, SSH identity manager & 2FA authenticator',
    developer: 'Crypta Works',
    developerWebsite: 'https://cryptaworks.security/cipherguard',
    category: 'Security & Utilities',
    licenseModel: 'perpetual',
    basePriceUsd: 29.0,
    rating: 4.96,
    reviewCount: 684,
    featured: false,
    editorialBadge: 'Essential',
    iconSvgName: 'ShieldCheck',
    accentColor: '#6366F1',
    description:
      'CipherGuard Pro stores your sensitive credentials, SSH identities, and one-time passwords in a locally encrypted SQLite vault using AES-256-GCM and Argon2id key derivation. No mandatory cloud accounts, no data mining.',
    features: [
      'Pure local Argon2id key derivation with biometric Touch ID / Windows Hello unlock',
      'Built-in SSH agent with automated passphrase caching and key expiration',
      'Encrypted peer-to-peer Wi-Fi synchronization without third-party servers',
      'Breached password detector using k-anonymity hash queries',
    ],
    supportedPlatforms: ['macos', 'windows', 'linux', 'android'],
    platformSupport: {
      macos: {
        platform: 'macos',
        supported: true,
        statusText: 'Native Universal binary with Touch ID biometric unlock',
        recommendedBuildId: 'build-cipher-mac',
        architectures: ['universal', 'apple_silicon'],
        minRequirements: { os: 'macOS 12.0+', ram: '2 GB RAM', storage: '45 MB' },
      },
      windows: {
        platform: 'windows',
        supported: true,
        statusText: 'Verified x64 installer with Windows Hello biometric support',
        recommendedBuildId: 'build-cipher-win',
        architectures: ['win_x64'],
        minRequirements: { os: 'Windows 10/11', ram: '2 GB RAM', storage: '50 MB' },
      },
      linux: {
        platform: 'linux',
        supported: true,
        statusText: 'AppImage, DEB, and RPM with PAM authentication integration',
        recommendedBuildId: 'build-cipher-linux',
        architectures: ['linux_x86_64'],
        minRequirements: { os: 'Any modern Linux with PAM', ram: '2 GB RAM', storage: '48 MB' },
      },
      android: {
        platform: 'android',
        supported: true,
        statusText: 'Native Android APK with BiometricPrompt & Autofill API integration',
        recommendedBuildId: 'build-cipher-android',
        architectures: ['android_universal'],
        minRequirements: { os: 'Android 9.0 (Pie)+', ram: '2 GB RAM', storage: '25 MB' },
      },
    },
    builds: [
      {
        id: 'build-cipher-mac',
        appId: 'app-cipherguard',
        platform: 'macos',
        architecture: 'universal',
        architectureLabel: 'macOS Universal (Apple Silicon & Intel)',
        version: '5.2.0',
        releaseDate: '2026-10-12',
        packageFormat: 'dmg',
        packageFormatLabel: 'Apple Disk Image (.dmg)',
        fileSizeBytes: 47185920,
        fileSizeFormatted: '45 MB',
        sha256Checksum: '1104e76d9bf764d1e83a9f821cb984210a48b562e847c9443587b1c3182ef499',
        minOsVersion: 'macOS 12.0',
        downloadUrl: '/api/downloads/file/cipherguard-pro-5.2.0.dmg',
        requiresLicense: true,
        verifiedStatus: 'verified',
      },
      {
        id: 'build-cipher-win',
        appId: 'app-cipherguard',
        platform: 'windows',
        architecture: 'win_x64',
        architectureLabel: 'Windows x64 (.msi)',
        version: '5.2.0',
        releaseDate: '2026-10-12',
        packageFormat: 'msi',
        packageFormatLabel: 'Windows Installer (.msi)',
        fileSizeBytes: 52428800,
        fileSizeFormatted: '50 MB',
        sha256Checksum: '2c7e098492ef51e891d5cb082fa349bc91f45037d0c3eb7203b584e0374e64ba',
        minOsVersion: 'Windows 10/11',
        downloadUrl: '/api/downloads/file/cipherguard-pro-5.2.0.msi',
        requiresLicense: true,
        verifiedStatus: 'verified',
      },
      {
        id: 'build-cipher-android',
        appId: 'app-cipherguard',
        platform: 'android',
        architecture: 'android_universal',
        architectureLabel: 'Android Universal APK',
        version: '5.2.0',
        releaseDate: '2026-10-13',
        packageFormat: 'apk',
        packageFormatLabel: 'Android Package (.apk)',
        fileSizeBytes: 26214400,
        fileSizeFormatted: '25 MB',
        sha256Checksum: '87db24419cb7d10e82c7b3f52c1e6e9a7428f57dc49013e847c1340a6b98687f',
        minOsVersion: 'Android 9.0+',
        downloadUrl: '/api/downloads/file/cipherguard-5.2.0.apk',
        isOfficialStoreListing: true,
        externalStoreUrl: 'https://play.google.com/store/apps/details?id=security.cryptaworks.cipherguard',
        requiresLicense: true,
        verifiedStatus: 'verified',
      },
    ],
    licensePlans: [
      {
        id: 'plan-cipher-lifetime',
        appId: 'app-cipherguard',
        name: 'Lifetime Security Pass',
        tier: 'personal',
        priceUsd: 29.0,
        billingPeriod: 'one_time',
        maxDeviceActivations: 5,
        features: [
          'Full activation across 5 devices (macOS, Windows, Linux, Android)',
          'Local encrypted P2P synchronization with zero cloud dependence',
          'Free lifetime security patches and database updates',
        ],
        isPopular: true,
      },
    ],
    screenshots: [
      {
        title: 'Argon2id Encrypted Vault & SSH Passkeys',
        caption: 'Manage SSH keyrings, TOTP authenticator tokens, and credentials in one dark interface.',
        style: 'linear-gradient(135deg, #312e81 0%, #3730a3 100%)',
      },
    ],
    changelog: [
      {
        version: '5.2.0',
        date: '2026-10-12',
        changes: ['Integrated passkey generation via FIDO2 WebAuthn standard.', 'Upgraded Argon2id memory iterations.'],
      },
    ],
    faqs: [
      {
        question: 'What happens if I lose my master passphrase?',
        answer: 'Because CipherGuard uses genuine zero-knowledge local encryption, no master backdoors exist. Always keep an encrypted paper emergency recovery sheet.',
      },
    ],
  },
  {
    id: 'app-zenith-editor',
    slug: 'zenith-markdown',
    name: 'Zenith Markdown Editor',
    tagline: 'Distraction-free technical writing suite, LaTeX mathematics & static site publisher',
    developer: 'Open Zenith Foundation',
    developerWebsite: 'https://zenith-editor.org',
    category: 'Productivity & Writing',
    licenseModel: 'open_source',
    basePriceUsd: 0.0,
    rating: 4.91,
    reviewCount: 920,
    featured: false,
    editorialBadge: 'Essential',
    iconSvgName: 'Sparkles',
    accentColor: '#F59E0B',
    description:
      'Zenith is a free and open-source technical writing canvas. Offers lightning-quick live preview, KaTeX mathematical typesetting, Mermaid flowcharts, and one-click export to PDF, ePub, and Astro/Hugo static sites.',
    features: [
      'Instant KaTeX rendering with automatic equation numbering',
      'Interactive Mermaid, PlantUML, and Vega-Lite chart rendering',
      'Zero proprietary lock-in: reads and writes standard Markdown and YAML frontmatter',
      'Distraction-free typewriter scrolling with ambient focus lighting',
    ],
    supportedPlatforms: ['macos', 'windows', 'linux', 'android'],
    platformSupport: {
      macos: {
        platform: 'macos',
        supported: true,
        statusText: 'Native Universal binary with custom macOS typography controls',
        recommendedBuildId: 'build-zenith-mac',
        architectures: ['universal'],
        minRequirements: { os: 'macOS 11.0+', ram: '2 GB RAM', storage: '70 MB' },
      },
      windows: {
        platform: 'windows',
        supported: true,
        statusText: 'Verified Windows x64 executable installer',
        recommendedBuildId: 'build-zenith-win',
        architectures: ['win_x64'],
        minRequirements: { os: 'Windows 10/11', ram: '2 GB RAM', storage: '75 MB' },
      },
      linux: {
        platform: 'linux',
        supported: true,
        statusText: 'Universal AppImage and Debian package',
        recommendedBuildId: 'build-zenith-linux',
        architectures: ['linux_x86_64'],
        minRequirements: { os: 'Any modern Linux', ram: '2 GB RAM', storage: '70 MB' },
      },
      android: {
        platform: 'android',
        supported: true,
        statusText: 'Official Android APK with Bluetooth keyboard shortcuts',
        recommendedBuildId: 'build-zenith-android',
        architectures: ['android_universal'],
        minRequirements: { os: 'Android 8.0+', ram: '2 GB RAM', storage: '20 MB' },
      },
    },
    builds: [
      {
        id: 'build-zenith-mac',
        appId: 'app-zenith-editor',
        platform: 'macos',
        architecture: 'universal',
        architectureLabel: 'macOS Universal (.dmg)',
        version: '3.1.0',
        releaseDate: '2026-10-08',
        packageFormat: 'dmg',
        packageFormatLabel: 'Apple Disk Image (.dmg)',
        fileSizeBytes: 73400320,
        fileSizeFormatted: '70 MB',
        sha256Checksum: '9bf764d1e83a9f821cb984210a48b562e847c9443587b1c3182ef4991104e76d',
        minOsVersion: 'macOS 11.0',
        downloadUrl: '/api/downloads/file/zenith-editor-3.1.0.dmg',
        requiresLicense: false,
        verifiedStatus: 'verified',
      },
      {
        id: 'build-zenith-win',
        appId: 'app-zenith-editor',
        platform: 'windows',
        architecture: 'win_x64',
        architectureLabel: 'Windows x64 (.exe)',
        version: '3.1.0',
        releaseDate: '2026-10-08',
        packageFormat: 'exe',
        packageFormatLabel: 'Windows Executable (.exe)',
        fileSizeBytes: 78643200,
        fileSizeFormatted: '75 MB',
        sha256Checksum: 'e0374e64ba2c7e098492ef51e891d5cb082fa349bc91f45037d0c3eb7203b584',
        minOsVersion: 'Windows 10/11',
        downloadUrl: '/api/downloads/file/zenith-editor-setup-3.1.0.exe',
        requiresLicense: false,
        verifiedStatus: 'verified',
      },
    ],
    licensePlans: [
      {
        id: 'plan-zenith-foss',
        appId: 'app-zenith-editor',
        name: 'Open Source Community Edition',
        tier: 'free_community',
        priceUsd: 0.0,
        maxDeviceActivations: 100,
        features: ['100% Free and Open Source (MIT License)', 'No subscriptions, no accounts, unlimited devices'],
      },
    ],
    screenshots: [
      {
        title: 'Live KaTeX Mathematics Preview',
        caption: 'Type complex mathematical formulas and see instant rendered typography.',
        style: 'linear-gradient(135deg, #78350f 0%, #92400e 100%)',
      },
    ],
    changelog: [
      {
        version: '3.1.0',
        date: '2026-10-08',
        changes: ['Upgraded KaTeX engine to 0.16.11.', 'Added native typography ligature support.'],
      },
    ],
    faqs: [
      {
        question: 'Is Zenith completely free?',
        answer: 'Yes, Zenith is distributed under the MIT license with full source code available on GitHub.',
      },
    ],
  },
];

// Initial seed reviews
const SEED_REVIEWS: ApplicationReview[] = [
  {
    id: 'rev-1',
    appId: 'app-hyperflow',
    userName: 'Elena Rostova',
    rating: 5,
    title: 'Flawless Apple Silicon optimization',
    comment:
      'The multi-timeline rendering on my M3 Max is completely seamless. Exports to SVG and Lottie are mathematically pristine. Worth every penny of the perpetual license.',
    date: '2026-10-21',
    platformUsed: 'macos',
    verifiedBuyer: true,
  },
  {
    id: 'rev-2',
    appId: 'app-hyperflow',
    userName: 'Marcus Vance',
    rating: 5,
    title: 'DirectX 12 backend runs like butter on Windows 11',
    comment:
      'Finally a modern design tool that doesn’t lag under heavy node trees. The EV signed MSI installed without annoying SmartScreen flags.',
    date: '2026-10-23',
    platformUsed: 'windows',
    verifiedBuyer: true,
  },
  {
    id: 'rev-3',
    appId: 'app-orbit-terminal',
    userName: 'Devin Thorne',
    rating: 5,
    title: 'Replaced Alacritty and WezTerm on all my machines',
    comment:
      'The zero-latency glyph caching is noticeable immediately. Having the exact same config sync seamlessly to my Linux server and Mac laptop is unbeatable.',
    date: '2026-10-25',
    platformUsed: 'linux',
    verifiedBuyer: true,
  },
];

// Initial demo users
const SEED_USERS: (UserProfile & { passwordHash: string })[] = [
  {
    id: 'user-demo-1',
    email: 'alex.chen@nexora.io',
    name: 'Alex Chen',
    role: 'user',
    createdAt: '2026-09-01T10:00:00Z',
    passwordHash: 'demo_password_hash',
  },
  {
    id: 'user-admin-1',
    email: 'admin@nexorastore.com',
    name: 'Administrator',
    role: 'admin',
    createdAt: '2026-08-15T08:00:00Z',
    passwordHash: 'admin_password_hash',
  },
];

// Initial demo entitlements for alex.chen
const SEED_ENTITLEMENTS: Entitlement[] = [
  {
    id: 'ent-demo-1',
    userId: 'user-demo-1',
    appId: 'app-hyperflow',
    licensePlanId: 'plan-hf-individual',
    orderId: 'ord-1001',
    purchasedAt: '2026-10-10T14:22:00Z',
    licenseKey: 'NEX-HF84-9128-4491-K92X',
    status: 'active',
    activationsUsed: 1,
    maxActivations: 2,
    activeDevices: [
      {
        deviceName: 'MacBook Pro (M3 Max)',
        platform: 'macos',
        activatedAt: '2026-10-10T14:25:00Z',
      },
    ],
    lastDownloadedAt: '2026-10-20T11:00:00Z',
    lastDownloadedBuildId: 'build-hyperflow-mac-arm64',
  },
  {
    id: 'ent-demo-2',
    userId: 'user-demo-1',
    appId: 'app-orbit-terminal',
    licensePlanId: 'plan-orbit-free',
    purchasedAt: '2026-10-12T09:15:00Z',
    licenseKey: 'NEX-ORBT-COMM-UN1T-FREE',
    status: 'active',
    activationsUsed: 2,
    maxActivations: 10,
    activeDevices: [
      {
        deviceName: 'MacBook Pro (M3 Max)',
        platform: 'macos',
        activatedAt: '2026-10-12T09:16:00Z',
      },
      {
        deviceName: 'Arch Workstation',
        platform: 'linux',
        activatedAt: '2026-10-14T18:40:00Z',
      },
    ],
    lastDownloadedAt: '2026-10-24T16:00:00Z',
    lastDownloadedBuildId: 'build-orbit-mac-universal',
  },
];

const SEED_ORDERS: OrderRecord[] = [
  {
    id: 'ord-1001',
    orderNumber: 'NEX-2026-1001',
    userId: 'user-demo-1',
    userEmail: 'alex.chen@nexora.io',
    createdAt: '2026-10-10T14:22:00Z',
    items: [
      {
        appId: 'app-hyperflow',
        appName: 'HyperFlow Studio',
        planId: 'plan-hf-individual',
        planName: 'Individual Creator License',
        unitPriceUsd: 79.0,
        licenseKey: 'NEX-HF84-9128-4491-K92X',
      },
    ],
    subtotalUsd: 79.0,
    discountUsd: 19.75,
    couponCode: 'LAUNCH25',
    taxUsd: 4.74,
    totalUsd: 63.99,
    paymentMethod: 'demo_credit_card',
    status: 'completed',
  },
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrInit();
  }

  private loadOrInit(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing store DB, re-seeding:', err);
    }

    const initial: DatabaseSchema = {
      categories: SEED_CATEGORIES,
      applications: SEED_APPLICATIONS,
      users: SEED_USERS,
      entitlements: SEED_ENTITLEMENTS,
      orders: SEED_ORDERS,
      wishlists: {
        'user-demo-1': ['app-pixelforge', 'app-vortex-db'],
      },
      reviews: SEED_REVIEWS,
      tickets: [],
    };
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  // --- Categories ---
  getCategories(): StoreCategory[] {
    return this.data.categories;
  }

  // --- Applications ---
  getApplications(filter?: {
    platform?: string;
    category?: string;
    search?: string;
    freeOnly?: boolean;
    sort?: string;
  }): ApplicationRecord[] {
    let list = [...this.data.applications];

    if (filter?.platform) {
      const p = filter.platform.toLowerCase();
      list = list.filter((app) => app.supportedPlatforms.includes(p as any));
    }

    if (filter?.category && filter.category !== 'all') {
      const catSlug = filter.category.toLowerCase();
      list = list.filter(
        (app) =>
          app.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === catSlug ||
          app.secondaryCategory?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === catSlug
      );
    }

    if (filter?.freeOnly) {
      list = list.filter((app) => app.basePriceUsd === 0 || app.licenseModel === 'free');
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(
        (app) =>
          app.name.toLowerCase().includes(q) ||
          app.tagline.toLowerCase().includes(q) ||
          app.developer.toLowerCase().includes(q) ||
          app.category.toLowerCase().includes(q) ||
          app.features.some((f) => f.toLowerCase().includes(q))
      );
    }

    if (filter?.sort === 'price_asc') {
      list.sort((a, b) => a.basePriceUsd - b.basePriceUsd);
    } else if (filter?.sort === 'price_desc') {
      list.sort((a, b) => b.basePriceUsd - a.basePriceUsd);
    } else if (filter?.sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (filter?.sort === 'reviews') {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return list;
  }

  getApplicationBySlug(slug: string): ApplicationRecord | undefined {
    return this.data.applications.find(
      (a) => a.slug === slug || a.id === slug
    );
  }

  // --- Users & Auth ---
  getUserById(id: string): UserProfile | undefined {
    const u = this.data.users.find((user) => user.id === id);
    if (!u) return undefined;
    const { passwordHash, ...profile } = u;
    return profile;
  }

  getUserByEmail(email: string): (UserProfile & { passwordHash: string }) | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(name: string, email: string, passwordHash: string): UserProfile {
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role: 'user' as const,
      createdAt: new Date().toISOString(),
      passwordHash,
    };
    this.data.users.push(newUser);
    this.persist();
    const { passwordHash: _, ...profile } = newUser;
    return profile;
  }

  // --- Entitlements & Library ---
  getUserEntitlements(userId: string): Entitlement[] {
    return this.data.entitlements.filter((e) => e.userId === userId && e.status === 'active');
  }

  addEntitlement(entitlement: Entitlement) {
    this.data.entitlements.push(entitlement);
    this.persist();
  }

  recordDownload(userId: string, buildId: string) {
    const ent = this.data.entitlements.find(
      (e) => e.userId === userId && e.status === 'active'
    );
    if (ent) {
      ent.lastDownloadedAt = new Date().toISOString();
      ent.lastDownloadedBuildId = buildId;
      this.persist();
    }
  }

  // --- Orders ---
  getUserOrders(userId: string): OrderRecord[] {
    return this.data.orders.filter((o) => o.userId === userId);
  }

  getOrderById(id: string): OrderRecord | undefined {
    return this.data.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  createOrder(order: OrderRecord) {
    this.data.orders.unshift(order);
    this.persist();
  }

  // --- Wishlist ---
  getUserWishlist(userId: string): string[] {
    return this.data.wishlists[userId] || [];
  }

  toggleWishlist(userId: string, appId: string): string[] {
    const list = this.data.wishlists[userId] || [];
    const index = list.indexOf(appId);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push(appId);
    }
    this.data.wishlists[userId] = list;
    this.persist();
    return list;
  }

  // --- Reviews ---
  getReviewsForApp(appId: string): ApplicationReview[] {
    return this.data.reviews.filter((r) => r.appId === appId);
  }

  addReview(review: ApplicationReview) {
    this.data.reviews.unshift(review);
    // recalculate app average
    const app = this.data.applications.find((a) => a.id === review.appId);
    if (app) {
      const appRevs = this.getReviewsForApp(app.id);
      const sum = appRevs.reduce((acc, r) => acc + r.rating, 0);
      app.rating = Math.round((sum / appRevs.length) * 10) / 10;
      app.reviewCount = appRevs.length;
    }
    this.persist();
  }

  // --- Support Tickets ---
  createTicket(ticket: SupportTicket) {
    this.data.tickets.unshift(ticket);
    this.persist();
  }

  getTickets(): SupportTicket[] {
    return this.data.tickets;
  }

  // --- Admin ---
  getAllOrders(): OrderRecord[] {
    return this.data.orders;
  }

  addApplication(app: ApplicationRecord) {
    this.data.applications.push(app);
    this.persist();
  }

  updateApplication(id: string, updates: Partial<ApplicationRecord>) {
    const idx = this.data.applications.findIndex((a) => a.id === id);
    if (idx >= 0) {
      this.data.applications[idx] = { ...this.data.applications[idx], ...updates };
      this.persist();
    }
  }

  addBuild(appId: string, build: any) {
    const app = this.data.applications.find((a) => a.id === appId);
    if (app) {
      app.builds.push(build);
      if (!app.supportedPlatforms.includes(build.platform)) {
        app.supportedPlatforms.push(build.platform);
      }
      this.persist();
    }
  }
}

export const db = new DatabaseService();
