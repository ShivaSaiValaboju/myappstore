import React from 'react';
import type { StoreCategory, ApplicationRecord } from '../types/store';
import { Terminal, PenTool, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

interface CategoriesViewProps {
  categories: StoreCategory[];
  applications: ApplicationRecord[];
  onSelectCategory: (categorySlug: string) => void;
  onSelectApp: (appSlug: string) => void;
}

const CategoryIconMap: Record<string, React.FC<{ className?: string }>> = {
  Terminal: ({ className }) => <Terminal className={className} />,
  PenTool: ({ className }) => <PenTool className={className} />,
  Sparkles: ({ className }) => <Sparkles className={className} />,
  ShieldCheck: ({ className }) => <ShieldCheck className={className} />,
};

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  applications,
  onSelectCategory,
  onSelectApp,
}) => {
  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Software Categories</h1>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
          Explore specialized software curated for engineering, design, and technical writing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const Icon = CategoryIconMap[cat.icon] || Terminal;
          const appsInCat = applications.filter(
            (a) =>
              a.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cat.slug ||
              a.secondaryCategory?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cat.slug
          );

          return (
            <div
              key={cat.id}
              className="p-6 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-sm dark:shadow-none"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white">{cat.name}</h2>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{appsInCat.length} verified apps</span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectCategory(cat.slug)}
                  className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 flex items-center gap-1 cursor-pointer"
                >
                  <span>Filter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{cat.description}</p>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60 flex flex-wrap gap-2">
                {appsInCat.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => onSelectApp(app.slug)}
                    className="px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-950 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {app.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
