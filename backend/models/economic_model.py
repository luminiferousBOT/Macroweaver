"""
Macroweaver — Economic Simulation Model
========================================

Simplified Keynesian macro-economic simulator.

Core identity:  GDP = C + I + G + (X - M)

The model takes a set of **policy inputs** (deltas from baseline) and
calculates the resulting changes in GDP growth, inflation, unemployment,
fiscal deficit, and trade balance using calibrated sensitivity
coefficients and a fiscal multiplier.

Policy levers
-------------
- tax_rate          (0 – 50 %)
- subsidy           (0 – 30 % of GDP)
- interest_rate     (0 – 15 %)
- gov_spending      (0 – 40 % of GDP)
- import_tariff     (0 – 50 %)
"""

from __future__ import annotations

import math
from dataclasses import asdict, dataclass, field
from typing import Dict, Optional, Tuple

from backend.data.loader import get_latest_values


# ── Data classes ──────────────────────────────────────────────────────────

@dataclass
class PolicyInput:
    """User-adjustable policy levers."""
    tax_rate: float = 25.0          # %
    subsidy: float = 5.0            # % of GDP
    interest_rate: float = 6.0      # %
    gov_spending: float = 11.0      # % of GDP
    import_tariff: float = 10.0     # %

    def validate(self) -> None:
        """Raise ValueError if any lever is out of range."""
        _check("tax_rate", self.tax_rate, 0, 50)
        _check("subsidy", self.subsidy, 0, 100)
        _check("interest_rate", self.interest_rate, 0, 15)
        _check("gov_spending", self.gov_spending, 0, 40)
        _check("import_tariff", self.import_tariff, 0, 50)


@dataclass
class SimulationResult:
    """Outputs of a single simulation run."""
    gdp_growth: float       # % change
    inflation: float        # % change
    unemployment: float     # % change
    fiscal_deficit: float   # % of GDP
    trade_balance: float    # % change

    # optional: breakdown of GDP components
    consumption_delta: float = 0.0
    investment_delta: float = 0.0
    gov_spending_delta: float = 0.0
    net_exports_delta: float = 0.0

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class ComparisonResult:
    """Side-by-side comparison of two policy scenarios."""
    policy_a: dict
    results_a: dict
    policy_b: dict
    results_b: dict

    def to_dict(self) -> dict:
        return asdict(self)


# ── Helpers ───────────────────────────────────────────────────────────────

def _check(name: str, value: float, lo: float, hi: float) -> None:
    if not (lo <= value <= hi):
        raise ValueError(f"{name} must be between {lo} and {hi}, got {value}")


def _diminishing(delta: float, scale: float = 1.0) -> float:
    """
    Apply a log-based diminishing-returns curve.
    Large policy swings produce proportionally smaller marginal effects.
    """
    if delta == 0:
        return 0.0
    sign = 1 if delta > 0 else -1
    return sign * math.log1p(abs(delta)) * scale


# ── Sensitivity coefficients ─────────────────────────────────────────────
# Each coefficient maps a 1-percentage-point change in a policy lever
# to its effect on an output variable.  Values are *rough* estimates
# informed by macro-economic literature.

COEFFICIENTS = {
    # ── Tax Rate ──
    # Higher taxes reduce consumption and slow GDP.
    "tax_to_gdp":           -0.18,      # 1pp tax ↑ → GDP ~–0.18pp
    "tax_to_inflation":     -0.06,      # less demand → lower prices
    "tax_to_unemployment":   0.08,      # slower economy → more jobless
    "tax_to_deficit":       -0.25,      # more revenue → deficit shrinks

    # ── Subsidy ──
    # Subsidies boost farm/manufacturing output, raising GDP but also
    # demand-pull inflation and the fiscal deficit.
    "sub_to_gdp":            0.22,
    "sub_to_inflation":      0.10,
    "sub_to_unemployment":  -0.07,
    "sub_to_deficit":        0.30,

    # ── Interest Rate ──
    # Higher rates discourage borrowing/investment.
    "ir_to_gdp":            -0.25,
    "ir_to_inflation":      -0.12,
    "ir_to_unemployment":    0.10,
    "ir_to_deficit":         0.05,      # may slightly raise debt-service

    # ── Government Spending ──
    "gs_to_gdp":             0.35,      # strong fiscal multiplier
    "gs_to_inflation":       0.12,
    "gs_to_unemployment":   -0.14,
    "gs_to_deficit":         0.40,

    # ── Import Tariff ──
    "tariff_to_gdp":         0.04,      # minor positive (import substitution)
    "tariff_to_inflation":   0.15,      # less competition → higher prices
    "tariff_to_unemployment":-0.03,
    "tariff_to_trade":       0.20,      # trade balance improves
}

FISCAL_MULTIPLIER = 1.5


# ── External Shock Profiles ──────────────────────────────────────────────
# Each shock defines **additive** adjustments (at medium intensity) to the
# five output indicators.  These are applied *after* the normal policy
# simulation, so the core model logic is untouched.

