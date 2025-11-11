import { useState, useEffect } from 'react'
import './styles.css'

function App() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="container">
      <div className="card">
        
        {/* Logo/Ícono */}
        <div className="icon-wrapper">
          <div className="icon">
            <span className="emoji">📚</span>
          </div>
        </div>

        {/* Título Principal */}
        <h1 className="title">Bookr</h1>
        
        {/* Subtítulo */}
        <p className="subtitle">Plataforma de Agendamiento Inteligente</p>

        {/* Mensaje Principal */}
        <div className="message-box">
          <p className="message">
            🚧 Estamos construyendo algo increíble para ti
          </p>
          <p className="description">
            Pronto podrás gestionar todas tus reservas y citas en un solo lugar.
            ¡Mantente atento!
          </p>
        </div>

        {/* Reloj en Vivo */}
        <div className="clock-box">
          <p className="clock-label">Hora del Servidor</p>
          <p className="clock">
            {time.toLocaleTimeString('es-MX', { 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit' 
            })}
          </p>
          <p className="date">
            {time.toLocaleDateString('es-MX', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Características */}
        <div className="features">
          <div className="feature">
            <div className="feature-icon">📅</div>
            <p className="feature-text">Reservas Fáciles</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🔒</div>
            <p className="feature-text">100% Seguro</p>
          </div>
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <p className="feature-text">Súper Rápido</p>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p className="footer-text">
            Desarrollado con ❤️ usando React + Azure
          </p>
          <p className="footer-credits">
            CETYS Universidad • Proyecto Final 2025
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
