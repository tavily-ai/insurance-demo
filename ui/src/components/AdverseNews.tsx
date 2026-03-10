import { ExternalLink } from "lucide-react";
import { Source } from "../types";

interface Props {
  data: Record<string, any>;
}

function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function normalizeUrls(item: any): string[] {
  if (Array.isArray(item.urls)) return item.urls.filter(Boolean);
  if (item.url) return [item.url];
  return [];
}

function buildFaviconMap(sources: Source[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const s of sources) {
    if (!s.favicon) continue;
    const domain = getDomain(s.url);
    if (domain && !map.has(domain)) {
      map.set(domain, s.favicon);
    }
  }
  return map;
}

export default function AdverseNews({ data }: Props) {
  const apiSources: Source[] = Array.isArray(data._sources) ? data._sources : [];
  const faviconMap = buildFaviconMap(apiSources);

  let items: any[] = [];
  try {
    const raw = data.adverse_items;
    items = typeof raw === "string" ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
  } catch {
    items = [];
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-emerald-600">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          No significant adverse news found
        </div>
      )}

      {items.map((item: any, i: number) => {
        const urls = normalizeUrls(item);
        const seen = new Set<string>();

        return (
          <div key={i} className="p-3 rounded-lg glass-subtle">
            <span className="text-sm text-ink-100 font-medium">
              {item.headline}
            </span>
            {item.summary && (
              <p className="text-xs text-ink-400 mt-1.5 leading-relaxed">
                {item.summary}
              </p>
            )}
            {urls.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                {urls.map((url, j) => {
                  const domain = getDomain(url);
                  if (!domain || seen.has(domain)) return null;
                  seen.add(domain);

                  const apiFavicon = faviconMap.get(domain);

                  return (
                    <a
                      key={j}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={domain}
                      className="opacity-60 hover:opacity-100 transition-opacity"
                    >
                      {apiFavicon ? (
                        <img
                          src={apiFavicon}
                          alt={domain}
                          className="w-4 h-4 rounded-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5 text-ink-500" />
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
