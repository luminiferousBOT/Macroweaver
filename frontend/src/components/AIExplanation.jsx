export default function AIExplanation({ text, loading }) {
  if (loading) {
    return (
      <div className="ai-box">
        <div className="ai-box__tag">
          <span className="ai-box__dot" />
          AI Analysis — Generating
          <span className="loading-dot">
            <span /><span /><span />
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="loading-shimmer" style={{ height: 16, width: '95%' }} />
          <div className="loading-shimmer" style={{ height: 16, width: '88%' }} />
          <div className="loading-shimmer" style={{ height: 16, width: '72%' }} />
        </div>
      </div>
    )
  }

  if (!text) return null

  return (
    <div className="ai-box">
      <div className="ai-box__tag">
        <span className="ai-box__dot" />
        AI Analysis
      </div>
      <p className="ai-box__text">{text}</p>
    </div>
  )
}
