import './About.css'

export default function About() {
  return (
    <div className="about">
      <div className="container">
        {/* ─── Header ───────────────────────────────────── */}
        <div className="section" style={{ paddingBottom: 'var(--space-6)' }}>
          <p className="text-caption" style={{ marginBottom: 'var(--space-3)' }}>
            About the Model
          </p>
          <h1 className="text-h1" style={{ marginBottom: 'var(--space-4)' }}>
            How Macroweaver calculates <br />
            <span className="text-serif" style={{ fontWeight: 400 }}>economic outcomes</span>
          </h1>
          <p className="text-body-lg" style={{ maxWidth: 640 }}>
            Macroweaver uses a simplified Keynesian macroeconomic framework to
            project how changes in policy affect an economy. Everything
            you need to know about the model is given under the hood.
          </p>
        </div>

        {/* ─── The Core Equation ─────────────────────────── */}
        <section className="about-section">
          <div className="about-section__header">
            <span className="about-section__number">01</span>
            <h2 className="text-h2">The Core Equation</h2>
          </div>
          <div className="about-section__body">
            <p className="text-body">
              At the heart of the model sits the <strong>national income identity</strong>,
              the most fundamental equation in macroeconomics:
            </p>
            <div className="about-equation">
              <span className="about-equation__formula">GDP = C + I + G + (X − M)</span>
            </div>
            <div className="about-terms grid grid--2">
              <div className="about-term">
                <span className="about-term__symbol">C</span>
                <div>
                  <strong>Consumption</strong>
                  <p className="text-body">Household spending on goods and services. Driven primarily by disposable income — so tax changes hit this directly.</p>
                </div>
              </div>
              <div className="about-term">
                <span className="about-term__symbol">I</span>
                <div>
                  <strong>Investment</strong>
                  <p className="text-body">Business spending on capital, infrastructure, and equipment. Higher interest rates make borrowing expensive, reducing investment.</p>
                </div>
              </div>
              <div className="about-term">
                <span className="about-term__symbol">G</span>
                <div>
                  <strong>Government Spending</strong>
                  <p className="text-body">Public expenditure on services, infrastructure, defence, and welfare. Directly controlled by fiscal policy.</p>
                </div>
              </div>
              <div className="about-term">
                <span className="about-term__symbol" style={{ fontSize: '1.1rem' }}>X−M</span>
                <div>
                  <strong>Net Exports</strong>
                  <p className="text-body">Exports minus imports. Import tariffs can shift this balance by making foreign goods more expensive, encouraging domestic production.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Flow Diagram ──────────────────────────────── */}
        <section className="about-section">
          <div className="about-section__header">
            <span className="about-section__number">02</span>
            <h2 className="text-h2">How Policy Flows Through the Model</h2>
          </div>
          <div className="about-section__body">
            <p className="text-body" style={{ marginBottom: 'var(--space-6)' }}>
              When you move a policy slider, this is what happens step by step:
            </p>
            <div className="about-flow">
              {/* Step 1 */}
              <div className="about-flow__step">
                <div className="about-flow__dot" />
                <div className="about-flow__content">
                  <h4 className="text-h3">Compute Policy Delta</h4>
                  <p className="text-body">
                    The model calculates the <em>change</em> from the
                    baseline — for example, if India's default tax rate is 18%
                    and you set it to 25%, the delta is <strong>+7 percentage points</strong>.
                  </p>
                </div>
              </div>
              {/* Step 2 */}
              <div className="about-flow__step">
                <div className="about-flow__dot" />
                <div className="about-flow__content">
                  <h4 className="text-h3">Apply Diminishing Returns</h4>
                  <p className="text-body">
                    Large policy swings don't scale linearly — doubling a subsidy
                    doesn't double the effect. We apply a <strong>logarithmic curve</strong>{' '}
                    (<code>log(1 + |delta|)</code>) so that extreme changes have
                    progressively smaller marginal impact, mimicking real-world
                    economic behaviour.
                  </p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="about-flow__step">
                <div className="about-flow__dot" />
                <div className="about-flow__content">
                  <h4 className="text-h3">Multiply by Sensitivity Coefficients</h4>
                  <p className="text-body">
                    Each delta is multiplied by a <strong>calibrated coefficient</strong> that
                    captures how strongly that policy lever affects each output indicator.
                    These coefficients are drawn from macroeconomic literature. For example,
                    a 1pp increase in government spending has a +0.35 coefficient on GDP
                    growth, but +0.12 on inflation — spending grows the economy but also
                    pushes up prices.
                  </p>
                </div>
              </div>
              {/* Step 4 */}
              <div className="about-flow__step">
                <div className="about-flow__dot" />
                <div className="about-flow__content">
                  <h4 className="text-h3">Apply the Fiscal Multiplier</h4>
                  <p className="text-body">
                    GDP growth gets an additional <strong>1.5× multiplier</strong>.
                    This reflects the Keynesian multiplier effect — when the
                    government spends ₹1, it creates income that gets spent
                    again, generating more than ₹1 of total economic activity.
                  </p>
                </div>
              </div>
              {/* Step 5 */}
              <div className="about-flow__step">
                <div className="about-flow__dot" />
                <div className="about-flow__content">
                  <h4 className="text-h3">Sum and Project</h4>
                  <p className="text-body">
                    All the weighted contributions from every policy lever are
                    summed together and added to the real baseline values — giving
                    you the final projected GDP growth, inflation, unemployment,
                    fiscal deficit, and trade balance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Policy Levers ─────────────────────────────── */}
        <section className="about-section">
          <div className="about-section__header">
            <span className="about-section__number">03</span>
            <h2 className="text-h2">The Five Policy Levers</h2>
          </div>
          <div className="about-section__body">
            <p className="text-body" style={{ marginBottom: 'var(--space-6)' }}>
              These are the controls you adjust in the simulator. Each one
              has a distinct effect on multiple economic indicators:
            </p>
            <div className="about-levers">
              <div className="card about-lever">
                <h3 className="about-lever__name">Tax Rate</h3>
                <span className="about-lever__range">0 – 50%</span>
                <p className="text-body">
                  Corporate and income tax rate. <strong>Raising taxes</strong> reduces
                  disposable income and consumer spending (lower GDP), but generates
                  more government revenue (lower deficit). Conversely, <strong>cutting
                    taxes</strong> stimulates spending but may widen the fiscal gap.
                </p>
                <div className="about-lever__effects">
                  <span className="about-lever__effect about-lever__effect--negative">GDP ↓</span>
                  <span className="about-lever__effect about-lever__effect--positive">Deficit ↓</span>
                  <span className="about-lever__effect about-lever__effect--negative">Unemployment ↑</span>
                </div>
              </div>

              <div className="card about-lever">
                <h3 className="about-lever__name">Agriculture Subsidy</h3>
                <span className="about-lever__range">0 – 50%</span>
                <p className="text-body">
                  Government support for the agriculture sector as a percentage of
                  output. <strong>Higher subsidies</strong> boost
                  farm output and reduce food prices, but they cost money — widening
                  the fiscal deficit and potentially pushing up demand-driven inflation.
                </p>
                <div className="about-lever__effects">
                  <span className="about-lever__effect about-lever__effect--positive">GDP ↑</span>
                  <span className="about-lever__effect about-lever__effect--negative">Deficit ↑</span>
                  <span className="about-lever__effect about-lever__effect--negative">Inflation ↑</span>
                </div>
              </div>

              <div className="card about-lever">
                <h3 className="about-lever__name">Interest Rate</h3>
                <span className="about-lever__range">1 – 15%</span>
                <p className="text-body">
                  The central bank benchmark rate. <strong>Higher rates</strong> make
                  borrowing expensive, cooling investment and consumption. This is the
                  primary tool for <strong>controlling inflation</strong>, but overdoing
                  it can trigger an economic slowdown.
                </p>
                <div className="about-lever__effects">
                  <span className="about-lever__effect about-lever__effect--negative">GDP ↓</span>
                  <span className="about-lever__effect about-lever__effect--positive">Inflation ↓</span>
                  <span className="about-lever__effect about-lever__effect--negative">Unemployment ↑</span>
                </div>
              </div>

              <div className="card about-lever">
                <h3 className="about-lever__name">Government Spending</h3>
                <span className="about-lever__range">5 – 30%</span>
                <p className="text-body">
                  Public expenditure as a percentage of GDP. This has the <strong>strongest
                    direct effect on GDP</strong> through the fiscal multiplier. More
                  spending creates jobs and demand, but it also widens the deficit
                  and can fuel inflation if the economy is already running hot.
                </p>
                <div className="about-lever__effects">
                  <span className="about-lever__effect about-lever__effect--positive">GDP ↑↑</span>
                  <span className="about-lever__effect about-lever__effect--positive">Unemployment ↓</span>
                  <span className="about-lever__effect about-lever__effect--negative">Deficit ↑↑</span>
                </div>
              </div>

              <div className="card about-lever">
                <h3 className="about-lever__name">Import Tariff</h3>
                <span className="about-lever__range">0 – 30%</span>
                <p className="text-body">
                  Average tariff on imported goods. <strong>Higher tariffs</strong> protect
                  domestic industry and improve the trade balance, but they reduce
                  competition — so consumer prices go up (inflation rises). The GDP
                  effect is minor compared to other levers.
                </p>
                <div className="about-lever__effects">
                  <span className="about-lever__effect about-lever__effect--positive">Trade Balance ↑</span>
                  <span className="about-lever__effect about-lever__effect--negative">Inflation ↑</span>
                  <span className="about-lever__effect about-lever__effect--neutral">GDP (minor ↑)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Sensitivity Coefficients ──────────────────── */}
        <section className="about-section">
          <div className="about-section__header">
            <span className="about-section__number">04</span>
            <h2 className="text-h2">Sensitivity Coefficients</h2>
          </div>
          <div className="about-section__body">
            <p className="text-body" style={{ marginBottom: 'var(--space-6)' }}>
              Every policy lever affects each output indicator with a specific
              weight. Here's the full coefficient table — a value of
              <code> +0.35</code> means a 1 percentage-point increase in that policy
              lever pushes the indicator up by 0.35 pp (before diminishing returns):
            </p>
            <div className="card about-table-wrap">
              <table className="about-table">
                <thead>
                  <tr>
                    <th>Policy Lever</th>
                    <th>GDP Growth</th>
                    <th>Inflation</th>
                    <th>Unemployment</th>
                    <th>Fiscal Deficit</th>
                    <th>Trade Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="about-table__label">Tax Rate ↑</td>
                    <td className="about-table--neg">−0.18</td>
                    <td className="about-table--neg">−0.06</td>
                    <td className="about-table--neg">+0.08</td>
                    <td className="about-table--pos">−0.25</td>
                    <td className="about-table--neutral">—</td>
                  </tr>
                  <tr>
                    <td className="about-table__label">Subsidy ↑</td>
                    <td className="about-table--pos">+0.22</td>
                    <td className="about-table--neg">+0.10</td>
                    <td className="about-table--pos">−0.07</td>
                    <td className="about-table--neg">+0.30</td>
                    <td className="about-table--neutral">—</td>
                  </tr>
                  <tr>
                    <td className="about-table__label">Interest Rate ↑</td>
                    <td className="about-table--neg">−0.25</td>
                    <td className="about-table--pos">−0.12</td>
                    <td className="about-table--neg">+0.10</td>
                    <td className="about-table--neg">+0.05</td>
                    <td className="about-table--neutral">—</td>
                  </tr>
                  <tr>
                    <td className="about-table__label">Gov Spending ↑</td>
                    <td className="about-table--pos">+0.35</td>
                    <td className="about-table--neg">+0.12</td>
                    <td className="about-table--pos">−0.14</td>
                    <td className="about-table--neg">+0.40</td>
                    <td className="about-table--neutral">—</td>
                  </tr>
                  <tr>
                    <td className="about-table__label">Import Tariff ↑</td>
                    <td className="about-table--pos">+0.04</td>
                    <td className="about-table--neg">+0.15</td>
                    <td className="about-table--pos">−0.03</td>
                    <td className="about-table--neutral">—</td>
                    <td className="about-table--pos">+0.20</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-body" style={{ marginTop: 'var(--space-4)', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
              Green shading = economically desirable direction. Red = undesirable. Colors are contextual:
              for example, −0.12 on inflation (interest rate row) is green because <em>lower inflation is good</em>.
            </p>
          </div>
        </section>

        {/* ─── Output Indicators ─────────────────────────── */}
        <section className="about-section">
          <div className="about-section__header">
            <span className="about-section__number">05</span>
            <h2 className="text-h2">What the Outputs Mean</h2>
          </div>
          <div className="about-section__body">
            <div className="about-outputs">
              <div className="about-output">
                <div className="about-output__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                    <polyline points="16 7 22 7 22 13"></polyline>
                  </svg>
                </div>
                <div>
                  <h4 className="text-h3">GDP Growth</h4>
                  <p className="text-body">
                    The percentage change in total economic output. Higher is
                    better — it means the economy is producing more goods and
                    services. The model applies a <strong>1.5× fiscal multiplier</strong> to
                    this indicator, reflecting the Keynesian multiplier effect.
                  </p>
                </div>
              </div>
              <div className="about-output">
                <div className="about-output__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="5" x2="5" y2="19"></line>
                    <circle cx="6.5" cy="6.5" r="2.5"></circle>
                    <circle cx="17.5" cy="17.5" r="2.5"></circle>
                  </svg>
                </div>
                <div>
                  <h4 className="text-h3">Inflation</h4>
                  <p className="text-body">
                    The rate at which prices are rising. Some inflation is
                    normal and healthy (2–4%), but high inflation erodes
                    purchasing power. Demand-side policies (spending, subsidies)
                    tend to push it up; monetary tightening (interest rates) pulls it down.
                  </p>
                </div>
              </div>
              <div className="about-output">
                <div className="about-output__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-h3">Unemployment</h4>
                  <p className="text-body">
                    The percentage of the labour force without work. Lower is
                    better. Government spending and subsidies create jobs;
                    higher taxes and interest rates tend to increase joblessness
                    by slowing economic activity.
                  </p>
                </div>
              </div>
              <div className="about-output">
                <div className="about-output__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="22" x2="21" y2="22"></line>
                    <line x1="6" y1="18" x2="6" y2="11"></line>
                    <line x1="10" y1="18" x2="10" y2="11"></line>
                    <line x1="14" y1="18" x2="14" y2="11"></line>
                    <line x1="18" y1="18" x2="18" y2="11"></line>
                    <polygon points="12 2 20 7 4 7"></polygon>
                  </svg>
                </div>
                <div>
                  <h4 className="text-h3">Fiscal Deficit</h4>
                  <p className="text-body">
                    How much the government is spending <em>beyond</em> its
                    revenue, as a percentage of GDP. A growing deficit can
                    signal unsustainable policy. Taxes reduce it; spending
                    and subsidies widen it.
                  </p>
                </div>
              </div>
              <div className="about-output">
                <div className="about-output__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="text-h3">Trade Balance</h4>
                  <p className="text-body">
                    Exports minus imports as a percentage of GDP. A negative
                    value means the country imports more than it exports
                    (typical for India). Import tariffs can shift this balance
                    toward surplus by making foreign goods more expensive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── External Shock Simulation ─────────────────────── */}
        <section className="about-section">
          <div className="about-section__header">
            <span className="about-section__number">07</span>
            <h2 className="text-h2">External Shock Simulation</h2>
          </div>
          <div className="about-section__body">
            <p className="text-body">
              Real economies don't operate in a vacuum — they are constantly buffeted
              by <strong>exogenous shocks</strong>: events that arise outside the
              domestic policy framework but dramatically alter economic outcomes.
              Macroweaver lets you simulate four canonical shock scenarios on top
              of your policy choices.
            </p>

            <p className="text-body" style={{ marginTop: 'var(--space-4)' }}>
              Shocks are applied as <strong>additive adjustments</strong> to the
              simulation output. This means they modify the projected indicators
              <em> after</em> the core policy model has run, preserving the
              integrity of the policy simulation while layering in external effects.
            </p>

            <div className="about-outputs" style={{ marginTop: 'var(--space-6)' }}>
              <div className="about-output">
                <div className="about-output__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-h3">Oil Price Shock</h4>
                  <p className="text-body">
                    A sudden spike in global crude oil prices. This raises input costs
                    across the economy, pushing inflation up (+2.5pp), dampening growth
                    (−1.5pp), and worsening the trade balance (−0.6pp) as import bills
                    surge. Fiscal pressure also increases (+0.8pp deficit).
                  </p>
                </div>
              </div>
              <div className="about-output">
                <div className="about-output__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-h3">Global Recession</h4>
                  <p className="text-body">
                    A synchronized slowdown in major trading partners. Demand for exports
                    collapses, dragging GDP growth down sharply (−3.0pp). Unemployment
                    rises significantly (+1.8pp). Trade balance deteriorates (−1.5pp).
                    Interestingly, inflation may ease (−0.5pp) due to reduced demand.
                  </p>
                </div>
              </div>
              <div className="about-output">
                <div className="about-output__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-h3">Export Boom</h4>
                  <p className="text-body">
                    A positive shock — perhaps driven by a new trade agreement or
                    technological advantage. GDP growth surges (+2.0pp), unemployment
                    falls (−0.8pp), and the trade balance improves dramatically (+2.5pp).
                    The fiscal deficit narrows (−0.5pp) as tax revenues rise.
                  </p>
                </div>
              </div>
              <div className="about-output">
                <div className="about-output__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-h3">Pandemic Shock</h4>
                  <p className="text-body">
                    A severe public health crisis forcing economic shutdowns. This is the
                    most devastating shock: GDP contracts sharply (−4.5pp), unemployment
                    spikes (+3.0pp), fiscal deficits balloon (+2.5pp) from emergency
                    spending, and trade disruptions worsen the balance (−1.0pp).
                  </p>
                </div>
              </div>
            </div>

            <p className="text-body" style={{ marginTop: 'var(--space-6)' }}>
              Each shock can be applied at three intensity levels:
              <strong> Low</strong> (0.5× the base adjustment),
              <strong> Medium</strong> (1.0× — the values described above), and
              <strong> High</strong> (1.5× — amplified effects). The values shown
              above are for medium intensity.
            </p>

            <p className="text-body" style={{ marginTop: 'var(--space-4)' }}>
              When a shock is active, the AI explanation layer is also informed of
              the shock context, ensuring that generated analyses accurately reflect
              the combined effect of both policy decisions and external events. In
              the Compare page, each scenario can have a different shock applied
              independently, allowing you to explore questions like: <em>"How does
              an expansionary fiscal policy perform under a global recession vs.
              an oil price shock?"</em>
            </p>
          </div>
        </section>

        {/* ─── Data Source ───────────────────────────────── */}
        <section className="about-section" style={{ paddingBottom: 'var(--space-16)' }}>
          <div className="about-section__header">
            <span className="about-section__number">08</span>
            <h2 className="text-h2">Where the Data Comes From</h2>
          </div>
          <div className="about-section__body">
            <p className="text-body">
              The baseline values used in the model — GDP growth rate, inflation,
              unemployment, government spending as a share of GDP, trade figures —
              are sourced from <strong>World Bank Development Indicators</strong> for
              India, covering the period <strong>2003 to 2023</strong>. The most
              recent available year's values serve as the simulation baseline.
            </p>
            <p className="text-body" style={{ marginTop: 'var(--space-4)' }}>
              This means when you run the simulator with default settings, the
              numbers you see reflect India's actual most-recent economic state.
              Every policy change you make is a projected deviation from that
              real-world baseline.
            </p>
            <div className="about-disclaimer">
              <p>
                <strong>Disclaimer:</strong> Macroweaver is a simplified educational
                tool. Real economies are vastly more complex, with nonlinear feedback
                loops, political constraints, and global interdependencies that no
                simplified model can fully capture. Please use this as a tool of reference, not
                as policy advice.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
