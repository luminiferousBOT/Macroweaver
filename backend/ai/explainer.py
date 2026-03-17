"""
Macroweaver — AI Explanation Layer
===================================

Generates human-readable explanations of economic simulation results.

Primary path:  Groq API  (Llama 3.3 / Mixtral — free tier, fast inference)
Fallback path: Rule-based templates when AI is unavailable
"""

from __future__ import annotations

import os
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)


# ── Rule-based fallback ──────────────────────────────────────────────────

def _identify_dominant_factors(policy_deltas: Dict[str, float]) -> list:
    """
    Rank policy levers by absolute magnitude of change.
    Returns list of (lever_name, delta) sorted by |delta| descending.
    """
    readable = {
        "tax_rate": "tax rate",
        "subsidy": "agriculture subsidy",
        "interest_rate": "interest rate",
        "gov_spending": "government spending",
        "import_tariff": "import tariff",
    }
    items = [
        (readable.get(k, k), v)
        for k, v in policy_deltas.items()
        if abs(v) > 0.01
    ]
    items.sort(key=lambda x: abs(x[1]), reverse=True)
    return items


def _direction_word(value: float) -> str:
    if value > 0:
        return "increase"
    elif value < 0:
        return "decrease"
    return "remain stable"


def _fallback_explain_single(
    policy_deltas: Dict[str, float],
    results: dict,
) -> str:
    """Generate a rule-based explanation when AI API is unavailable."""
    factors = _identify_dominant_factors(policy_deltas)
    if not factors:
        return (
            "No significant policy changes were made. "
            "The economic indicators remain at baseline levels."
        )

    primary = factors[0]
    gdp = results.get("gdp_growth", 0)
    inflation = results.get("inflation", 0)
    unemployment = results.get("unemployment", 0)
    deficit = results.get("fiscal_deficit", 0)

    lines = []

    # Lead with the dominant policy lever
    direction = "increased" if primary[1] > 0 else "decreased"
    lines.append(
        f"The most significant policy change is a {abs(primary[1]):.1f} "
        f"percentage-point {direction} in {primary[0]}."
    )

    # GDP
    lines.append(
        f"GDP growth is projected at {gdp:.2f}%, reflecting the "
        f"combined effect of the policy changes."
    )

    # Inflation
    if abs(inflation) > 0.1:
        inf_dir = "higher" if inflation > 5.66 else "lower"
        lines.append(
            f"Inflation is expected to be {inf_dir} at {inflation:.2f}%."
        )

    # Unemployment
    if abs(unemployment) > 0.1:
        unemp_dir = "decrease" if unemployment < 3.2 else "increase"
        lines.append(
            f"Unemployment is projected to {unemp_dir} to {unemployment:.2f}%."
        )

    # Fiscal deficit warning
    if deficit > 1.0:
        lines.append(
            f"⚠️ The fiscal deficit widens to {deficit:.2f}% of GDP, "
            f"which could pressure government finances."
        )

    return " ".join(lines)


