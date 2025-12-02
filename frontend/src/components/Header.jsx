import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './Button'
import ThemeToggle from './ThemeToggle'
import './Header.css'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/reservations" className="logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">Bookr</span>
        </Link>
        
        <nav className="nav">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/reservations" className="nav-link">Reservas</Link>
          <Link to="/calendar" className="nav-link">Calendario</Link>
        </nav>
        
        <div className="header-actions">
          {user && (
            <div className="user-info">
              <span className="user-name">👤 {user.name}</span>
            </div>
          )}
          <ThemeToggle />
          <Button 
            variant="outline" 
            size="small"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </div>
      </div>
    </header>
  )
}
