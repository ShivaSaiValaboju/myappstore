import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ShieldCheck, CheckCircle2, Lock, FileText, Send, HelpCircle } from 'lucide-react';

interface LegalViewProps {
  page: 'privacy' | 'terms' | 'refund-policy' | 'licensing' | 'download-safety' | 'support';
}

export const LegalView: React.FC<LegalViewProps> = ({ page }) => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [supportEmail, setSupportEmail] = useState(user?.email || '');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportCategory, setSupportCategory] = useState<'download' | 'license' | 'refund' | 'compatibility' | 'other'>('license');
  const [supportMessage, setSupportMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: supportEmail,
          subject: supportSubject,
          category: supportCategory,
          message: supportMessage,
        }),
      });
      if (res.ok) {
        setTicketSubmitted(true);
        showToast({
          type: 'success',
          title: 'Ticket Received',
          message: 'Our technical support team will review your inquiry.',
        });
      }
    } catch {
      showToast({ type: 'error', title: 'Error', message: 'Failed to dispatch ticket' });
    }
  };

  if (page === 'privacy') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 text-neutral-300 text-xs leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Privacy Policy</h1>
        <p className="text-neutral-400">Last updated: October 2026 · SAHRIVA Store Trust Architecture</p>

        <section className="space-y-3 pt-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Zero-Telemetry Principle</h2>
          <p>
            SAHRIVA Store adheres strictly to privacy-first principles. We do not embed background behavioral analytics, cross-site trackers, or third-party profiling scripts in our store or within distributed software binaries.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Account & Entitlement Storage</h2>
          <p>
            When an account is created or an order is completed, we store only the necessary cryptographic records to verify your entitlement: your authenticated email, order timestamp, and generated license keys. Download tokens expire within 60 minutes and contain no personally identifiable metadata.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Local Hardware Activation</h2>
          <p>
            Device activations are validated locally against cryptographic seat constraints. We do not monitor your active processes, file system, or network traffic.
          </p>
        </section>
      </div>
    );
  }

  if (page === 'terms') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 text-neutral-300 text-xs leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Terms of Service</h1>
        <p className="text-neutral-400">Effective: October 2026 · Marketplace Distribution Agreement</p>

        <section className="space-y-3 pt-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. Role of SAHRIVA Store</h2>
          <p>
            SAHRIVA Store acts as an authorized digital distribution channel and entitlement management platform. Software applications are authored and maintained by their respective software publishers and development studios.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. License Grant</h2>
          <p>
            Purchasing a license grants you a perpetual, non-exclusive license to execute the software on the number of authorized hardware workstations indicated in the plan specifications (e.g. 2 devices for personal creator licenses).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">3. Reverse Engineering & Redistribution</h2>
          <p>
            You agree not to modify, decompile, or redistribute authorized commercial installers or license keys without explicit authorization from the publishing rights holder.
          </p>
        </section>
      </div>
    );
  }

  if (page === 'refund-policy') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 text-neutral-300 text-xs leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Refund Policy</h1>
        <p className="text-neutral-400">30-Day Verified Compatibility Guarantee</p>

        <section className="space-y-3 pt-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">1. The 30-Day Guarantee</h2>
          <p>
            If a purchased application fails to run on hardware meeting our verified system requirements matrix (e.g. an Apple Silicon machine meeting macOS Ventura minimums), you are entitled to a full 100% refund within 30 days of purchase.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">2. Refund Process</h2>
          <p>
            Submit an inquiry through the Support & Tickets page selecting "Refund Request". Upon review, the license key is revoked and the purchase amount is restored to your original payment method.
          </p>
        </section>
      </div>
    );
  }

  if (page === 'licensing') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20 text-neutral-300 text-xs leading-relaxed">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Software Licensing Models</h1>
        <p className="text-neutral-400">Clear, transparent licensing terms across all store applications</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
            <h3 className="text-sm font-bold text-white">Perpetual Commercial Licenses</h3>
            <p className="text-neutral-400">
              You own your software. One-time purchase unlocks permanent usage of the specified major release version without recurring subscriptions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
            <h3 className="text-sm font-bold text-white">Open Source & Community</h3>
            <p className="text-neutral-400">
              Distributed under standard OSI licenses (MIT, Apache 2.0, GPL). 100% free with unlimited workstation installations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default: Support & Tickets
  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Support & Compatibility Assistance</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Need assistance with installer downloads, license key activations, or hardware compatibility?
        </p>
      </div>

      {ticketSubmitted ? (
        <div className="p-8 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Inquiry Dispatched</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
            Your request has been logged in our support queue. A representative will review your hardware and transaction details.
          </p>
          <button
            onClick={() => {
              setTicketSubmitted(false);
              setSupportSubject('');
              setSupportMessage('');
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-violet-600 rounded-lg"
          >
            Submit Another Query
          </button>
        </div>
      ) : (
        <form onSubmit={handleSupportSubmit} className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 text-xs">
          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Your Contact Email</label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="developer@company.com"
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Category</label>
              <select
                value={supportCategory}
                onChange={(e) => setSupportCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
              >
                <option value="license">License Key & Activation</option>
                <option value="download">Download & Checksums</option>
                <option value="compatibility">OS & Hardware Compatibility</option>
                <option value="refund">Refund Request</option>
                <option value="other">General Inquiry</option>
              </select>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1 font-medium">Subject</label>
              <input
                type="text"
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                placeholder="Brief summary of inquiry"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 mb-1 font-medium">Message Details</label>
            <textarea
              rows={5}
              value={supportMessage}
              onChange={(e) => setSupportMessage(e.target.value)}
              placeholder="Include your operating system version, device architecture, or order number..."
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Support Inquiry</span>
          </button>
        </form>
      )}
    </div>
  );
};
