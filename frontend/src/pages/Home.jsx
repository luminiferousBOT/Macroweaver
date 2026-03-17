import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import heroGraphic from '../assets/hero-graphic.png'
import './Home.css'

export default function Home() {
  const heroRef = useRef(null)

  useEffect(() => {
    const el = heroRef.current
    if (el) {
      el.classList.add('page-enter')
      requestAnimationFrame(() => el.classList.add('page-active'))
    }
  }, [])

  return (
    <div ref={heroRef} className="page-enter">
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="section--hero">
        <div className="container">
          <div className="home-hero">
            <div className="home-hero__content">
              <p className="text-caption home-hero__tag">AI Economic Policy Advisor</p>
              <h1 className="text-display home-hero__title">
                Simulate economic policy.
                <br />
                <span className="text-serif">Understand the impact.</span>
              </h1>
              <p className="text-body-lg home-hero__desc">
                Adjust policy levers — tax rates, subsidies, interest rates — and
                instantly see projected macroeconomic outcomes, explained by AI.
              </p>
              <div className="home-hero__actions">
                <Link to="/simulate" className="btn btn--primary btn--lg">
                  Open Simulator
                  <span className="btn__icon">→</span>
                </Link>
                <Link to="/compare" className="btn btn--secondary btn--lg">
                  Compare Policies
                </Link>
              </div>
            </div>
            <div className="home-hero__graphic">
              <img src={heroGraphic} alt="Macroweaver economic data platform" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <p className="text-caption" style={{ marginBottom: 'var(--space-3)' }}>
            How it functions
          </p>
          <h2 className="text-h2" style={{ marginBottom: 'var(--space-10)' }}>
            Three steps to policy insight
          </h2>

          <div className="grid grid--3">
            <div className="home-step">
              <span className="home-step__number">01</span>
              <h3 className="text-h3">Set Policy Levers</h3>
              <p className="text-body">
                Adjust five key economic controls — tax rate, agriculture
                subsidy, interest rate, government spending, and import tariffs.
              </p>
            </div>

            <div className="home-step">
              <span className="home-step__number">02</span>
              <h3 className="text-h3">Run Simulation</h3>
              <p className="text-body">
                Our Keynesian GDP model calculates projected impacts on growth,
                inflation, unemployment, fiscal deficit, and trade balance.
              </p>
            </div>

            <div className="home-step">
              <span className="home-step__number">03</span>
              <h3 className="text-h3">Read AI Analysis</h3>
              <p className="text-body">
                Get a plain-English explanation of why the numbers moved —
                identifying dominant drivers, trade-offs, and sustainability
                concerns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Capabilities ───────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="grid grid--2 home-capabilities">
            <div className="card">
              <p className="text-caption" style={{ marginBottom: 'var(--space-4)' }}>
                Single Policy Analysis
              </p>
              <h3 className="text-h3" style={{ marginBottom: 'var(--space-3)' }}>
                Explore one scenario in depth
              </h3>
              <p className="text-body">
                See how each policy lever contributes to GDP growth through
                consumption, investment, government spending, and net exports.
                The AI explains the chain of cause and effect.
              </p>
              <Link to="/simulate" className="btn btn--secondary" style={{ marginTop: 'var(--space-6)' }}>
                Try Simulator →
              </Link>
            </div>

            <div className="card card--dark">
              <p className="text-caption" style={{ marginBottom: 'var(--space-4)', color: 'var(--text-tertiary)' }}>
                Policy Comparison
              </p>
              <h3 className="text-h3" style={{ marginBottom: 'var(--space-3)' }}>
                Compare two scenarios side by side
              </h3>
              <p className="text-body" style={{ color: 'rgba(242,240,235,0.65)' }}>
                Set up two different policy configurations and see how they
                perform head-to-head on every metric. The AI highlights key
                trade-offs between approaches.
              </p>
              <Link to="/compare" className="btn btn--secondary" style={{ marginTop: 'var(--space-6)', color: 'var(--text-on-dark)', borderColor: 'rgba(242,240,235,0.2)' }}>
                Try Comparison →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Data Source ─────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container container--narrow" style={{ textAlign: 'center' }}>
          <p className="text-caption" style={{ marginBottom: 'var(--space-3)' }}>
            Built on real data
          </p>
          <p className="text-body-lg">
            Baseline calibrated against{' '}
            <strong style={{color:'var(--text-primary)'}}>India's macroeconomic indicators (2003 – 2023)</strong>{' '}
            from the World Bank.
            GDP, inflation, employment, fiscal, and trade data — all feeding a Keynesian
            simulation framework.
          </p>
        </div>
      </section>
    </div>
  )
}
