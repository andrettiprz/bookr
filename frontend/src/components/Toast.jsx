import { useEffect } from 'react'
import './Toast.css'

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ'
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">{ICONS[type]}</div>
      <p className="toast-message">{message}</p>
      <button className="toast-close" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}

