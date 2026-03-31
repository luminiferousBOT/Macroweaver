"""
MacroWeaver — Report Generator
================================

Generates professional PDF and CSV reports from simulation data.
Uses reportlab for PDF creation with a clean, minimal design.
"""

from __future__ import annotations

import base64
import csv
import io
from datetime import datetime, timezone, timedelta

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm, cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
    HRFlowable,
    KeepTogether,
)

# ── Color Palette (matching the MacroWeaver UI) ──────────────────────────
_DARK = colors.HexColor("#0D0D0C")
_ACCENT = colors.HexColor("#2D5A3D")
_ACCENT_LIGHT = colors.HexColor("#3D7A52")
_TEXT_PRIMARY = colors.HexColor("#1A1A18")
_TEXT_SECONDARY = colors.HexColor("#5C5A54")
_TEXT_TERTIARY = colors.HexColor("#8A8780")
_BG_WARM = colors.HexColor("#F2F0EB")
_BG_CARD = colors.HexColor("#E8E4DD")
_BORDER = colors.HexColor("#D4D0C9")
_POSITIVE = colors.HexColor("#2D7A3D")
_NEGATIVE = colors.HexColor("#9A3030")

# ── Styles ────────────────────────────────────────────────────────────────

def _build_styles() -> dict:
    """Build custom paragraph styles for the report."""
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "ReportTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=22,
            leading=28,
            textColor=colors.white,
            alignment=TA_LEFT,
            spaceAfter=4,
        ),
        "subtitle": ParagraphStyle(
            "ReportSubtitle",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=colors.HexColor("#B0B0B0"),
            alignment=TA_LEFT,
        ),
        "section_heading": ParagraphStyle(
            "SectionHeading",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=20,
            textColor=_TEXT_PRIMARY,
            spaceBefore=16,
            spaceAfter=10,
        ),
        "body": ParagraphStyle(
            "BodyText",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=16,
            textColor=_TEXT_SECONDARY,
            alignment=TA_JUSTIFY,
        ),
        "ai_text": ParagraphStyle(
            "AIText",
            parent=base["Normal"],
            fontName="Times-Italic",
            fontSize=10.5,
            leading=17,
            textColor=_TEXT_PRIMARY,
            alignment=TA_JUSTIFY,
            leftIndent=12,
            rightIndent=12,
        ),
        "footer": ParagraphStyle(
            "FooterText",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=7.5,
            textColor=_TEXT_TERTIARY,
            alignment=TA_CENTER,
        ),
        "table_header": ParagraphStyle(
            "TableHeader",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=_TEXT_PRIMARY,
        ),
        "table_cell": ParagraphStyle(
            "TableCell",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            textColor=_TEXT_SECONDARY,
        ),
        "caption": ParagraphStyle(
            "Caption",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8,
            textColor=_TEXT_TERTIARY,
            alignment=TA_CENTER,
            spaceBefore=4,
            spaceAfter=8,
        ),
    }


# ── PDF Generation ────────────────────────────────────────────────────────

def _header_block(styles: dict) -> list:
    """Build the dark header banner."""
    # Create a table that acts as a coloured banner
    title = Paragraph("MacroWeaver", styles["title"])
    subtitle_text = "Economic Policy Report"
    ist = timezone(timedelta(hours=5, minutes=30))
    date_str = datetime.now(ist).strftime("%B %d, %Y · %I:%M %p IST")
    subtitle = Paragraph(f"{subtitle_text}  ·  {date_str}", styles["subtitle"])

    banner_data = [[title], [subtitle]]
    banner = Table(banner_data, colWidths=[170 * mm])
    banner.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), _DARK),
        ("TOPPADDING", (0, 0), (0, 0), 20),
        ("BOTTOMPADDING", (-1, -1), (-1, -1), 18),
        ("LEFTPADDING", (0, 0), (-1, -1), 20),
        ("RIGHTPADDING", (0, 0), (-1, -1), 20),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return [banner, Spacer(1, 10 * mm)]


def _section_divider():
    """Thin horizontal rule between sections."""
    return HRFlowable(
        width="100%", thickness=0.5,
        color=_BORDER, spaceBefore=6, spaceAfter=6,
    )


