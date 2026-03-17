export default function MetricCard({ label, value, unit = '%', delta, positive }) {
  const sign = delta > 0 ? '+' : ''
  const deltaClass = delta > 0
    ? (positive ? 'metric__delta--positive' : 'metric__delta--negative')
    : delta < 0
      ? (positive ? 'metric__delta--negative' : 'metric__delta--positive')
      : ''

  const valueClass = delta > 0
    ? (positive ? 'metric__value--positive' : 'metric__value--negative')
    : delta < 0
      ? (positive ? 'metric__value--negative' : 'metric__value--positive')
      : 'metric__value--neutral'

  return (
    <div className="card metric">
      <span className="metric__label">{label}</span>
      <span className={`metric__value ${valueClass}`}>
        {value}{unit}
      </span>
      {delta !== undefined && delta !== null && (
        <span className={`metric__delta ${deltaClass}`}>
          {sign}{delta.toFixed(2)} pp from baseline
        </span>
      )}
    </div>
  )
}
