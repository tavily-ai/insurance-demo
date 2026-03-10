import { motion } from "framer-motion";
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
import {
  CategoriesState,
  CategoryKey,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CategoryStatus,
} from "../types";

const ICONS: Record<CategoryKey, React.ElementType> = {
  company_info: Building2,
  adverse_news: Newspaper,
  risk_assessment: ShieldAlert,
  products_services: Package,
  claims_history: FileWarning,
};

function StatusIcon({ status }: { status: CategoryStatus }) {
  if (status === "completed")
    return <Check className="w-3.5 h-3.5 text-emerald-600" />;
  if (status === "error")
    return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
  if (status === "in_progress")
    return <Loader2 className="w-3.5 h-3.5 text-accent-500 animate-spin" />;
  return <div className="w-2 h-2 rounded-full bg-ink-700" />;
}

interface Props {
  categories: CategoriesState;
  companyName: string;
}

export default function ProgressTracker({ categories, companyName }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mt-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse-dot" />
        <span className="text-sm text-ink-300 font-medium">
          Researching{" "}
          <span className="text-ink-100 font-display italic">{companyName}</span>
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {CATEGORY_ORDER.map((key, i) => {
          const cat = categories[key];
          const Icon = ICONS[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-lg transition-all ${
                cat.status === "completed"
                  ? "glass-subtle !bg-emerald-500/15 !border-emerald-300/50"
                  : cat.status === "in_progress"
                  ? "glass-subtle !bg-accent-400/15 !border-accent-300/50"
                  : cat.status === "error"
                  ? "glass-subtle !bg-red-500/15 !border-red-300/50"
                  : "glass-subtle"
              }`}
            >
              <Icon className="w-4 h-4 text-ink-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-ink-200 truncate">
                  {CATEGORY_LABELS[key]}
                </p>
                {cat.progressMessage && cat.status === "in_progress" && (
                  <p className="text-[10px] text-ink-400 truncate mt-0.5">
                    {cat.progressMessage}
                  </p>
                )}
              </div>
              <StatusIcon status={cat.status} />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
