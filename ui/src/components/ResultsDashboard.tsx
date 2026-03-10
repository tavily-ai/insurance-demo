import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Newspaper,
  ShieldAlert,
  Package,
  FileWarning,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { CategoriesState, CategoryKey, CATEGORY_LABELS } from "../types";
import CategoryCard from "./CategoryCard";
import CompanyInfo from "./CompanyInfo";
import AdverseNews from "./AdverseNews";
import RiskAssessment from "./RiskAssessment";
import ProductsServices from "./ProductsServices";
import ClaimsHistory from "./ClaimsHistory";

interface Props {
  categories: CategoriesState;
  companyName: string;
}

const TABS: {
  key: CategoryKey;
  icon: React.ElementType;
  component: React.ComponentType<{ data: Record<string, any> }>;
}[] = [
  { key: "company_info", icon: Building2, component: CompanyInfo },
  { key: "products_services", icon: Package, component: ProductsServices },
  { key: "adverse_news", icon: Newspaper, component: AdverseNews },
  { key: "risk_assessment", icon: ShieldAlert, component: RiskAssessment },
  { key: "claims_history", icon: FileWarning, component: ClaimsHistory },
];

function StatusDot({ status }: { status: string }) {
  if (status === "completed")
    return <Check className="w-3 h-3 text-emerald-600" />;
  if (status === "error")
    return <AlertCircle className="w-3 h-3 text-red-500" />;
  if (status === "in_progress")
    return <Loader2 className="w-3 h-3 text-accent-500 animate-spin" />;
  return <div className="w-1.5 h-1.5 rounded-full bg-ink-700" />;
}

export default function ResultsDashboard({ categories, companyName }: Props) {
  const [activeTab, setActiveTab] = useState<CategoryKey>("company_info");
  const prevCompletedRef = useRef<Set<CategoryKey>>(new Set());

  // Auto-switch to the latest completed tab as results stream in
  useEffect(() => {
    const prevCompleted = prevCompletedRef.current;
    for (const tab of TABS) {
      const state = categories[tab.key];
      if (state.status === "completed" && !prevCompleted.has(tab.key)) {
        setActiveTab(tab.key);
        prevCompleted.add(tab.key);
      }
    }
  }, [categories]);

  const completedCount = Object.entries(categories).filter(
    ([key, c]) => c.status === "completed" && key !== "leadership_linkedin"
  ).length;

  const activeState = categories[activeTab];
  const ActiveComp = TABS.find((t) => t.key === activeTab)!.component;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mt-10"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        {(() => {
          const domain = categories.company_info?.data?.website;
          if (!domain) return null;
          const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
          return (
            <img
              src={`https://img.logo.dev/${cleanDomain}?token=pk_e60DLzAKRIi4-6q9LeyCXQ&size=64&format=png`}
              alt={`${companyName} logo`}
              className="w-8 h-8 rounded-md object-contain bg-white ring-1 ring-ink-800"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          );
        })()}
        <h2 className="font-display text-xl text-ink-100">{companyName}</h2>
        <span className="text-xs text-ink-500 font-mono">
          {completedCount}/5 categories
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
        {TABS.map((tab) => {
          const state = categories[tab.key];
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const isReady =
            state.status === "completed" || state.status === "in_progress";

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                group relative flex items-center gap-2 px-4 py-3 text-sm font-medium
                transition-all rounded-t-lg cursor-pointer
                ${
                  isActive
                    ? "glass text-ink-100 -mb-px !border-b-transparent !rounded-b-none"
                    : isReady
                    ? "text-ink-400 hover:text-ink-200 hover:bg-white/20"
                    : "text-ink-600 hover:text-ink-400 hover:bg-white/10"
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                {CATEGORY_LABELS[tab.key]}
              </span>
              <StatusDot status={state.status} />
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="glass !rounded-t-none !rounded-b-2xl rounded-tr-2xl overflow-hidden min-h-[300px] !border-t-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <CategoryCard
              title={CATEGORY_LABELS[activeTab]}
              icon={
                (() => {
                  const Icon = TABS.find((t) => t.key === activeTab)!.icon;
                  return <Icon className="w-5 h-5" />;
                })()
              }
              state={activeState}
              delay={0}
              embedded
            >
              <ActiveComp
                data={
                  activeTab === "company_info"
                    ? { ...activeState.data, _linkedinData: categories.leadership_linkedin?.data }
                    : activeTab === "adverse_news"
                    ? { ...activeState.data, _sources: activeState.sources }
                    : activeState.data || {}
                }
              />
            </CategoryCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
