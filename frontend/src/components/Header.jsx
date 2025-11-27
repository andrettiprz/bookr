import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import './Header.css'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/dashboard" className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">Bookr</span>
        </Link>
        
        {user && (
          <nav className="nav">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/reservations" className="nav-link">Reservas</Link>
            <Link to="/calendar" className="nav-link">Calendario</Link>
            <Link to="/profile" className="nav-link">Perfil</Link>
          </nav>
        )}
        
        <div className="header-actions">
          <ThemeToggle />
          {user && (
            <div className="user-menu">
              <div className="user-info">
                <span className="user-avatar">{user.avatar}</span>
                <span className="user-name">{user.name}</span>
              </div>
              <button onClick={handleLogout} className="logout-btn">
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

