import './ShockSelector.css';



const SHOCK_OPTIONS = [
  { id: 'oil_price',        label: 'Oil Price Shock' },
  { id: 'global_recession', label: 'Global Recession' },
  { id: 'export_boom',      label: 'Export Boom' },
  { id: 'pandemic',         label: 'Pandemic Shock' },
];

const INTENSITY_LEVELS = ['low', 'medium', 'high'];

/**
 * ShockSelector — lets users pick an external economic shock
 * and its intensity.  Fires onChange({ shock_type, shock_intensity })
 * whenever the selection changes.
 *
 * Props:
 *  - shockType:      current shock_type  (string | null)
 *  - shockIntensity: current intensity   ("low" | "medium" | "high")
 *  - onChange:        (updates) => void
 */
export default function ShockSelector({ shockType, shockIntensity, onChange }) {
  const handleShockSelect = (id) => {
    if (shockType === id) {
      onChange({ shock_type: null, shock_intensity: 'medium' });
    } else {
      onChange({ shock_type: id, shock_intensity: shockIntensity || 'medium' });
    }
  };

  const handleIntensitySelect = (level) => {
    onChange({ shock_type: shockType, shock_intensity: level });
  };

  const handleClear = () => {
    onChange({ shock_type: null, shock_intensity: 'medium' });
  };

  const activeLabel = SHOCK_OPTIONS.find(s => s.id === shockType)?.label;

  return (
    <div className="shock-section">
      <div className="shock-section-header">
        <h3>External Shocks</h3>
      </div>
      <p className="shock-section-subtitle">
        Simulate an exogenous economic event alongside your policy choices.
      </p>

      {/* Shock type toggles */}
      <div className="shock-toggle-grid">
        {SHOCK_OPTIONS.map(opt => (
          <button
            key={opt.id}
            type="button"
            className={`shock-toggle-btn${shockType === opt.id ? ' active' : ''}`}
            onClick={() => handleShockSelect(opt.id)}
            aria-pressed={shockType === opt.id}
          >
            <span className="shock-btn-label">{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Clear button */}
      {shockType && (
        <button
          type="button"
          className="shock-clear-btn"
          onClick={handleClear}
        >
          Clear shock
        </button>
      )}

      {/* Intensity selector */}
      {shockType && (
        <div className="shock-intensity-section">
          <p className="shock-intensity-label">Intensity</p>
          <div className="shock-intensity-track">
            {INTENSITY_LEVELS.map(level => (
              <button
                key={level}
                type="button"
                className={`shock-intensity-option${shockIntensity === level ? ' active' : ''}`}
                onClick={() => handleIntensitySelect(level)}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active shock banner */}
      {shockType && (
        <div className="shock-active-banner">
          <span className="shock-pulse-dot" />
          <span className="shock-active-text">
            {activeLabel} — {(shockIntensity || 'medium').charAt(0).toUpperCase() + (shockIntensity || 'medium').slice(1)}
          </span>
        </div>
      )}
    </div>
  );
}
