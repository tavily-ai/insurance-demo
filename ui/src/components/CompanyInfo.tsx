interface Props {
  data: Record<string, any>;
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-ink-200 leading-relaxed">{value}</dd>
    </div>
  );
}

function parseLeadership(raw: string): { role: string; name: string }[] {
  return raw
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const colonIdx = entry.indexOf(":");
      if (colonIdx === -1) return { role: "", name: entry };
      return {
        role: entry.slice(0, colonIdx).trim(),
        name: entry.slice(colonIdx + 1).trim(),
      };
    });
}

function parseLinkedIn(raw: unknown): Record<string, string> {
  if (!raw) return {};
  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    return raw as Record<string, string>;
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) return parsed;
    } catch {
      /* ignore */
    }
  }
  return {};
}

function findLinkedIn(
  name: string,
  linkedinMap: Record<string, string>
): string | undefined {
  if (linkedinMap[name]) return linkedinMap[name];
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(linkedinMap)) {
    if (key.toLowerCase() === lower) return url;
  }
  const nameParts = lower.split(/\s+/);
  for (const [key, url] of Object.entries(linkedinMap)) {
    const keyParts = key.toLowerCase().split(/\s+/);
    if (
      nameParts.length >= 2 &&
      keyParts.length >= 2 &&
      nameParts[nameParts.length - 1] === keyParts[keyParts.length - 1] &&
      nameParts[0] === keyParts[0]
    )
      return url;
  }
  return undefined;
}

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function CompanyInfo({ data }: Props) {
  const domain = data.website
    ? data.website.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "")
    : null;

  const leaders = data.leadership ? parseLeadership(data.leadership) : [];
  const linkedinRaw = data._linkedinData?.linkedin_profiles;
  const linkedinMap = parseLinkedIn(linkedinRaw);

  return (
    <div className="space-y-4">
      {data.summary && (
        <div className="flex items-start gap-4">
          {domain && (
            <img
              src={`https://img.logo.dev/${domain}?token=pk_e60DLzAKRIi4-6q9LeyCXQ&size=128&format=png`}
              alt={`${data.legal_name || "Company"} logo`}
              className="w-14 h-14 rounded-lg object-contain bg-white ring-1 ring-ink-800 shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <p className="text-sm text-ink-300 leading-relaxed border-l-2 border-accent-400 pl-3">
            {data.summary}
          </p>
        </div>
      )}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        <Field label="Legal Name" value={data.legal_name} />
        <Field label="Industry" value={data.industry} />
        <Field label="Headquarters" value={data.address} />
        <Field label="NAICS Code" value={data.naics_code} />
        <Field label="Founded" value={data.founded} />
        <Field label="Employees" value={data.employees} />
        <Field label="Revenue" value={data.revenue} />
        <Field label="Website" value={data.website} />
      </dl>

      {data.ownership && (
        <div className="pt-1">
          <dt className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-1.5">
            Ownership
          </dt>
          <dd className="text-sm text-ink-300 leading-relaxed glass-subtle rounded-lg px-3.5 py-2.5">
            {data.ownership}
          </dd>
        </div>
      )}

      {leaders.length > 0 && (
        <div className="pt-1">
          <dt className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-2">
            Leadership
          </dt>
          <dd className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {leaders.map((l, i) => {
              const linkedinUrl = findLinkedIn(l.name, linkedinMap);
              const Wrapper = linkedinUrl ? "a" : "div";
              const linkProps = linkedinUrl
                ? { href: linkedinUrl, target: "_blank", rel: "noopener noreferrer" }
                : {};

              return (
                <Wrapper
                  key={i}
                  {...linkProps}
                  className={`flex items-center gap-2.5 rounded-lg glass-subtle px-3 py-2 ${
                    linkedinUrl
                      ? "hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/[0.04] transition-colors group cursor-pointer"
                      : ""
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 uppercase ${
                    linkedinUrl
                      ? "bg-[#0A66C2]/10 text-[#0A66C2] group-hover:bg-[#0A66C2]/20 transition-colors"
                      : "bg-ink-850 text-ink-400"
                  }`}>
                    {l.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-ink-200 font-medium truncate">{l.name}</div>
                    {l.role && (
                      <div className="text-[10px] text-ink-500 uppercase tracking-wider leading-tight">
                        {l.role}
                      </div>
                    )}
                  </div>
                  {linkedinUrl && (
                    <div className="text-[#0A66C2] opacity-40 group-hover:opacity-100 transition-opacity shrink-0">
                      <LinkedInIcon />
                    </div>
                  )}
                </Wrapper>
              );
            })}
          </dd>
        </div>
      )}
    </div>
  );
}
