interface MetricCardProps {
  label: string;
  value: string;
  detail?: string;
  positive?: boolean;
}

export function MetricCard({
  label,
  value,
  detail,
  positive,
}: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>

      <div className="metric-value">{value}</div>

      {detail && (
        <div className={positive ? "metric-detail positive" : "metric-detail"}>
          {detail}
        </div>
      )}
    </div>
  );
}
