import { useState, useRef, useEffect } from 'react'
import { exportToCSV, exportToICal, exportToJSON } from '../utils/export'
import { useToast } from '../context/ToastContext'
import './ExportMenu.css'

export default function ExportMenu({ reservations, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const { success, error } = useToast()

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleExport = (format) => {
    try {
      if (!reservations || reservations.length === 0) {
        error('No hay reservas para exportar')
        return
      }

      switch (format) {
        case 'csv':
          exportToCSV(reservations)
          success('Exportado a CSV exitosamente')
          break
        case 'ical':
          exportToICal(reservations)
          success('Exportado a iCal exitosamente')
          break
        case 'json':
          exportToJSON(reservations)
          success('Exportado a JSON exitosamente')
          break
        default:
          error('Formato no soportado')
      }
      setIsOpen(false)
    } catch (err) {
      error(err.message || 'Error al exportar')
    }
  }

  return (
    <div className={`export-menu ${className}`} ref={menuRef}>
      <button
        className="export-btn"
        onClick={() => setIsOpen(!isOpen)}
        disabled={!reservations || reservations.length === 0}
      >
        <span className="export-icon">📥</span>
        <span>Exportar</span>
        <span className="export-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="export-dropdown">
          <button 
            className="export-option"
            onClick={() => handleExport('csv')}
          >
            <span className="option-icon">📊</span>
            <div className="option-content">
              <strong>CSV</strong>
              <span className="option-desc">Para Excel y hojas de cálculo</span>
            </div>
          </button>

          <button 
            className="export-option"
            onClick={() => handleExport('ical')}
          >
            <span className="option-icon">📅</span>
            <div className="option-content">
              <strong>iCal</strong>
              <span className="option-desc">Para calendarios (Google, Outlook)</span>
            </div>
          </button>

          <button 
            className="export-option"
            onClick={() => handleExport('json')}
          >
            <span className="option-icon">💾</span>
            <div className="option-content">
              <strong>JSON</strong>
              <span className="option-desc">Formato de datos estructurado</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

