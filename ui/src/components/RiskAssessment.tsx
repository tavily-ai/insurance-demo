interface Props {
  data: Record<string, any>;
}

function RiskField({ label, value }: { label: string; value?: string }) {
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

export default function RiskAssessment({ data }: Props) {
  return (
    <div className="space-y-4">
      {data.summary && (
        <p className="text-sm text-ink-300 leading-relaxed border-l-2 border-accent-400 pl-3">
          {data.summary}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <RiskField label="Financial Health" value={data.financial_health} />
        <RiskField label="Credit Ratings" value={data.credit_ratings} />
        <RiskField label="Operational Risks" value={data.operational_risks} />
        <RiskField label="Compliance History" value={data.compliance_history} />
        <RiskField label="Litigation History" value={data.litigation_history} />
        <RiskField label="ESG Risks" value={data.esg_risks} />
      </div>
    </div>
  );
}
