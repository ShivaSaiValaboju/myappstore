import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { formatCurrency } from '../utils/rules';
import type { ApplicationRecord, PlatformId, PackageFormat, CpuArchitecture } from '../types/store';
import {
  Shield,
  Layers,
  ShoppingBag,
  DollarSign,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
} from 'lucide-react';

interface AdminViewProps {
  applications: ApplicationRecord[];
  onRefreshApps: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ applications, onRefreshApps }) => {
  const { user, token, loginAsDemoAdmin, openAuthModal } = useAuth();
  const { showToast } = useNotification();

  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'builds' | 'orders' | 'tickets'>('overview');

  // Add build modal form
  const [isAddBuildOpen, setIsAddBuildOpen] = useState(false);
  const [buildAppId, setBuildAppId] = useState(applications[0]?.id || '');
  const [buildPlatform, setBuildPlatform] = useState<PlatformId>('macos');
  const [buildArch, setBuildArch] = useState<CpuArchitecture>('apple_silicon');
  const [buildVersion, setBuildVersion] = useState('1.0.0');
  const [buildFormat, setBuildFormat] = useState<PackageFormat>('dmg');
  const [buildChecksum, setBuildChecksum] = useState('');
  const [buildFileSize, setBuildFileSize] = useState('120 MB');

  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch('/api/admin/overview', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setOverview(data);
      })
      .catch((err) => console.error('Admin overview failed:', err))
      .finally(() => setLoading(false));
  }, [token, user]);

  const handleAddBuildSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buildChecksum) {
      showToast({ type: 'error', title: 'Checksum Required', message: 'Enter a valid SHA-256 hash' });
      return;
    }

    const archLabels: Record<CpuArchitecture, string> = {
      apple_silicon: 'Apple Silicon (M-series)',
      intel_x86_64: 'Intel x86_64',
      universal: 'Universal Binary',
      win_x64: 'Windows x64',
      win_arm64: 'Windows ARM64',
      linux_x86_64: 'Linux x86_64',
      linux_arm64: 'Linux ARM64',
      android_arm64: 'Android ARM64',
      android_universal: 'Android Universal',
    };

    const formatLabels: Record<PackageFormat, string> = {
      dmg: 'Apple Disk Image (.dmg)',
      pkg: 'macOS Installer Package (.pkg)',
      exe: 'Windows Executable (.exe)',
      msi: 'Windows Installer (.msi)',
      appimage: 'Universal AppImage (.AppImage)',
      deb: 'Debian Package (.deb)',
      rpm: 'Red Hat Package (.rpm)',
      tar_gz: 'Tarball Archive (.tar.gz)',
      apk: 'Android Package Kit (.apk)',
      google_play: 'Google Play Store Listing',
    };

    const newBuild = {
      id: `build-${Date.now()}`,
      appId: buildAppId,
      platform: buildPlatform,
      architecture: buildArch,
      architectureLabel: archLabels[buildArch] || buildArch,
      version: buildVersion,
      releaseDate: new Date().toISOString().split('T')[0],
      packageFormat: buildFormat,
      packageFormatLabel: formatLabels[buildFormat] || buildFormat,
      fileSizeBytes: 125829120,
      fileSizeFormatted: buildFileSize,
      sha256Checksum: buildChecksum.trim().toLowerCase(),
      minOsVersion: buildPlatform === 'macos' ? 'macOS 13.0' : 'Current Release',
      downloadUrl: `/api/downloads/file/package-${Date.now()}`,
      requiresLicense: true,
      verifiedStatus: 'verified',
    };

    // Find app and update
    const targetApp = applications.find((a) => a.id === buildAppId);
    if (!targetApp) return;

    targetApp.builds.push(newBuild as any);
    if (!targetApp.supportedPlatforms.includes(buildPlatform)) {
      targetApp.supportedPlatforms.push(buildPlatform);
    }

    showToast({
      type: 'success',
      title: 'Build Registered',
      message: `v${buildVersion} published to verified distribution catalog`,
    });

    setIsAddBuildOpen(false);
    setBuildChecksum('');
    onRefreshApps();
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-violet-400">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Administrator Console</h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Access to build publishing, order audits, and license inventory is restricted to verified administrators.
        </p>
        <button
          onClick={loginAsDemoAdmin}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors cursor-pointer shadow-md shadow-violet-600/30"
        >
          Sign In as Administrator
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Admin Console</h1>
            <span className="text-[10px] font-mono text-violet-400 bg-violet-950/60 border border-violet-800/40 px-2 py-0.5 rounded">
              PRIVILEGED
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Catalog governance, build releases, and transaction audits
          </p>
        </div>

        <button
          onClick={() => setIsAddBuildOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-md shadow-violet-600/30 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Platform Build</span>
        </button>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1">
            <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              Verified Applications
            </span>
            <p className="text-2xl font-bold text-white tabular-nums">{overview.totalApps}</p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1">
            <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
              Total Orders
            </span>
            <p className="text-2xl font-bold text-white tabular-nums">{overview.totalOrders}</p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1">
            <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Gross Store Revenue
            </span>
            <p className="text-2xl font-bold text-emerald-400 tabular-nums">
              {formatCurrency(overview.totalRevenueUsd)}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1">
            <span className="text-xs text-neutral-500 font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              Platform Distribution
            </span>
            <p className="text-xs font-mono text-neutral-300 pt-1">
              Mac: {overview.platformCount?.macos} · Win: {overview.platformCount?.windows} · Lin: {overview.platformCount?.linux}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Catalog Status
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Orders Audit
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'tickets'
              ? 'bg-neutral-800 text-white'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Support Inquiries ({overview?.tickets?.length || 0})
        </button>
      </div>

      {/* Catalog Table */}
      {activeTab === 'overview' && (
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Active Applications & Verified Builds</h3>
          <div className="divide-y divide-neutral-800 text-xs">
            {applications.map((app) => (
              <div key={app.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-white">{app.name}</h4>
                  <p className="text-neutral-500">
                    {app.developer} · {app.category} · {app.builds.length} builds
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-neutral-300">
                    {formatCurrency(app.basePriceUsd)}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {app.supportedPlatforms.join(' / ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Audit */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Recent Store Orders</h3>
          <div className="divide-y divide-neutral-800 text-xs">
            {overview?.recentOrders?.map((ord: any) => (
              <div key={ord.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-white">#{ord.orderNumber}</span>
                  <p className="text-neutral-500">
                    Customer: {ord.userEmail} · {new Date(ord.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="font-mono font-bold text-violet-400">
                  {formatCurrency(ord.totalUsd)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Support Inquiries */}
      {activeTab === 'tickets' && (
        <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-white">Incoming Support & Compatibility Inquiries</h3>
          {overview?.tickets && overview.tickets.length > 0 ? (
            <div className="space-y-3 text-xs">
              {overview.tickets.map((t: any) => (
                <div key={t.id} className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="flex justify-between font-semibold text-white">
                    <span>{t.subject}</span>
                    <span className="text-neutral-500">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-neutral-400">{t.message}</p>
                  <span className="text-[10px] text-violet-400 block pt-1">From: {t.userEmail}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 italic">No open support tickets.</p>
          )}
        </div>
      )}

      {/* Add Build Modal */}
      {isAddBuildOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 text-xs text-neutral-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Register Verified Platform Build</h3>
              <button onClick={() => setIsAddBuildOpen(false)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBuildSubmit} className="space-y-4">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Application</label>
                <select
                  value={buildAppId}
                  onChange={(e) => setBuildAppId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                >
                  {applications.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Operating System</label>
                  <select
                    value={buildPlatform}
                    onChange={(e) => setBuildPlatform(e.target.value as PlatformId)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                  >
                    <option value="macos">macOS</option>
                    <option value="windows">Windows</option>
                    <option value="linux">Linux</option>
                    <option value="android">Android</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Architecture</label>
                  <select
                    value={buildArch}
                    onChange={(e) => setBuildArch(e.target.value as CpuArchitecture)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                  >
                    <option value="apple_silicon">Apple Silicon</option>
                    <option value="intel_x86_64">Intel x86_64</option>
                    <option value="universal">Universal</option>
                    <option value="win_x64">Windows x64</option>
                    <option value="linux_x86_64">Linux x86_64</option>
                    <option value="android_arm64">Android ARM64</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Version</label>
                  <input
                    type="text"
                    value={buildVersion}
                    onChange={(e) => setBuildVersion(e.target.value)}
                    placeholder="3.5.0"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Package Format</label>
                  <select
                    value={buildFormat}
                    onChange={(e) => setBuildFormat(e.target.value as PackageFormat)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                  >
                    <option value="dmg">Apple Disk Image (.dmg)</option>
                    <option value="pkg">macOS Package (.pkg)</option>
                    <option value="msi">Windows MSI (.msi)</option>
                    <option value="exe">Windows EXE (.exe)</option>
                    <option value="appimage">Linux AppImage (.AppImage)</option>
                    <option value="deb">Debian (.deb)</option>
                    <option value="apk">Android APK (.apk)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Verified SHA-256 Checksum</label>
                <input
                  type="text"
                  value={buildChecksum}
                  onChange={(e) => setBuildChecksum(e.target.value)}
                  placeholder="e.g. 7c4e519c67be89b023f0442ab3c94892e59dfba4c017bc79f16d9348ec749102"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white font-mono text-[11px]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddBuildOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Publish Build
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
