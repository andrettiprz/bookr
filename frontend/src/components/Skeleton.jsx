import './Skeleton.css'

export default function Skeleton({ variant = 'text', width, height, className = '' }) {
  const style = {
    width: width || (variant === 'circle' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '1em' : variant === 'circle' ? '40px' : '200px')
  }

  return (
    <div 
      className={`skeleton skeleton-${variant} ${className}`}
      style={style}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton variant="rectangular" height="120px" />
      <div className="skeleton-card-content">
        <Skeleton variant="text" width="60%" height="24px" />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <Skeleton variant="rectangular" width="80px" height="32px" />
          <Skeleton variant="rectangular" width="80px" height="32px" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonList() {
  return (
    <div className="skeleton-list">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton-list-item">
          <Skeleton variant="circle" width="48px" height="48px" />
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height="20px" />
            <Skeleton variant="text" width="70%" />
          </div>
        </div>
      ))}
    </div>
  )
}

