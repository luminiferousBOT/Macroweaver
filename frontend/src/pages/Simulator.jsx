import { useState, useEffect, useRef } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import PolicySlider from '../components/PolicySlider'
import MetricCard from '../components/MetricCard'
import AIExplanation from '../components/AIExplanation'
import ShockSelector from '../components/ShockSelector'
import ExportReport from '../components/ExportReport'
import { fetchDefaults, runSimulation } from '../api'
import './Simulator.css'

const POLICY_CONFIG = [
  { key: 'tax_rate',     label: 'Tax Rate',           min: 5,   max: 40, unit: '%', desc: 'Corporate & income tax rate' },
  { key: 'subsidy',      label: 'Agriculture Subsidy', min: 0,   max: 50, unit: '%', desc: 'Subsidy as % of agricultural output' },
  { key: 'interest_rate', label: 'Interest Rate',      min: 1,   max: 15, unit: '%', desc: 'Central bank benchmark rate' },
  { key: 'gov_spending',  label: 'Government Spending', min: 5,  max: 30, unit: '%', desc: 'Public expenditure as % of GDP' },
  { key: 'import_tariff', label: 'Import Tariff',      min: 0,   max: 30, unit: '%', desc: 'Average tariff on imported goods' },
]

const COMPONENT_COLORS = {
  consumption: '#5C8A6A',
  investment:  '#7A6850',
  gov_spend:   '#4A6B8A',
  net_exports: '#8A5C6A',
}

