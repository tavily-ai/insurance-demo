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

export default function ClaimsHistory({ data }: Props) {
  return (
    <div className="space-y-4">
      {data.summary && (
        <p className="text-sm text-ink-300 leading-relaxed border-l-2 border-accent-400 pl-3">
          {data.summary}
        </p>
      )}
      <div className="space-y-2">
        <Section label="Insurance Claims" value={data.insurance_claims} />
        <Section label="Loss Records" value={data.loss_records} />
        <Section label="Workplace Incidents" value={data.workplace_incidents} />
        <Section label="Product Liability" value={data.product_liability} />
        <Section label="Safety Record" value={data.safety_record} />
      </div>
    </div>
  );
}
