interface Props {
  data: Record<string, any>;
}

function Section({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="p-3 rounded-lg glass-subtle">
      <p className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-1">
        {label}
      </p>
      <p className="text-sm text-ink-200 leading-relaxed">{value}</p>
    </div>
  );
}

export default function ProductsServices({ data }: Props) {
  return (
    <div className="space-y-4">
      {data.summary && (
        <p className="text-sm text-ink-300 leading-relaxed border-l-2 border-accent-400 pl-3">
          {data.summary}
        </p>
      )}
      <div className="space-y-2">
        <Section label="Products" value={data.products} />
        <Section label="Services" value={data.services} />
        <Section label="Market Segments" value={data.market_segments} />
        <Section label="Geographic Reach" value={data.geographic_reach} />
        <Section
          label="Competitive Positioning"
          value={data.competitive_positioning}
        />
      </div>
    </div>
  );
}