export default function Simulator() {
  const [defaults, setDefaults] = useState(null)
  const [policies, setPolicies] = useState({
    tax_rate: 18, subsidy: 5, interest_rate: 6.5, gov_spending: 11, import_tariff: 5,
  })
  const [shockType, setShockType] = useState(null)
  const [shockIntensity, setShockIntensity] = useState('medium')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const resultsRef = useRef(null)
  const chartRef = useRef(null)

  // Load defaults on mount
  useEffect(() => {
    fetchDefaults()
      .then((data) => {
        setDefaults(data)
        // API returns flat: {tax_rate, subsidy, interest_rate, gov_spending, import_tariff, baseline}
        const { baseline, ...policyDefaults } = data
        setPolicies(policyDefaults)
      })
      .catch(() => {
        // Use hardcoded defaults if API unavailable
      })
  }, [])

  const handleSliderChange = (key, value) => {
    setPolicies((prev) => ({ ...prev, [key]: value }))
  }

  const handleSimulate = async () => {
    setLoading(true)
    setError(null)
    try {
      const payload = {
        ...policies,
        shock_type: shockType,
        shock_intensity: shockIntensity,
      }
      const data = await runSimulation(payload)
      setResults(data)
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (defaults) {
      const { baseline, ...policyDefaults } = defaults
      setPolicies(policyDefaults)
    }
    setShockType(null)
    setShockIntensity('medium')
    setResults(null)
    setError(null)
  }

  const handleShockChange = ({ shock_type, shock_intensity }) => {
    setShockType(shock_type)
    setShockIntensity(shock_intensity)
  }

  // Prepare chart data from results
  const chartData = results
    ? [
        { name: 'Consumption', value: results.consumption_delta, fill: COMPONENT_COLORS.consumption },
        { name: 'Investment', value: results.investment_delta, fill: COMPONENT_COLORS.investment },
        { name: 'Gov Spending', value: results.gov_spending_delta, fill: COMPONENT_COLORS.gov_spend },
        { name: 'Net Exports', value: results.net_exports_delta, fill: COMPONENT_COLORS.net_exports },
      ]
    : []

  // Baseline values from API (these are the economic indicators at default policy)
  const baselineValues = defaults?.baseline || {}

  return (
    <div className="simulator">
      <div className="container">
        {/* ─── Header ───────────────────────────────────── */}
        <div className="section" style={{ paddingBottom: 'var(--space-8)' }}>
          <p className="text-caption" style={{ marginBottom: 'var(--space-3)' }}>
            Policy Simulator
          </p>
          <h1 className="text-h1" style={{ marginBottom: 'var(--space-3)' }}>
            Adjust economic policy levers
          </h1>
          <p className="text-body" style={{ maxWidth: 560 }}>
            Move the sliders below to configure a policy scenario, then run the
            simulation to see projected macroeconomic outcomes.
          </p>
        </div>

        {/* ─── Controls ─────────────────────────────────── */}
        <div className="sim-layout">
          <aside className="sim-controls">
            <div className="card" style={{ position: 'sticky', top: 'calc(var(--nav-height) + var(--space-6))' }}>
              <h2 className="text-h3" style={{ marginBottom: 'var(--space-6)' }}>
                Policy Levers
              </h2>

              <div className="sim-sliders">
                {POLICY_CONFIG.map((cfg) => (
                  <PolicySlider
                    key={cfg.key}
                    label={cfg.label}
                    value={policies[cfg.key]}
                    onChange={(v) => handleSliderChange(cfg.key, v)}
                    min={cfg.min}
                    max={cfg.max}
                    unit={cfg.unit}
                    description={cfg.desc}
                  />
                ))}
              </div>

              {/* External Shock Selector */}
              <ShockSelector
                shockType={shockType}
                shockIntensity={shockIntensity}
                onChange={handleShockChange}
              />

              <div className="sim-actions">
                <button className="btn btn--primary" onClick={handleSimulate} disabled={loading}>
                  {loading ? (
                    <span className="simulating-dots">
                      Simulating<span>.</span><span>.</span><span>.</span>
                    </span>
                  ) : (
                    'Run Simulation'
                  )}
                  {!loading && <span className="btn__icon">→</span>}
                </button>
                <button className="btn btn--secondary btn--sm" onClick={handleReset}>
                  Reset to Baseline
                </button>
              </div>
            </div>
          </aside>

          {/* ─── Results ──────────────────────────────────── */}
          <div className="sim-results" ref={resultsRef}>
            {!results && !loading && !error && (
              <div className="sim-empty">
                <div className="sim-empty__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </div>
                <h3 className="text-h3">No simulation yet</h3>
                <p className="text-body">
                  Adjust the policy levers on the left and click
                  <strong style={{color:'var(--text-primary)'}}> Run Simulation </strong>
                  to see projected economic outcomes.
                </p>
              </div>
            )}

            {error && (
              <div className="card" style={{ borderLeft: '3px solid var(--negative)', background: 'var(--negative-bg)' }}>
                <p style={{ color: 'var(--negative)', fontWeight: 500 }}>
                  Error: {error}
                </p>
                <p className="text-body" style={{ marginTop: 'var(--space-2)' }}>
                  Make sure the backend server is running on port 8000.
                </p>
              </div>
            )}

            {(results || loading) && (
              <>
                {/* Metrics */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                    <p className="text-caption" style={{ margin: 0 }}>
                      Projected Outcomes
                    </p>
                    {results?.shock_active && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.2rem 0.6rem', borderRadius: '99px',
                        background: 'var(--accent-subtle)',
                        border: '1px solid rgba(45, 90, 61, 0.15)',
                        fontSize: '0.72rem', fontFamily: 'var(--font-sans)',
                        color: 'var(--accent)', fontWeight: 500,
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                        {results.shock_label}
                      </span>
                    )}
                  </div>
                  <div className="grid grid--5 sim-metrics">
                    <MetricCard
                      label="GDP Growth"
                      value={loading ? '—' : results.gdp_growth}
                      delta={results ? results.gdp_growth - (baselineValues.gdp_growth ?? results.gdp_growth) : null}
                      positive={true}
                    />
                    <MetricCard
                      label="Inflation"
                      value={loading ? '—' : results.inflation}
                      delta={results ? results.inflation - (baselineValues.inflation ?? results.inflation) : null}
                      positive={false}
                    />
                    <MetricCard
                      label="Unemployment"
                      value={loading ? '—' : results.unemployment}
                      delta={results ? results.unemployment - (baselineValues.unemployment ?? results.unemployment) : null}
                      positive={false}
                    />
                    <MetricCard
                      label="Fiscal Deficit"
                      value={loading ? '—' : results.fiscal_deficit}
                      delta={results ? results.fiscal_deficit - (baselineValues.fiscal_deficit ?? 0) : null}
                      positive={false}
                    />
                    <MetricCard
                      label="Trade Balance"
                      value={loading ? '—' : results.trade_balance}
                      delta={results ? results.trade_balance - (baselineValues.trade_balance ?? results.trade_balance) : null}
                      positive={true}
                    />
                  </div>
                </div>

                {/* GDP Component Breakdown Chart */}
                {results && (
                  <div>
                    <p className="text-caption" style={{ marginBottom: 'var(--space-4)' }}>
                      GDP Component Breakdown
                    </p>
                    <div className="card" style={{ padding: 'var(--space-6)' }} ref={chartRef}>
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartData} layout="vertical" barCategoryGap="25%">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(13,13,12,0.08)" horizontal={false} />
                          <XAxis
                            type="number"
                            tick={{ fill: '#8A8780', fontSize: 12, fontFamily: 'Inter' }}
                            axisLine={false}
                            tickLine={false}
                            unit=" pp"
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{ fill: '#5C5A54', fontSize: 13, fontFamily: 'Inter', fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                            width={110}
                          />
                          <Tooltip
                            formatter={(v) => [`${v > 0 ? '+' : ''}${v.toFixed(2)} pp`, 'Change']}
                            contentStyle={{
                              background: '#0D0D0C', color: '#F2F0EB', border: 'none',
                              borderRadius: 8, fontSize: 13, fontFamily: 'Inter',
                            }}
                            cursor={{ fill: 'rgba(13,13,12,0.03)' }}
                          />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, i) => (
                              <Cell key={i} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* AI Explanation */}
                <div>
                  <p className="text-caption" style={{ marginBottom: 'var(--space-4)' }}>
                    Interpretation
                  </p>
                  <AIExplanation
                    text={results?.ai_explanation}
                    loading={loading}
                  />
                </div>

                {/* Export Report */}
                {results && !loading && (
                  <ExportReport
                    policies={policies}
                    results={results}
                    chartRef={chartRef}
                    shockType={shockType}
                    shockIntensity={shockIntensity}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
