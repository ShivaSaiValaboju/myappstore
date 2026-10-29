import React from 'react';
import type { ApplicationRecord } from '../types/store';
import { AppIcon } from '../components/common/AppIcons';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';

interface UpdatesViewProps {
  applications: ApplicationRecord[];
  onSelectApp: (slug: string) => void;
}

export const UpdatesView: React.FC<UpdatesViewProps> = ({ applications, onSelectApp }) => {
  // Aggregate changelog items
  const allUpdates = applications
    .flatMap((app) =>
      (app.changelog || []).map((c) => ({
        app,
        version: c.version,
        date: c.date,
        changes: c.changes,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Verified Release Notes</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Track architecture upgrades, security patches, and performance releases across our software catalog
        </p>
      </div>

      <div className="space-y-6">
        {allUpdates.map((update, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 hover:border-neutral-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3.5">
                <AppIcon
                  name={update.app.iconSvgName}
                  accentColor={update.app.accentColor}
                  className="w-10 h-10 shrink-0"
                />
                <div>
                  <h3
                    onClick={() => onSelectApp(update.app.slug)}
                    className="text-base font-bold text-white hover:text-violet-400 cursor-pointer transition-colors"
                  >
                    {update.app.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                    <span className="font-mono text-violet-400 font-semibold">v{update.version}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      {update.date}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectApp(update.app.slug)}
                className="px-3.5 py-1.5 text-xs font-semibold text-neutral-200 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <span>View Builds</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <ul className="space-y-2 text-xs text-neutral-300">
              {update.changes.map((change, cIdx) => (
                <li key={cIdx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-violet-400 mt-0.5">•</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
