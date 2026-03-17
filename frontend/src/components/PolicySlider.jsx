export default function PolicySlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.5,
  unit = '%',
  description,
}) {
  return (
    <div className="slider-group">
      <div className="slider-group__header">
        <label className="slider-group__label">{label}</label>
        <span className="slider-group__value">
          {value}
          {unit}
        </span>
      </div>

      {description && (
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>
          {description}
        </p>
      )}

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />

      <div className="slider-group__range">
        <span className="slider-group__bound">{min}{unit}</span>
        <span className="slider-group__bound">{max}{unit}</span>
      </div>
    </div>
  )
}
