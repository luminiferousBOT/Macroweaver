import { useState } from 'react'
import { exportReportPDF, exportReportCSV } from '../api'

/**
 * Serialize an SVG element to a base64 PNG via offscreen canvas.
 * Returns a data URL string (or null if capture fails).
 */
async function captureSvgAsBase64(svgElement, scale = 2) {
  if (!svgElement) return null

  try {
    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(svgElement)

    // Ensure xmlns is present
    if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    }

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new window.Image()
    img.crossOrigin = 'anonymous'

    const loaded = await new Promise((resolve, reject) => {
      img.onload = () => resolve(true)
      img.onerror = reject
      img.src = url
    })

    if (!loaded) {
      URL.revokeObjectURL(url)
      return null
    }

    const canvas = document.createElement('canvas')
    canvas.width = img.width * scale
    canvas.height = img.height * scale
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.scale(scale, scale)
    ctx.drawImage(img, 0, 0)

    URL.revokeObjectURL(url)
    return canvas.toDataURL('image/png')
  } catch {
    return null
  }
}

export default function ExportReport({ policies, results, chartRef, shockType, shockIntensity }) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const [csvLoading, setCsvLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!results) return null

  const gatherPayload = async (includeCharts = true) => {
    const chartImages = []

    if (includeCharts && chartRef?.current) {
      const svg = chartRef.current.querySelector('svg')
      if (svg) {
        const b64 = await captureSvgAsBase64(svg)
        if (b64) chartImages.push(b64)
      }
    }

    return {
      policy_inputs: { ...policies },
      simulation_results: {
        gdp_growth: results.gdp_growth,
        inflation: results.inflation,
        unemployment: results.unemployment,
        fiscal_deficit: results.fiscal_deficit,
        trade_balance: results.trade_balance,
        consumption_delta: results.consumption_delta,
        investment_delta: results.investment_delta,
        gov_spending_delta: results.gov_spending_delta,
        net_exports_delta: results.net_exports_delta,
      },
      ai_explanation: results.ai_explanation || '',
      chart_images: chartImages,
      shock_type: shockType || null,
      shock_intensity: shockIntensity || null,
    }
  }

  const handlePDF = async () => {
    setPdfLoading(true)
    setError(null)
    try {
      const data = await gatherPayload(true)
      await exportReportPDF(data)
    } catch (err) {
      setError('Failed to generate PDF. Make sure the backend is running.')
      console.error(err)
    } finally {
      setPdfLoading(false)
    }
  }

  const handleCSV = async () => {
    setCsvLoading(true)
    setError(null)
    try {
      const data = await gatherPayload(false)
      await exportReportCSV(data)
    } catch (err) {
      setError('Failed to generate CSV. Make sure the backend is running.')
      console.error(err)
    } finally {
      setCsvLoading(false)
    }
  }

  return (
    <div className="export-section">
      <div className="export-section__inner">
        <div className="export-section__label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <polyline points="9 15 12 18 15 15" />
          </svg>
          Export Report
        </div>
        <div className="export-section__actions">
          <button className="btn btn--primary btn--sm" onClick={handlePDF} disabled={pdfLoading}>
            {pdfLoading ? (
              <>
                Generating
                <span className="loading-dot">
                  <span /><span /><span />
                </span>
              </>
            ) : (
              <>
                Download PDF
                <span className="btn__icon">↓</span>
              </>
            )}
          </button>
          <button className="btn btn--secondary btn--sm" onClick={handleCSV} disabled={csvLoading}>
            {csvLoading ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>
      {error && (
        <p className="export-section__error">{error}</p>
      )}
    </div>
  )
}