def _fallback_explain_comparison(
    policy_a_deltas: Dict[str, float],
    results_a: dict,
    policy_b_deltas: Dict[str, float],
    results_b: dict,
) -> str:
    """Generate a rule-based comparison when AI API is unavailable."""
    gdp_a = results_a.get("gdp_growth", 0)
    gdp_b = results_b.get("gdp_growth", 0)
    inf_a = results_a.get("inflation", 0)
    inf_b = results_b.get("inflation", 0)
    unemp_a = results_a.get("unemployment", 0)
    unemp_b = results_b.get("unemployment", 0)
    def_a = results_a.get("fiscal_deficit", 0)
    def_b = results_b.get("fiscal_deficit", 0)

    lines = []

    # GDP comparison
    if gdp_a > gdp_b:
        lines.append(
            f"Policy A produces stronger GDP growth ({gdp_a:.2f}% vs {gdp_b:.2f}%)."
        )
    elif gdp_b > gdp_a:
        lines.append(
            f"Policy B produces stronger GDP growth ({gdp_b:.2f}% vs {gdp_a:.2f}%)."
        )
    else:
        lines.append("Both policies achieve similar GDP growth.")

    # Inflation
    if inf_a != inf_b:
        lower = "A" if inf_a < inf_b else "B"
        lines.append(
            f"Policy {lower} keeps inflation lower "
            f"({min(inf_a, inf_b):.2f}% vs {max(inf_a, inf_b):.2f}%)."
        )

    # Unemployment
    if unemp_a != unemp_b:
        better = "A" if unemp_a < unemp_b else "B"
        lines.append(
            f"Policy {better} achieves lower unemployment "
            f"({min(unemp_a, unemp_b):.2f}% vs {max(unemp_a, unemp_b):.2f}%)."
        )

    # Deficit trade-off
    if abs(def_a - def_b) > 0.2:
        cheaper = "A" if def_a < def_b else "B"
        lines.append(
            f"However, Policy {cheaper} is more fiscally sustainable "
            f"with a lower deficit ({min(def_a, def_b):.2f}% vs {max(def_a, def_b):.2f}%)."
        )

    return " ".join(lines)


# ── AI-powered explanations (Groq) ───────────────────────────────────────

def _build_single_prompt(
    policy_deltas: Dict[str, float],
    results: dict,
) -> str:
    """Build the LLM prompt for a single simulation."""
    changes = []
    readable = {
        "tax_rate": "Tax Rate",
        "subsidy": "Agriculture Subsidy",
        "interest_rate": "Interest Rate",
        "gov_spending": "Government Spending",
        "import_tariff": "Import Tariff",
    }
    for k, v in policy_deltas.items():
        if abs(v) > 0.01:
            direction = "increased" if v > 0 else "decreased"
            changes.append(f"  • {readable.get(k, k)} {direction} by {abs(v):.1f}pp")

    changes_str = "\n".join(changes) if changes else "  (no changes from baseline)"

    return f"""You are a senior economics advisor. Analyze these simulated economic policy results for India's economy. Explain them in clear, accessible language suitable for a general audience. Be specific about cause and effect — connect each policy change to its economic impact. Keep your response to 3–4 sentences.

Policy changes from baseline:
{changes_str}

Projected economic outcomes:
  • GDP Growth: {results.get('gdp_growth', 0):.2f}%
  • Inflation: {results.get('inflation', 0):.2f}%
  • Unemployment: {results.get('unemployment', 0):.2f}%
  • Fiscal Deficit: {results.get('fiscal_deficit', 0):.2f}% of GDP
  • Trade Balance: {results.get('trade_balance', 0):.2f}% of GDP

Provide your analysis:"""


def _build_comparison_prompt(
    policy_a_deltas: Dict[str, float],
    results_a: dict,
    policy_b_deltas: Dict[str, float],
    results_b: dict,
) -> str:
    """Build the LLM prompt for a policy comparison."""
    readable = {
        "tax_rate": "Tax Rate",
        "subsidy": "Agriculture Subsidy",
        "interest_rate": "Interest Rate",
        "gov_spending": "Government Spending",
        "import_tariff": "Import Tariff",
    }

    def _fmt_policy(deltas):
        parts = []
        for k, v in deltas.items():
            if abs(v) > 0.01:
                direction = "+" if v > 0 else ""
                parts.append(f"  • {readable.get(k, k)}: {direction}{v:.1f}pp")
        return "\n".join(parts) if parts else "  (no changes)"

    def _fmt_results(r):
        return (
            f"  • GDP Growth: {r.get('gdp_growth', 0):.2f}%\n"
            f"  • Inflation: {r.get('inflation', 0):.2f}%\n"
            f"  • Unemployment: {r.get('unemployment', 0):.2f}%\n"
            f"  • Fiscal Deficit: {r.get('fiscal_deficit', 0):.2f}% of GDP\n"
            f"  • Trade Balance: {r.get('trade_balance', 0):.2f}% of GDP"
        )

    return f"""You are a senior economics advisor. Compare these two economic policy scenarios for India's economy. Explain which policy performs better overall and highlight the key trade-offs. Be specific and concise — 4–5 sentences maximum.

POLICY A changes:
{_fmt_policy(policy_a_deltas)}
POLICY A results:
{_fmt_results(results_a)}

POLICY B changes:
{_fmt_policy(policy_b_deltas)}
POLICY B results:
{_fmt_results(results_b)}

Provide your comparative analysis:"""


