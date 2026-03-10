import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Source } from "../types";

interface Props {
  sources: Source[];
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function SourcesList({ sources }: Props) {
  const [expanded, setExpanded] = useState(false);

  const unique = sources.filter(
    (s, i, arr) => arr.findIndex((x) => x.url === s.url) === i
  );

  if (unique.length === 0) return null;

  const COLLAPSED_COUNT = 12;
  const canExpand = unique.length > COLLAPSED_COUNT;
  const visible = expanded ? unique : unique.slice(0, COLLAPSED_COUNT);

  return (
    <div className="pt-3 mt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.4)" }}>
      <p className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-2.5">
        Sources ({unique.length})
      </p>

      <div
        className={`flex flex-wrap gap-1.5 ${
          expanded && unique.length > 30 ? "max-h-52 overflow-y-auto pr-1" : ""
        }`}
      >
        {visible.map((src, i) => (
          <a
            key={i}
            href={src.url}
            target="_blank"
            rel="noopener noreferrer"
            title={src.title || src.url}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md
              bg-white/[0.04] hover:bg-white/[0.10] border border-white/[0.06]
              hover:border-white/[0.12] transition-all group"
          >
            {src.favicon ? (
              <img
                src={src.favicon}
                alt=""
                className="w-3.5 h-3.5 rounded-sm flex-shrink-0"
                onError={(e) => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  el.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : null}
            {!src.favicon && (
              <ExternalLink className="w-3 h-3 text-ink-500 flex-shrink-0" />
            )}
            {src.favicon && (
              <ExternalLink className="w-3 h-3 text-ink-500 flex-shrink-0 hidden" />
            )}
            <span className="text-[11px] text-ink-400 group-hover:text-accent-400 truncate max-w-[140px] transition-colors">
              {getDomain(src.url)}
            </span>
          </a>
        ))}
      </div>

      {canExpand && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 mt-2.5 text-[11px] text-ink-500 hover:text-ink-300 transition-colors"
        >
          <ChevronDown
            className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
          {expanded ? "Show less" : `+${unique.length - COLLAPSED_COUNT} more sources`}
        </button>
      )}
    </div>
  );
}
