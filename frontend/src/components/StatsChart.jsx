import './StatsChart.css'

export default function StatsChart({ data, title, type = 'bar' }) {
  if (!data || data.length === 0) {
    return (
      <div className="stats-chart-empty">
        <span>Sin datos para mostrar</span>
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="stats-chart">
      {title && <h3 className="stats-chart-title">{title}</h3>}
      
      {type === 'bar' && (
        <div className="bar-chart">
          {data.map((item, index) => (
            <div key={index} className="bar-item">
              <div className="bar-wrapper">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${(item.value / maxValue) * 100}%`,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <span className="bar-value">{item.value}</span>
                </div>
              </div>
              <span className="bar-label">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {type === 'donut' && (
        <div className="donut-chart">
          <div className="donut-segments">
            {data.map((item, index) => {
              const total = data.reduce((sum, d) => sum + d.value, 0)
              const percentage = (item.value / total) * 100
              
              return (
                <div 
                  key={index} 
                  className="donut-segment"
                  style={{ 
                    '--percentage': `${percentage}%`,
                    '--color': item.color || 'var(--accent)',
                    animationDelay: `${index * 0.2}s`
                  }}
                >
                  <div className="donut-segment-info">
                    <span className="donut-label">{item.label}</span>
                    <span className="donut-value">{item.value} ({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {type === 'line' && (
        <div className="line-chart">
          <svg viewBox="0 0 400 200" className="line-svg">
            <polyline
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              points={data.map((item, index) => {
                const x = (index / (data.length - 1)) * 380 + 10
                const y = 190 - ((item.value / maxValue) * 170)
                return `${x},${y}`
              }).join(' ')}
            />
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 380 + 10
              const y = 190 - ((item.value / maxValue) * 170)
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="var(--accent)"
                  className="line-point"
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              )
            })}
          </svg>
          <div className="line-labels">
            {data.map((item, index) => (
              <span key={index} className="line-label">{item.label}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