# ── Main Explainer class ─────────────────────────────────────────────────

class AIExplainer:
    """
    Generates AI-powered or rule-based explanations.

    Usage:
        explainer = AIExplainer()
        text = await explainer.explain_single(policy_deltas, results)
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY", "")
        self.model = model or os.getenv("AI_MODEL", "llama-3.3-70b-versatile")
        self._client = None

        if self.api_key and self.api_key != "your_groq_api_key_here":
            try:
                from groq import Groq
                self._client = Groq(api_key=self.api_key)
                logger.info(f"Groq client initialized with model: {self.model}")
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}")
                self._client = None
        else:
            logger.info("No Groq API key set — using rule-based fallback explanations")

    @property
    def ai_available(self) -> bool:
        return self._client is not None

    async def explain_single(
        self,
        policy_deltas: Dict[str, float],
        results: dict,
    ) -> str:
        """Generate an explanation for a single simulation."""
        if not self.ai_available:
            return _fallback_explain_single(policy_deltas, results)

        prompt = _build_single_prompt(policy_deltas, results)

        try:
            completion = self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert economics advisor. "
                            "Provide clear, concise analysis. "
                            "Never use markdown formatting."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=300,
            )
            return completion.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Groq API error: {e}")
            return _fallback_explain_single(policy_deltas, results)

    async def explain_comparison(
        self,
        policy_a_deltas: Dict[str, float],
        results_a: dict,
        policy_b_deltas: Dict[str, float],
        results_b: dict,
    ) -> str:
        """Generate a comparative analysis of two policies."""
        if not self.ai_available:
            return _fallback_explain_comparison(
                policy_a_deltas, results_a, policy_b_deltas, results_b
            )

        prompt = _build_comparison_prompt(
            policy_a_deltas, results_a, policy_b_deltas, results_b
        )

        try:
            completion = self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert economics advisor. "
                            "Provide clear, concise comparative analysis. "
                            "Never use markdown formatting."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=400,
            )
            return completion.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"Groq API error: {e}")
            return _fallback_explain_comparison(
                policy_a_deltas, results_a, policy_b_deltas, results_b
            )


# ── Quick smoke test ──────────────────────────────────────────────────────
if __name__ == "__main__":
    import asyncio

    explainer = AIExplainer()
    print(f"AI available: {explainer.ai_available}")
    print()

    # Test single explanation
    deltas = {"tax_rate": -5.0, "subsidy": 15.0, "gov_spending": 4.0}
    results = {
        "gdp_growth": 9.73,
        "inflation": 6.12,
        "unemployment": 2.84,
        "fiscal_deficit": 1.03,
        "trade_balance": -3.26,
    }
    explanation = asyncio.get_event_loop().run_until_complete(
        explainer.explain_single(deltas, results)
    )
    print("=== Single Policy Explanation ===")
    print(explanation)
    print()

    # Test comparison explanation
    deltas_a = {"tax_rate": -1.0, "subsidy": 5.0, "gov_spending": 1.0}
    results_a = {"gdp_growth": 8.5, "inflation": 5.79, "unemployment": 3.16, "fiscal_deficit": 0.25, "trade_balance": -3.26}
    deltas_b = {"tax_rate": -5.0, "subsidy": 15.0, "gov_spending": 7.0, "import_tariff": -5.0}
    results_b = {"gdp_growth": 10.02, "inflation": 5.95, "unemployment": 2.79, "fiscal_deficit": 1.19, "trade_balance": -3.62}

    comparison = asyncio.get_event_loop().run_until_complete(
        explainer.explain_comparison(deltas_a, results_a, deltas_b, results_b)
    )
    print("=== Comparison Explanation ===")
    print(comparison)
