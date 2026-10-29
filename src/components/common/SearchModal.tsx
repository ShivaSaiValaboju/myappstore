import React, { useState, useEffect, useRef } from 'react';
import type { ApplicationRecord } from '../../types/store';
import { AppIcon } from './AppIcons';
import { formatCurrency } from '../../utils/rules';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: ApplicationRecord[];
  onSelectApp: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  applications,
  onSelectApp,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Listen to Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = query.trim()
    ? applications.filter(
        (app) =>
          app.name.toLowerCase().includes(query.toLowerCase()) ||
          app.developer.toLowerCase().includes(query.toLowerCase()) ||
          app.category.toLowerCase().includes(query.toLowerCase()) ||
          app.tagline.toLowerCase().includes(query.toLowerCase()) ||
          app.features.some((f) => f.toLowerCase().includes(query.toLowerCase()))
      )
    : applications.slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[#0D101A] border border-neutral-800 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="p-4 border-b border-neutral-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps, tools, platforms (macOS, Windows, Linux, Android)..."
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-neutral-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] text-neutral-500 px-1.5 py-0.5 bg-neutral-900 border border-neutral-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-neutral-900">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            {query.trim() ? `Search Results (${results.length})` : 'Popular & Essential Apps'}
          </div>

          {results.length > 0 ? (
            results.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  onSelectApp(app.slug);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-neutral-900/80 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <AppIcon
                    name={app.iconSvgName}
                    accentColor={app.accentColor}
                    className="w-9 h-9 shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors truncate">
                      {app.name}
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {app.developer} · {app.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-semibold text-neutral-300">
                    {formatCurrency(app.basePriceUsd)}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-violet-400 transition-colors" />
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-neutral-500">
              No applications match "<span className="text-white">{query}</span>"
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Navigate with mouse or keyboard</span>
          <span className="flex items-center gap-1">
            <span>Select</span>
            <CornerDownLeft className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
