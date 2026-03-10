import { motion } from "framer-motion";
import { CategoryState, Source } from "../types";
import SourcesList from "./SourcesList";

interface Props {
  title: string;
  icon: React.ReactNode;
  state: CategoryState;
  children: React.ReactNode;
  accentColor?: string;
  delay?: number;
  embedded?: boolean;
}

export default function CategoryCard({
  title,
  icon,
  state,
  children,
  accentColor = "accent",
  delay = 0,
  embedded = false,
}: Props) {
  if (state.status === "pending") return null;

  const isLoading = state.status === "in_progress";
  const isError = state.status === "error";

  const Wrapper = embedded ? "div" : motion.div;
  const wrapperProps = embedded
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={
        embedded
          ? ""
          : "glass rounded-2xl overflow-hidden"
      }
    >
      {/* Card header — hidden when embedded (tab bar already shows the title) */}
      {!embedded && (
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
          <div className="text-ink-500">{icon}</div>
          <h3 className="font-display text-lg text-ink-100">{title}</h3>
          {state.status === "completed" && (
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-emerald-600 font-medium uppercase tracking-wider">
                Complete
              </span>
            </div>
          )}
        </div>
      )}

      {/* Card body */}
      <div className={embedded ? "px-6 py-5" : "px-5 py-4"}>
        {isLoading && (
          <div className="space-y-3">
            <div className="h-4 w-3/4 rounded animate-shimmer" />
            <div className="h-4 w-1/2 rounded animate-shimmer" />
            <div className="h-4 w-5/6 rounded animate-shimmer" />
          </div>
        )}
        {isError && (
          <p className="text-sm text-red-600">{state.progressMessage}</p>
        )}
        {state.status === "completed" && state.data && children}
      </div>

      {/* Sources */}
      {state.sources.length > 0 && state.status === "completed" && (
        <div className={embedded ? "px-6 pb-5" : "px-5 pb-4"}>
          <SourcesList sources={state.sources} />
        </div>
      )}
    </Wrapper>
  );
}
