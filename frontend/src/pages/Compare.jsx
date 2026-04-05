import { useState, useEffect, useRef } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell
} from 'recharts'
import PolicySlider from '../components/PolicySlider'
import AIExplanation from '../components/AIExplanation'
import ShockSelector from '../components/ShockSelector'
import { fetchDefaults, runComparison } from '../api'
import './Compare.css'

const POLICY_CONFIG = [
  { key: 'tax_rate',     label: 'Tax Rate',           min: 5,   max: 40, unit: '%' },
  { key: 'subsidy',      label: 'Agriculture Subsidy', min: 0,   max: 50, unit: '%' },
  { key: 'interest_rate', label: 'Interest Rate',      min: 1,   max: 15, unit: '%' },
  { key: 'gov_spending',  label: 'Government Spending', min: 5,  max: 30, unit: '%' },
  { key: 'import_tariff', label: 'Import Tariff',      min: 0,   max: 30, unit: '%' },
]

const METRICS = [
  { key: 'gdp_growth',    label: 'GDP Growth',     unit: '%', good: 'higher' },
  { key: 'inflation',     label: 'Inflation',      unit: '%', good: 'lower' },
  { key: 'unemployment',  label: 'Unemployment',   unit: '%', good: 'lower' },
  { key: 'fiscal_deficit', label: 'Fiscal Deficit', unit: '%', good: 'lower' },
  { key: 'trade_balance', label: 'Trade Balance',  unit: '%', good: 'higher' },
]

const PRESET_SCENARIOS = {
  conservative: {
    label: 'Conservative',
    desc: 'Low spending, low tax',
    values: { tax_rate: 12, subsidy: 3, interest_rate: 7, gov_spending: 8, import_tariff: 8 },
  },
  expansionary: {
    label: 'Expansionary',
    desc: 'High spending, high subsidy',
    values: { tax_rate: 20, subsidy: 25, interest_rate: 4, gov_spending: 20, import_tariff: 5 },
  },
  protectionist: {
    label: 'Protectionist',
    desc: 'High tariffs, high subsidy',
    values: { tax_rate: 15, subsidy: 15, interest_rate: 6, gov_spending: 12, import_tariff: 25 },
  },
}