SHOCK_PROFILES = {
    "oil_price": {
        "gdp_growth":     -1.5,
        "inflation":      +2.5,
        "unemployment":   +0.3,
        "fiscal_deficit": +0.8,
        "trade_balance":  -0.6,
    },
    "global_recession": {
        "gdp_growth":     -3.0,
        "inflation":      -0.5,
        "unemployment":   +1.8,
        "fiscal_deficit": +1.2,
        "trade_balance":  -1.5,
    },
    "export_boom": {
        "gdp_growth":     +2.0,
        "inflation":      +0.3,
        "unemployment":   -0.8,
        "fiscal_deficit": -0.5,
        "trade_balance":  +2.5,
    },
    "pandemic": {
        "gdp_growth":     -4.5,
        "inflation":      +1.0,
        "unemployment":   +3.0,
        "fiscal_deficit": +2.5,
        "trade_balance":  -1.0,
    },
}

INTENSITY_MULTIPLIERS = {
    "low":    0.5,
    "medium": 1.0,
    "high":   1.5,
}

SHOCK_LABELS = {
    "oil_price":        "Oil Price Shock",
    "global_recession": "Global Recession",
    "export_boom":      "Export Boom",
    "pandemic":         "Pandemic Shock",
}


# ── Simulator ─────────────────────────────────────────────────────────────

class EconomicSimulator:
    """
    Stateless simulator.  Each call to `simulate()` produces a fresh
    result based on the difference between the supplied policy and
    the stored baseline.
    """

    def __init__(self, baseline: Optional[dict] = None) -> None:
        self.baseline = baseline or get_latest_values()
        self._default_policy = PolicyInput(
            tax_rate=self.baseline.get("tax_revenue_pct_gdp", 25.0),
            subsidy=5.0,  # not directly in WB data — use sensible default
            interest_rate=6.0,
            gov_spending=self.baseline.get("gov_spending_pct_gdp", 11.0),
            import_tariff=10.0,
        )

    # ── public API ────────────────────────────────────────────────────

    def get_defaults(self) -> dict:
        """Return the default (baseline) policy values."""
        return asdict(self._default_policy)

    def simulate(self, policy: PolicyInput) -> SimulationResult:
        """
        Run the economic model for a single policy configuration.

        Parameters
        ----------
        policy : PolicyInput
            The policy levers set by the user.

        Returns
        -------
        SimulationResult
        """
        policy.validate()
        C = COEFFICIENTS

        # Deltas from baseline
        d_tax     = policy.tax_rate      - self._default_policy.tax_rate
        d_sub     = policy.subsidy       - self._default_policy.subsidy
        d_ir      = policy.interest_rate - self._default_policy.interest_rate
        d_gs      = policy.gov_spending  - self._default_policy.gov_spending
        d_tariff  = policy.import_tariff - self._default_policy.import_tariff

        # ── GDP growth ────────────────────────────────────────────
        gdp_raw = (
            _diminishing(d_tax,    C["tax_to_gdp"])
            + _diminishing(d_sub,  C["sub_to_gdp"])
            + _diminishing(d_ir,   C["ir_to_gdp"])
            + _diminishing(d_gs,   C["gs_to_gdp"])
            + _diminishing(d_tariff, C["tariff_to_gdp"])
        )
        gdp_growth = round(
            self.baseline["gdp_growth_pct"] + gdp_raw * FISCAL_MULTIPLIER,
            2,
        )

        # ── Inflation ─────────────────────────────────────────────
        inflation_raw = (
            _diminishing(d_tax,    C["tax_to_inflation"])
            + _diminishing(d_sub,  C["sub_to_inflation"])
            + _diminishing(d_ir,   C["ir_to_inflation"])
            + _diminishing(d_gs,   C["gs_to_inflation"])
            + _diminishing(d_tariff, C["tariff_to_inflation"])
        )
        inflation = round(
            self.baseline["inflation_pct"] + inflation_raw,
            2,
        )

        # ── Unemployment ──────────────────────────────────────────
        unemp_raw = (
            _diminishing(d_tax,    C["tax_to_unemployment"])
            + _diminishing(d_sub,  C["sub_to_unemployment"])
            + _diminishing(d_ir,   C["ir_to_unemployment"])
            + _diminishing(d_gs,   C["gs_to_unemployment"])
            + _diminishing(d_tariff, C["tariff_to_unemployment"])
        )
        unemployment = round(
            self.baseline["unemployment_pct"] + unemp_raw,
            2,
        )
        # Clamp to [0, 100]
        unemployment = max(0.0, min(100.0, unemployment))

        # ── Fiscal Deficit ────────────────────────────────────────
        deficit_raw = (
            _diminishing(d_tax,    C["tax_to_deficit"])
            + _diminishing(d_sub,  C["sub_to_deficit"])
            + _diminishing(d_ir,   C["ir_to_deficit"])
            + _diminishing(d_gs,   C["gs_to_deficit"])
        )
        fiscal_deficit = round(deficit_raw, 2)

        # ── Trade Balance ─────────────────────────────────────────
        trade_raw = _diminishing(d_tariff, C["tariff_to_trade"])
        # Tariff also reduces imports relative to exports
        exports = self.baseline["exports_pct_gdp"]
        imports = self.baseline["imports_pct_gdp"]
        base_trade = exports - imports      # negative for India typically
        trade_balance = round(base_trade + trade_raw, 2)

        # ── Component deltas (for detail charts) ──────────────────
        consumption_delta = round(
            _diminishing(d_tax, C["tax_to_gdp"]) * FISCAL_MULTIPLIER * 0.6,
            2,
        )
        investment_delta = round(
            _diminishing(d_ir, C["ir_to_gdp"]) * FISCAL_MULTIPLIER * 0.8,
            2,
        )
        gov_delta = round(
            _diminishing(d_gs, C["gs_to_gdp"]) * FISCAL_MULTIPLIER * 0.9,
            2,
        )
        net_exports_delta = round(trade_raw * 0.5, 2)

        return SimulationResult(
            gdp_growth=gdp_growth,
            inflation=inflation,
            unemployment=unemployment,
            fiscal_deficit=fiscal_deficit,
            trade_balance=trade_balance,
            consumption_delta=consumption_delta,
            investment_delta=investment_delta,
            gov_spending_delta=gov_delta,
            net_exports_delta=net_exports_delta,
        )

    def compare(
        self,
        policy_a: PolicyInput,
        policy_b: PolicyInput,
    ) -> ComparisonResult:
        """Run both policies and return side-by-side results."""
        results_a = self.simulate(policy_a)
        results_b = self.simulate(policy_b)
        return ComparisonResult(
            policy_a=asdict(policy_a),
            results_a=results_a.to_dict(),
            policy_b=asdict(policy_b),
            results_b=results_b.to_dict(),
        )

    @staticmethod
    def apply_shock(
        result: SimulationResult,
        shock_type: str,
        intensity: str = "medium",
    ) -> SimulationResult:
        """
        Apply an external shock to an existing simulation result.

        The shock adjustments are **additive** — they modify the values
        produced by the normal policy simulation.  This keeps the core
        model clean and allows shocks to stack naturally on top of any
        policy configuration.

        Parameters
        ----------
        result : SimulationResult
            Output from a prior `simulate()` call.
        shock_type : str
            One of: oil_price, global_recession, export_boom, pandemic.
        intensity : str
            One of: low, medium, high.

        Returns
        -------
        SimulationResult
            A new result with shock adjustments applied.
        """
        profile = SHOCK_PROFILES.get(shock_type)
        if profile is None:
            raise ValueError(
                f"Unknown shock type '{shock_type}'. "
                f"Valid options: {list(SHOCK_PROFILES.keys())}"
            )
        mult = INTENSITY_MULTIPLIERS.get(intensity, 1.0)

        return SimulationResult(
            gdp_growth=round(result.gdp_growth + profile["gdp_growth"] * mult, 2),
            inflation=round(result.inflation + profile["inflation"] * mult, 2),
            unemployment=max(0.0, min(100.0, round(
                result.unemployment + profile["unemployment"] * mult, 2
            ))),
            fiscal_deficit=round(
                result.fiscal_deficit + profile["fiscal_deficit"] * mult, 2
            ),
            trade_balance=round(
                result.trade_balance + profile["trade_balance"] * mult, 2
            ),
            consumption_delta=result.consumption_delta,
            investment_delta=result.investment_delta,
            gov_spending_delta=result.gov_spending_delta,
            net_exports_delta=result.net_exports_delta,
        )