def _policy_inputs_section(data: dict, shock_type: str | None, shock_intensity: str | None, styles: dict) -> list:
    """Section 1: Policy Inputs table."""
    elements = [
        Paragraph("01 — Policy Inputs", styles["section_heading"]),
    ]

    LABELS = {
        "tax_rate": ("Tax Rate", "%"),
        "subsidy": ("Agriculture Subsidy", "% of GDP"),
        "interest_rate": ("Interest Rate", "%"),
        "gov_spending": ("Government Spending", "% of GDP"),
        "import_tariff": ("Import Tariff", "%"),
    }

    header = [
        Paragraph("Parameter", styles["table_header"]),
        Paragraph("Value", styles["table_header"]),
        Paragraph("Unit", styles["table_header"]),
    ]
    rows = [header]
    for key, (label, unit) in LABELS.items():
        val = data.get(key, "—")
        rows.append([
            Paragraph(label, styles["table_cell"]),
            Paragraph(str(val), styles["table_cell"]),
            Paragraph(unit, styles["table_cell"]),
        ])

    # Add shock info if active
    if shock_type:
        from backend.models.economic_model import SHOCK_LABELS
        shock_label = SHOCK_LABELS.get(shock_type, shock_type)
        rows.append([
            Paragraph("External Shock", styles["table_cell"]),
            Paragraph(shock_label, styles["table_cell"]),
            Paragraph(f"Intensity: {(shock_intensity or 'medium').capitalize()}", styles["table_cell"]),
        ])

    col_widths = [70 * mm, 50 * mm, 50 * mm]
    table = Table(rows, colWidths=col_widths)
    table.setStyle(TableStyle([
        # Header row
        ("BACKGROUND", (0, 0), (-1, 0), _BG_CARD),
        ("TEXTCOLOR", (0, 0), (-1, 0), _TEXT_PRIMARY),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        # Body rows
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, _BG_WARM]),
        # Grid
        ("GRID", (0, 0), (-1, -1), 0.5, _BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 4 * mm))
    elements.append(_section_divider())
    return elements


def _simulation_results_section(data: dict, styles: dict) -> list:
    """Section 2: Simulation Results table."""
    elements = [
        Paragraph("02 — Simulation Results", styles["section_heading"]),
    ]

    METRICS = [
        ("GDP Growth", "gdp_growth", "%"),
        ("Inflation", "inflation", "%"),
        ("Unemployment", "unemployment", "%"),
        ("Fiscal Deficit", "fiscal_deficit", "% of GDP"),
        ("Trade Balance", "trade_balance", "% of GDP"),
    ]

    header = [
        Paragraph("Indicator", styles["table_header"]),
        Paragraph("Projected Value", styles["table_header"]),
        Paragraph("Unit", styles["table_header"]),
    ]
    rows = [header]
    for label, key, unit in METRICS:
        val = data.get(key, "—")
        if isinstance(val, (int, float)):
            val_str = f"{val:.2f}"
        else:
            val_str = str(val)
        rows.append([
            Paragraph(label, styles["table_cell"]),
            Paragraph(val_str, styles["table_cell"]),
            Paragraph(unit, styles["table_cell"]),
        ])

    # GDP Component deltas
    COMPONENTS = [
        ("Consumption Δ", "consumption_delta", "pp"),
        ("Investment Δ", "investment_delta", "pp"),
        ("Gov Spending Δ", "gov_spending_delta", "pp"),
        ("Net Exports Δ", "net_exports_delta", "pp"),
    ]
    for label, key, unit in COMPONENTS:
        val = data.get(key, 0)
        if isinstance(val, (int, float)):
            sign = "+" if val > 0 else ""
            val_str = f"{sign}{val:.2f}"
        else:
            val_str = str(val)
        rows.append([
            Paragraph(label, styles["table_cell"]),
            Paragraph(val_str, styles["table_cell"]),
            Paragraph(unit, styles["table_cell"]),
        ])

    col_widths = [70 * mm, 50 * mm, 50 * mm]
    table = Table(rows, colWidths=col_widths)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), _BG_CARD),
        ("TEXTCOLOR", (0, 0), (-1, 0), _TEXT_PRIMARY),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, _BG_WARM]),
        ("GRID", (0, 0), (-1, -1), 0.5, _BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    elements.append(table)
    elements.append(Spacer(1, 4 * mm))
    elements.append(_section_divider())
    return elements


def _ai_analysis_section(text: str, styles: dict) -> list:
    """Section 3: AI Analysis text in a styled box."""
    elements = [
        Paragraph("03 — AI Analysis", styles["section_heading"]),
    ]

    if not text:
        elements.append(Paragraph(
            "No AI analysis was generated for this simulation.",
            styles["body"],
        ))
    else:
        # Tinted background box via a single-cell table
        ai_para = Paragraph(text, styles["ai_text"])
        box_data = [[ai_para]]
        box = Table(box_data, colWidths=[160 * mm])
        box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), _BG_WARM),
            ("TOPPADDING", (0, 0), (-1, -1), 14),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
            ("LEFTPADDING", (0, 0), (-1, -1), 16),
            ("RIGHTPADDING", (0, 0), (-1, -1), 16),
            ("ROUNDEDCORNERS", [6, 6, 6, 6]),
            ("BOX", (0, 0), (-1, -1), 0.5, _BORDER),
        ]))
        elements.append(box)

    elements.append(Spacer(1, 4 * mm))
    elements.append(_section_divider())
    return elements


