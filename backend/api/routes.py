"""
API route definitions for Macroweaver.
"""

from __future__ import annotations

from dataclasses import asdict

from fastapi import APIRouter, HTTPException

from backend.ai.explainer import AIExplainer
from backend.api.schemas import (
    ComparisonRequestSchema,
    ComparisonResponseSchema,
    DefaultsResponseSchema,
    HealthResponseSchema,
    PolicyInputSchema,
    SimulationResponseSchema,
)
from backend.models.economic_model import (
    EconomicSimulator,
    PolicyInput,
    SimulationResult,
    SHOCK_LABELS,
)

router = APIRouter(prefix="/api", tags=["simulation"])

# Shared instances (stateless, safe to reuse)
_simulator = EconomicSimulator()
_explainer = AIExplainer()


def _compute_deltas(policy: PolicyInputSchema) -> dict:
    """Compute deltas between user policy and simulator defaults."""
    defaults = _simulator.get_defaults()
    return {
        "tax_rate": policy.tax_rate - defaults["tax_rate"],
        "subsidy": policy.subsidy - defaults["subsidy"],
        "interest_rate": policy.interest_rate - defaults["interest_rate"],
        "gov_spending": policy.gov_spending - defaults["gov_spending"],
        "import_tariff": policy.import_tariff - defaults["import_tariff"],
    }


# ── Health ────────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponseSchema)
async def health():
    """Health check endpoint."""
    return {
        "status": "ok",
        "version": "0.1.0",
    }


# ── Defaults ──────────────────────────────────────────────────────────────

@router.get("/defaults", response_model=DefaultsResponseSchema)
async def get_defaults():
    """Return baseline policy values and underlying economic data."""
    defaults = _simulator.get_defaults()
    return {
        **defaults,
        "baseline": _simulator.baseline,
    }


# ── Simulate ──────────────────────────────────────────────────────────────

@router.post("/simulate", response_model=SimulationResponseSchema)
async def simulate(policy: PolicyInputSchema):
    """
    Run a single policy simulation.

    Accepts policy lever values, runs the economic model,
    optionally applies an external shock, and returns
    projected outcomes with an AI explanation.
    """
    try:
        policy_input = PolicyInput(
            tax_rate=policy.tax_rate,
            subsidy=policy.subsidy,
            interest_rate=policy.interest_rate,
            gov_spending=policy.gov_spending,
            import_tariff=policy.import_tariff,
        )
        result: SimulationResult = _simulator.simulate(policy_input)

        # Apply external shock if provided
        shock_type = policy.shock_type
        shock_intensity = policy.shock_intensity or "medium"
        if shock_type:
            result = _simulator.apply_shock(result, shock_type, shock_intensity)

        response = result.to_dict()

        # Attach shock metadata
        if shock_type:
            response["shock_active"] = shock_type
            response["shock_label"] = SHOCK_LABELS.get(shock_type, shock_type)

        # Generate AI explanation (with shock context)
        deltas = _compute_deltas(policy)
        response["ai_explanation"] = await _explainer.explain_single(
            deltas, response,
            shock_type=shock_type,
            shock_intensity=shock_intensity,
        )

        return response

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


# ── Compare ───────────────────────────────────────────────────────────────

@router.post("/compare", response_model=ComparisonResponseSchema)
async def compare(request: ComparisonRequestSchema):
    """
    Compare two policies side-by-side.

    Returns results for both policies and an AI-generated
    comparison analysis.  Each scenario may have its own
    external shock applied independently.
    """
    try:
        policy_a = PolicyInput(
            tax_rate=request.policy_a.tax_rate,
            subsidy=request.policy_a.subsidy,
            interest_rate=request.policy_a.interest_rate,
            gov_spending=request.policy_a.gov_spending,
            import_tariff=request.policy_a.import_tariff,
        )
        policy_b = PolicyInput(
            tax_rate=request.policy_b.tax_rate,
            subsidy=request.policy_b.subsidy,
            interest_rate=request.policy_b.interest_rate,
            gov_spending=request.policy_b.gov_spending,
            import_tariff=request.policy_b.import_tariff,
        )

        result_a = _simulator.simulate(policy_a)
        result_b = _simulator.simulate(policy_b)

        # Apply shocks independently to each scenario
        shock_a_type = request.policy_a.shock_type
        shock_a_intensity = request.policy_a.shock_intensity or "medium"
        shock_b_type = request.policy_b.shock_type
        shock_b_intensity = request.policy_b.shock_intensity or "medium"

        if shock_a_type:
            result_a = _simulator.apply_shock(result_a, shock_a_type, shock_a_intensity)
        if shock_b_type:
            result_b = _simulator.apply_shock(result_b, shock_b_type, shock_b_intensity)

        response_a = result_a.to_dict()
        response_b = result_b.to_dict()

        # Attach shock metadata
        if shock_a_type:
            response_a["shock_active"] = shock_a_type
            response_a["shock_label"] = SHOCK_LABELS.get(shock_a_type, shock_a_type)
        if shock_b_type:
            response_b["shock_active"] = shock_b_type
            response_b["shock_label"] = SHOCK_LABELS.get(shock_b_type, shock_b_type)

        # Generate individual explanations
        deltas_a = _compute_deltas(request.policy_a)
        deltas_b = _compute_deltas(request.policy_b)

        response_a["ai_explanation"] = await _explainer.explain_single(
            deltas_a, response_a,
            shock_type=shock_a_type,
            shock_intensity=shock_a_intensity,
        )
        response_b["ai_explanation"] = await _explainer.explain_single(
            deltas_b, response_b,
            shock_type=shock_b_type,
            shock_intensity=shock_b_intensity,
        )

        # Generate comparative analysis
        ai_comparison = await _explainer.explain_comparison(
            deltas_a, response_a,
            deltas_b, response_b,
            shock_a_type=shock_a_type,
            shock_a_intensity=shock_a_intensity,
            shock_b_type=shock_b_type,
            shock_b_intensity=shock_b_intensity,
        )

        return {
            "policy_a": request.policy_a.dict(),
            "results_a": response_a,
            "policy_b": request.policy_b.dict(),
            "results_b": response_b,
            "ai_comparison": ai_comparison,
        }

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison error: {str(e)}")