# ── Quick smoke test ──────────────────────────────────────────────────────
if __name__ == "__main__":
    sim = EconomicSimulator()
    print("=== Default policy ===")
    for k, v in sim.get_defaults().items():
        print(f"  {k:>20s}: {v}")

    print("\n=== Baseline simulation (no policy changes) ===")
    default_policy = PolicyInput(**sim.get_defaults())
    result = sim.simulate(default_policy)
    for k, v in result.to_dict().items():
        print(f"  {k:>25s}: {v}")

    print("\n=== Scenario: High subsidy + low tax ===")
    scenario = PolicyInput(tax_rate=15, subsidy=20, interest_rate=5, gov_spending=15, import_tariff=10)
    result = sim.simulate(scenario)
    for k, v in result.to_dict().items():
        print(f"  {k:>25s}: {v}")

    print("\n=== Policy comparison ===")
    policy_a = PolicyInput(tax_rate=20, subsidy=10, interest_rate=6, gov_spending=12, import_tariff=10)
    policy_b = PolicyInput(tax_rate=15, subsidy=20, interest_rate=4, gov_spending=18, import_tariff=5)
    comparison = sim.compare(policy_a, policy_b)
    print("Policy A results:")
    for k, v in comparison.results_a.items():
        print(f"  {k:>25s}: {v}")
    print("Policy B results:")
    for k, v in comparison.results_b.items():
        print(f"  {k:>25s}: {v}")
