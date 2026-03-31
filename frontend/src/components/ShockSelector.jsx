import './ShockSelector.css';

/* ── SVG Icons (matching the site's Feather-style line icons) ──── */
const SHOCK_ICONS = {
  oil_price: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  ),
  global_recession: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  export_boom: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  pandemic: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

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
        <svg className="shock-header-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
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
            <span className="shock-btn-icon">{SHOCK_ICONS[opt.id]}</span>
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
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
