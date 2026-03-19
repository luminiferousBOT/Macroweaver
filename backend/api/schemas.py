"""
Pydantic schemas for request / response validation.
"""

from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


# ── Request schemas ───────────────────────────────────────────────────────

class PolicyInputSchema(BaseModel):
    """User-adjustable policy levers."""
    tax_rate: float = Field(25.0, ge=0, le=50, description="Tax rate (%)")
    subsidy: float = Field(5.0, ge=0, le=100, description="Agriculture subsidy (% of GDP)")
    interest_rate: float = Field(6.0, ge=0, le=15, description="Central bank interest rate (%)")
    gov_spending: float = Field(11.0, ge=0, le=40, description="Government spending (% of GDP)")
    import_tariff: float = Field(10.0, ge=0, le=50, description="Import tariff (%)")


class ComparisonRequestSchema(BaseModel):
    """Side-by-side comparison of two policies."""
    policy_a: PolicyInputSchema
    policy_b: PolicyInputSchema


# ── Response schemas ──────────────────────────────────────────────────────

class SimulationResponseSchema(BaseModel):
    """Response from a single simulation."""
    gdp_growth: float = Field(..., description="Projected GDP growth (%)")
    inflation: float = Field(..., description="Projected inflation (%)")
    unemployment: float = Field(..., description="Projected unemployment (%)")
    fiscal_deficit: float = Field(..., description="Fiscal deficit (% of GDP)")
    trade_balance: float = Field(..., description="Trade balance (% of GDP)")
    consumption_delta: float = Field(0.0, description="Change in consumption component")
    investment_delta: float = Field(0.0, description="Change in investment component")
    gov_spending_delta: float = Field(0.0, description="Change in govt spending component")
    net_exports_delta: float = Field(0.0, description="Change in net exports component")
    ai_explanation: str = Field("", description="AI-generated explanation")


class ComparisonResponseSchema(BaseModel):
    """Response from a policy comparison."""
    policy_a: dict
    results_a: SimulationResponseSchema
    policy_b: dict
    results_b: SimulationResponseSchema
    ai_comparison: str = Field("", description="AI-generated comparison analysis")


class DefaultsResponseSchema(BaseModel):
    """Baseline / default policy values."""
    tax_rate: float
    subsidy: float
    interest_rate: float
    gov_spending: float
    import_tariff: float
    baseline: dict = Field(..., description="Underlying economic baseline data")


class HealthResponseSchema(BaseModel):
    """Health check response."""
    status: str
    version: str