export default function Compare() {
  const [defaults, setDefaults] = useState(null)

  const [scenarioA, setScenarioA] = useState({
    tax_rate: 18, subsidy: 5, interest_rate: 6.5, gov_spending: 11, import_tariff: 5,
  })
  const [scenarioB, setScenarioB] = useState({
    tax_rate: 12, subsidy: 20, interest_rate: 4, gov_spending: 18, import_tariff: 10,
  })
  const [shockA, setShockA] = useState({ type: null, intensity: 'medium' })
  const [shockB, setShockB] = useState({ type: null, intensity: 'medium' })
  const [labelA, setLabelA] = useState('Scenario A')
  const [labelB, setLabelB] = useState('Scenario B')

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const resultsRef = useRef(null)

  useEffect(() => {
    fetchDefaults()
      .then((data) => {
        setDefaults(data)
        const { baseline, ...policyDefaults } = data
        setScenarioA(policyDefaults)
      })
      .catch(() => {})
  }, [])

  const handleCompare = async () => {
    setLoading(true)
    setError(null)
    try {
      const payloadA = {
        ...scenarioA,
        shock_type: shockA.type,
        shock_intensity: shockA.intensity,
      }
      const payloadB = {
        ...scenarioB,
        shock_type: shockB.type,
        shock_intensity: shockB.intensity,
      }
      const data = await runComparison(payloadA, payloadB)
      setResults(data)
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applyPreset = (setter, preset) => {
    setter(PRESET_SCENARIOS[preset].values)
  }

  // Radar chart data
  const radarData = results
    ? METRICS.map((m) => ({
        metric: m.label.replace(' ', '\n'),
        A: results.results_a[m.key],
        B: results.results_b[m.key],
      }))
    : []

  // Side-by-side bar data
  const barData = results
    ? METRICS.map((m) => ({
        name: m.label,
        A: results.results_a[m.key],
        B: results.results_b[m.key],
      }))
    : []

  return (
    <div className="compare">
      <div className="container">
        {/* ─── Header ───────────────────────────────────── */}
        <div className="section" style={{ paddingBottom: 'var(--space-6)' }}>
          <p className="text-caption" style={{ marginBottom: 'var(--space-3)' }}>
            Policy Comparison
          </p>
          <h1 className="text-h1" style={{ marginBottom: 'var(--space-3)' }}>
            Compare two policy scenarios
          </h1>
          <p className="text-body" style={{ maxWidth: 560 }}>
            Configure two different sets of policy levers and see how they
            perform against each other on key economic indicators.
          </p>
        </div>

        {/* ─── Scenario Panels ──────────────────────────── */}
        <div className="compare-panels">
          {/* Scenario A */}
          <div className="card compare-panel">
            <div className="compare-panel__header">
              <input
                className="compare-panel__name"
                value={labelA}
                onChange={(e) => setLabelA(e.target.value)}
                placeholder="Scenario A"
              />
              <div className="compare-panel__presets">
                {Object.entries(PRESET_SCENARIOS).map(([key, p]) => (
                  <button
                    key={key}
                    className="btn btn--sm btn--secondary"
                    onClick={() => applyPreset(setScenarioA, key)}
                    title={p.desc}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="compare-sliders">
              {POLICY_CONFIG.map((cfg) => (
                <PolicySlider
                  key={cfg.key}
                  label={cfg.label}
                  value={scenarioA[cfg.key]}
                  onChange={(v) => setScenarioA((prev) => ({ ...prev, [cfg.key]: v }))}
                  min={cfg.min}
                  max={cfg.max}
                  unit={cfg.unit}
                />
              ))}
            </div>
            <ShockSelector
              shockType={shockA.type}
              shockIntensity={shockA.intensity}
              onChange={({ shock_type, shock_intensity }) => setShockA({ type: shock_type, intensity: shock_intensity })}
            />
          </div>

          {/* VS Divider */}
          <div className="compare-vs">
            <span>vs</span>
          </div>

          {/* Scenario B */}
          <div className="card compare-panel">
            <div className="compare-panel__header">
              <input
                className="compare-panel__name"
                value={labelB}
                onChange={(e) => setLabelB(e.target.value)}
                placeholder="Scenario B"
              />
              <div className="compare-panel__presets">
                {Object.entries(PRESET_SCENARIOS).map(([key, p]) => (
                  <button
                    key={key}
                    className="btn btn--sm btn--secondary"
                    onClick={() => applyPreset(setScenarioB, key)}
                    title={p.desc}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="compare-sliders">
              {POLICY_CONFIG.map((cfg) => (
                <PolicySlider
                  key={cfg.key}
                  label={cfg.label}
                  value={scenarioB[cfg.key]}
                  onChange={(v) => setScenarioB((prev) => ({ ...prev, [cfg.key]: v }))}
                  min={cfg.min}
                  max={cfg.max}
                  unit={cfg.unit}
                />
              ))}
            </div>
            <ShockSelector
              shockType={shockB.type}
              shockIntensity={shockB.intensity}
              onChange={({ shock_type, shock_intensity }) => setShockB({ type: shock_type, intensity: shock_intensity })}
            />
          </div>
        </div>

        {/* ─── Compare Button ───────────────────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8) 0' }}>
          <button className="btn btn--primary btn--lg" onClick={handleCompare} disabled={loading}>
            {loading ? (
              <span className="simulating-dots">
                Comparing<span>.</span><span>.</span><span>.</span>
              </span>
            ) : (
              'Compare Scenarios'
            )}
            {!loading && <span className="btn__icon">→</span>}
          </button>
        </div>

        {error && (
          <div className="card" style={{ borderLeft: '3px solid var(--negative)', background: 'var(--negative-bg)', marginBottom: 'var(--space-8)' }}>
            <p style={{ color: 'var(--negative)', fontWeight: 500 }}>Error: {error}</p>
            <p className="text-body" style={{ marginTop: 'var(--space-2)' }}>
              Make sure the backend server is running on port 8000.
            </p>
          </div>
        )}

        {/* ─── Results ──────────────────────────────────── */}
        {(results || loading) && (
          <div ref={resultsRef} className="compare-results">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
              <p className="text-caption" style={{ margin: 0 }}>
                Comparison Results
              </p>
              {results?.results_a?.shock_active && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.2rem 0.6rem', borderRadius: '99px',
                  background: 'var(--accent-subtle)',
                  border: '1px solid rgba(45, 90, 61, 0.15)',
                  fontSize: '0.72rem', fontFamily: 'var(--font-sans)',
                  color: 'var(--accent)', fontWeight: 500,
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                  A: {results.results_a.shock_label}
                </span>
              )}
              {results?.results_b?.shock_active && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.2rem 0.6rem', borderRadius: '99px',
                  background: 'rgba(122, 104, 80, 0.08)',
                  border: '1px solid rgba(122, 104, 80, 0.15)',
                  fontSize: '0.72rem', fontFamily: 'var(--font-sans)',
                  color: '#7A6850', fontWeight: 500,
                }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                  B: {results.results_b.shock_label}
                </span>
              )}
            </div>

            {/* Metric Table */}
            <div className="card compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>{labelA}</th>
                    <th>{labelB}</th>
                    <th>Better</th>
                  </tr>
                </thead>
                <tbody>
                  {METRICS.map((m) => {
                    const a = results?.results_a?.[m.key]
                    const b = results?.results_b?.[m.key]
                    let winner = ''
                    if (a !== undefined && b !== undefined) {
                      if (m.good === 'higher') winner = a > b ? 'A' : a < b ? 'B' : 'Tie'
                      else winner = a < b ? 'A' : a > b ? 'B' : 'Tie'
                    }
                    return (
                      <tr key={m.key}>
                        <td className="compare-table__label">{m.label}</td>
                        <td className={winner === 'A' ? 'compare-table__winner' : ''}>
                          {loading ? '—' : `${a}${m.unit}`}
                        </td>
                        <td className={winner === 'B' ? 'compare-table__winner' : ''}>
                          {loading ? '—' : `${b}${m.unit}`}
                        </td>
                        <td>
                          {winner && !loading && (
                            <span className={`compare-badge compare-badge--${winner.toLowerCase()}`}>
                              {winner === 'Tie' ? 'Tie' : winner === 'A' ? labelA : labelB}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Charts */}
            {results && (
              <div className="grid grid--2" style={{ marginTop: 'var(--space-6)' }}>
                {/* Radar Chart */}
                <div className="card">
                  <p className="text-caption" style={{ marginBottom: 'var(--space-4)' }}>
                    Radar Overview
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(13,13,12,0.1)" />
                      <PolarAngleAxis
                        dataKey="metric"
                        tick={{ fill: '#5C5A54', fontSize: 11, fontFamily: 'Inter' }}
                      />
                      <Radar
                        name={labelA}
                        dataKey="A"
                        stroke="#5C8A6A"
                        fill="#5C8A6A"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Radar
                        name={labelB}
                        dataKey="B"
                        stroke="#8A5C6A"
                        fill="#8A5C6A"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#0D0D0C', color: '#F2F0EB', border: 'none',
                          borderRadius: 8, fontSize: 13, fontFamily: 'Inter',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div className="card">
                  <p className="text-caption" style={{ marginBottom: 'var(--space-4)' }}>
                    Side-by-Side
                  </p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,13,12,0.08)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#8A8780', fontSize: 11, fontFamily: 'Inter' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#8A8780', fontSize: 11, fontFamily: 'Inter' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(v) => [`${v}%`, '']}
                        contentStyle={{
                          background: '#0D0D0C', color: '#F2F0EB', border: 'none',
                          borderRadius: 8, fontSize: 13, fontFamily: 'Inter',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'Inter' }} />
                      <Bar dataKey="A" name={labelA} fill="#5C8A6A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="B" name={labelB} fill="#8A5C6A" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* AI Explanation */}
            <div style={{ marginTop: 'var(--space-6)' }}>
              <p className="text-caption" style={{ marginBottom: 'var(--space-4)' }}>
                AI Comparative Analysis
              </p>
              <AIExplanation
                text={results?.ai_comparison}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
