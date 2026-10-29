import React, { useState, useEffect } from 'react';
import type { Entitlement, ApplicationRecord, PlatformId } from '../types/store';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { AppIcon, PlatformIcons } from '../components/common/AppIcons';
import {
  Download,
  Copy,
  Laptop,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Key,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface LibraryItem {
  entitlement: Entitlement;
  app: ApplicationRecord;
}

interface LibraryViewProps {
  onSelectApp: (slug: string) => void;
  onNavigate: (route: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onSelectApp, onNavigate }) => {
  const { user, token, openAuthModal, loginAsDemoUser } = useAuth();
  const { showToast } = useNotification();

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | PlatformId>('all');
  const [activatingEntitlementId, setActivatingEntitlementId] = useState<string | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDevicePlatform, setNewDevicePlatform] = useState<PlatformId>('macos');

  const fetchLibrary = () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch('/api/library', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data.filter((i) => i.app));
        }
      })
      .catch((err) => console.error('Failed to load library:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLibrary();
  }, [token]);

  const copyLicenseKey = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast({
      type: 'success',
      title: 'License Key Copied',
      message: 'Paste into application activation prompt',
    });
  };

  const handleDownload = async (app: ApplicationRecord) => {
    const defaultBuild = app.builds[0];
    if (!defaultBuild) return;

    try {
      const res = await fetch('/api/downloads/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appId: app.id,
          buildId: defaultBuild.id,
        }),
      });

      if (!res.ok) {
        showToast({ type: 'error', title: 'Error', message: 'Failed to authorize download' });
        return;
      }

      const data = await res.json();
      showToast({
        type: 'success',
        title: 'Starting Download',
        message: `Authorized ${data.filename}`,
      });
      window.location.href = data.downloadUrl;
      fetchLibrary();
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Download server unreachable' });
    }
  };

  const handleActivateDeviceSubmit = async (entitlementId: string) => {
    if (!newDeviceName.trim()) {
      showToast({ type: 'error', title: 'Device Name Required', message: 'Enter a name for your workstation' });
      return;
    }

    try {
      const res = await fetch('/api/library/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          entitlementId,
          deviceName: newDeviceName.trim(),
          platform: newDevicePlatform,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast({ type: 'error', title: 'Activation Failed', message: data.error || 'Device activation rejected' });
        return;
      }

      showToast({
        type: 'success',
        title: 'Device Registered',
        message: `${newDeviceName} successfully activated on this license`,
      });
      setActivatingEntitlementId(null);
      setNewDeviceName('');
      fetchLibrary();
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Could not connect to activation server' });
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-violet-400">
          <Key className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Your Personal Software Library</h2>
        <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
          Sign in to access your purchased licenses, device activations, and cryptographic download keys.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={openAuthModal}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={loginAsDemoUser}
            className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors cursor-pointer"
          >
            Sign in as Demo User (Alex Chen)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">My Applications</h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Manage your perpetual licenses, registered workstations, and verified installers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/orders')}
            className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            View Order Receipts
          </button>
        </div>
      </div>

      {/* Library Items */}
      {loading ? (
        <div className="p-12 text-center text-xs text-neutral-500">Loading your software entitlements...</div>
      ) : items.length > 0 ? (
        <div className="space-y-4">
          {items.map(({ entitlement, app }) => (
            <div
              key={entitlement.id}
              className="p-6 rounded-2xl bg-white dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 space-y-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <AppIcon
                    name={app.iconSvgName}
                    accentColor={app.accentColor}
                    className="w-14 h-14 shrink-0 shadow-md"
                  />
                  <div>
                    <h3
                      onClick={() => onSelectApp(app.slug)}
                      className="text-lg font-bold text-neutral-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 cursor-pointer transition-colors"
                    >
                      {app.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{app.developer}</p>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-1">
                      <span>Purchased: {new Date(entitlement.purchasedAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Status: Active</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <button
                    onClick={() => handleDownload(app)}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-all shadow-md shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Installer</span>
                  </button>
                </div>
              </div>

              {/* License Details & Devices Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-800/80 text-xs">
                {/* License Key Box */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 font-medium flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-violet-400" />
                      Cryptographic License Key
                    </span>
                    <button
                      onClick={() => copyLicenseKey(entitlement.licenseKey)}
                      className="text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1 text-[11px] cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                  <code className="text-white font-mono text-sm block tracking-wider bg-neutral-900/60 p-2 rounded border border-neutral-800 select-all">
                    {entitlement.licenseKey}
                  </code>
                </div>

                {/* Active Workstations / Devices */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 font-medium flex items-center gap-1.5">
                      <Laptop className="w-3.5 h-3.5 text-sky-400" />
                      Device Activations ({entitlement.activeDevices.length} / {entitlement.maxActivations})
                    </span>
                    {entitlement.activeDevices.length < entitlement.maxActivations && (
                      <button
                        onClick={() =>
                          setActivatingEntitlementId(
                            activatingEntitlementId === entitlement.id ? null : entitlement.id
                          )
                        }
                        className="text-sky-400 hover:text-sky-300 font-semibold text-[11px] flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Register Device</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {entitlement.activeDevices.length > 0 ? (
                      entitlement.activeDevices.map((dev, dIdx) => {
                        const Icon = PlatformIcons[dev.platform] || Laptop;
                        return (
                          <div
                            key={dIdx}
                            className="flex items-center justify-between text-[11px] text-neutral-300 bg-neutral-900/60 px-2.5 py-1 rounded"
                          >
                            <span className="flex items-center gap-2">
                              <Icon className="w-3 h-3 text-neutral-400" />
                              <span className="font-medium">{dev.deviceName}</span>
                            </span>
                            <span className="text-neutral-500 font-mono">
                              {new Date(dev.activatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-[11px] text-neutral-500 italic">No devices registered yet.</p>
                    )}
                  </div>

                  {/* Device Registration Drawer */}
                  {activatingEntitlementId === entitlement.id && (
                    <div className="mt-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2 animate-in fade-in">
                      <input
                        type="text"
                        value={newDeviceName}
                        onChange={(e) => setNewDeviceName(e.target.value)}
                        placeholder="e.g. MacBook Pro M3 or Studio Workstation"
                        className="w-full px-2.5 py-1.5 text-xs bg-neutral-950 border border-neutral-800 rounded text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={newDevicePlatform}
                          onChange={(e) => setNewDevicePlatform(e.target.value as PlatformId)}
                          className="px-2 py-1 text-xs bg-neutral-950 border border-neutral-800 rounded text-neutral-300"
                        >
                          <option value="macos">macOS</option>
                          <option value="windows">Windows</option>
                          <option value="linux">Linux</option>
                          <option value="android">Android</option>
                        </select>
                        <button
                          onClick={() => handleActivateDeviceSubmit(entitlement.id)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded cursor-pointer"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">Your library is currently empty</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Applications you purchase or add from the catalog will be organized here with permanent license keys and signed installers.
          </p>
          <button
            onClick={() => onNavigate('/apps')}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
          >
            Explore Applications
          </button>
        </div>
      )}
    </div>
  );
};
