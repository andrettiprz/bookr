import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import './Header.css'

export default function Header() {
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
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