def _charts_section(chart_images: list[str], styles: dict) -> list:
    """Section 4: Embedded chart images."""
    if not chart_images:
        return []

    elements = [
        Paragraph("04 — Visual Insights", styles["section_heading"]),
    ]

    for i, b64_str in enumerate(chart_images):
        try:
            # Strip data URI prefix if present
            if "," in b64_str:
                b64_str = b64_str.split(",", 1)[1]
            img_data = base64.b64decode(b64_str)
            img_buf = io.BytesIO(img_data)
            img = Image(img_buf, width=150 * mm, height=75 * mm)
            img.hAlign = "CENTER"
            elements.append(img)
            elements.append(Paragraph(
                f"Figure {i + 1}: GDP Component Breakdown",
                styles["caption"],
            ))
        except Exception:
            elements.append(Paragraph(
                f"[Chart {i + 1} could not be rendered]",
                styles["body"],
            ))

    return elements


def _footer_block(styles: dict) -> list:
    """Footer disclaimer."""
    return [
        Spacer(1, 8 * mm),
        HRFlowable(width="100%", thickness=0.3, color=_TEXT_TERTIARY, spaceBefore=4, spaceAfter=6),
        Paragraph(
            "This report was generated by MacroWeaver — AI Economic Policy Advisor. "
            "The projections are based on simplified economic models and AI analysis. "
            "They are intended for educational and exploratory purposes only.",
            styles["footer"],
        ),
    ]


def generate_pdf(
    policy_inputs: dict,
    simulation_results: dict,
    ai_explanation: str,
    chart_images: list[str] | None = None,
    shock_type: str | None = None,
    shock_intensity: str | None = None,
) -> io.BytesIO:
    """
    Build a complete PDF report and return it as a BytesIO buffer.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        title="MacroWeaver Economic Policy Report",
        author="MacroWeaver",
    )

    styles = _build_styles()
    elements = []

    elements.extend(_header_block(styles))
    elements.extend(_policy_inputs_section(policy_inputs, shock_type, shock_intensity, styles))
    elements.extend(_simulation_results_section(simulation_results, styles))
    elements.extend(_ai_analysis_section(ai_explanation, styles))
    elements.extend(_charts_section(chart_images or [], styles))
    elements.extend(_footer_block(styles))

    doc.build(elements)
    buffer.seek(0)
    return buffer


# ── CSV Generation ────────────────────────────────────────────────────────

def generate_csv(
    policy_inputs: dict,
    simulation_results: dict,
    shock_type: str | None = None,
    shock_intensity: str | None = None,
) -> io.StringIO:
    """
    Build a CSV with policy inputs and simulation results.
    Returns a StringIO buffer.
    """
    buffer = io.StringIO()
    writer = csv.writer(buffer)

    # Header
    writer.writerow(["MacroWeaver Economic Policy Report"])
    ist = timezone(timedelta(hours=5, minutes=30))
    writer.writerow(["Generated", datetime.now(ist).strftime("%Y-%m-%d %H:%M:%S IST")])
    writer.writerow([])

    # Policy inputs
    writer.writerow(["--- Policy Inputs ---"])
    writer.writerow(["Parameter", "Value"])
    POLICY_LABELS = {
        "tax_rate": "Tax Rate (%)",
        "subsidy": "Agriculture Subsidy (% of GDP)",
        "interest_rate": "Interest Rate (%)",
        "gov_spending": "Government Spending (% of GDP)",
        "import_tariff": "Import Tariff (%)",
    }
    for key, label in POLICY_LABELS.items():
        writer.writerow([label, policy_inputs.get(key, "")])
    if shock_type:
        writer.writerow(["External Shock", shock_type])
        writer.writerow(["Shock Intensity", shock_intensity or "medium"])
    writer.writerow([])

    # Simulation results
    writer.writerow(["--- Simulation Results ---"])
    writer.writerow(["Indicator", "Value"])
    RESULT_FIELDS = [
        ("GDP Growth (%)", "gdp_growth"),
        ("Inflation (%)", "inflation"),
        ("Unemployment (%)", "unemployment"),
        ("Fiscal Deficit (% of GDP)", "fiscal_deficit"),
        ("Trade Balance (% of GDP)", "trade_balance"),
        ("Consumption Delta (pp)", "consumption_delta"),
        ("Investment Delta (pp)", "investment_delta"),
        ("Gov Spending Delta (pp)", "gov_spending_delta"),
        ("Net Exports Delta (pp)", "net_exports_delta"),
    ]
    for label, key in RESULT_FIELDS:
        val = simulation_results.get(key, "")
        if isinstance(val, (int, float)):
            val = round(val, 4)
        writer.writerow([label, val])

    buffer.seek(0)
    return buffer
