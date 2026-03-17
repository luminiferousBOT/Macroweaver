"""
Data loader module for Macroweaver.
Loads economic indicators from bundled CSV or World Bank API.
"""

import os
from pathlib import Path
from typing import Dict, List, Optional, Union

import pandas as pd

# Path to the bundled fallback CSV
_DATA_DIR = Path(__file__).parent
_CSV_PATH = _DATA_DIR / "economic_data.csv"


def load_economic_data(csv_path: Optional[Union[str, Path]] = None) -> pd.DataFrame:
    """
    Load the economic dataset from CSV.

    Parameters
    ----------
    csv_path : str or Path, optional
        Override path to the CSV file.  Defaults to the bundled dataset.

    Returns
    -------
    pd.DataFrame
        DataFrame indexed by year with all economic indicators.
    """
    path = Path(csv_path) if csv_path else _CSV_PATH

    if not path.exists():
        raise FileNotFoundError(f"Economic data file not found: {path}")

    df = pd.read_csv(path)
    df = df.sort_values("year").reset_index(drop=True)
    return df


def get_latest_values(df: Optional[pd.DataFrame] = None) -> dict:
    """
    Return the most recent year's economic indicators as a dict.

    This serves as the **baseline** for the economic simulation —
    policy changes are applied as deltas on top of these values.
    """
    if df is None:
        df = load_economic_data()

    latest = df.iloc[-1]
    return {
        "year": int(latest["year"]),
        "gdp_billion_usd": float(latest["gdp_billion_usd"]),
        "gdp_growth_pct": float(latest["gdp_growth_pct"]),
        "inflation_pct": float(latest["inflation_pct"]),
        "unemployment_pct": float(latest["unemployment_pct"]),
        "gov_spending_pct_gdp": float(latest["gov_spending_pct_gdp"]),
        "exports_pct_gdp": float(latest["exports_pct_gdp"]),
        "imports_pct_gdp": float(latest["imports_pct_gdp"]),
        "tax_revenue_pct_gdp": float(latest["tax_revenue_pct_gdp"]),
        "consumption_pct_gdp": float(latest["consumption_pct_gdp"]),
        "investment_pct_gdp": float(latest["investment_pct_gdp"]),
    }


def get_historical_series(
    df: Optional[pd.DataFrame] = None,
    indicator: str = "gdp_growth_pct",
) -> List[dict]:
    """
    Return a list of {year, value} dicts for a single indicator,
    useful for rendering historical trend charts on the frontend.
    """
    if df is None:
        df = load_economic_data()

    if indicator not in df.columns:
        raise ValueError(
            f"Unknown indicator '{indicator}'. "
            f"Available: {list(df.columns)}"
        )

    return [
        {"year": int(row["year"]), "value": float(row[indicator])}
        for _, row in df.iterrows()
    ]


# ---------------------------------------------------------------------------
# Quick smoke test — run with:  python -m backend.data.loader
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    data = load_economic_data()
    print(f"Loaded {len(data)} rows  ({int(data['year'].min())}–{int(data['year'].max())})")
    print()

    baseline = get_latest_values(data)
    print("=== Latest baseline values ===")
    for k, v in baseline.items():
        print(f"  {k:>25s}: {v}")
    print()

    series = get_historical_series(data, "gdp_growth_pct")
    print("=== GDP Growth (last 5 years) ===")
    for entry in series[-5:]:
        print(f"  {entry['year']}: {entry['value']:.2f}%")
