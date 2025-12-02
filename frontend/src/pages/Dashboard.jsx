import { useReservations } from '../context/ReservationsContext'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import Button from '../components/Button'
import StatsChart from '../components/StatsChart'
import { SkeletonCard, SkeletonList } from '../components/Skeleton'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const { reservations, getUpcomingReservations, loading } = useReservations()
  const navigate = useNavigate()

  const upcoming = getUpcomingReservations().slice(0, 5)
  const today = new Date().toDateString()
  const todayReservations = reservations.filter(r => 
    new Date(r.date).toDateString() === today
  )

  const stats = {
    total: reservations.length,
    today: todayReservations.length,
    upcoming: upcoming.length,
    confirmed: reservations.filter(r => r.status === 'confirmed').length
  }

  // Estadísticas por mes (últimos 6 meses)
  const monthlyStats = (() => {
    const months = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('es-MX', { month: 'short' })
      const count = reservations.filter(r => {
        const resDate = new Date(r.date)
        return resDate.getMonth() === date.getMonth() && 
               resDate.getFullYear() === date.getFullYear()
      }).length
      months.push({ label: monthName, value: count })
    }
    return months
  })()

  // Estadísticas por estado
  const statusStats = [
    { 
      label: 'Confirmadas', 
      value: reservations.filter(r => r.status === 'confirmed').length,
      color: 'var(--success)'
    },
    { 
      label: 'Pendientes', 
      value: reservations.filter(r => r.status === 'pending').length,
      color: 'var(--warning)'
    }
  ]

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    })
  }

  const formatTime = (time) => {
    return time
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>¡Hola, {user?.name}! 👋</h1>
          <p>Aquí está el resumen de tus reservas</p>
        </div>
        <Button onClick={() => navigate('/reservations/new')}>
          + Nueva Reserva
        </Button>
      </div>

      {loading ? (
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="stats-grid">
        <Card className="stat-card stat-primary">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total Reservas</p>
          </div>
        </Card>

        <Card className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.confirmed}</h3>
            <p>Confirmadas</p>
          </div>
        </Card>

        <Card className="stat-card stat-warning">
          <div className="stat-icon">📆</div>
          <div className="stat-content">
            <h3>{stats.today}</h3>
            <p>Hoy</p>
          </div>
        </Card>

        <Card className="stat-card stat-info">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>{stats.upcoming}</h3>
            <p>Próximas</p>
          </div>
        </Card>
      </div>
      )}

      <div className="dashboard-charts">
        <Card className="chart-card glass-card">
          <StatsChart 
            data={monthlyStats} 
            title="Reservas por mes (Últimos 6 meses)" 
            type="bar"
          />
        </Card>
        
        <Card className="chart-card glass-card">
          <StatsChart 
            data={statusStats} 
            title="Distribución por estado" 
            type="donut"
          />
        </Card>
      </div>

      <div className="dashboard-content">
        <Card className="upcoming-section">
          <div className="section-header">
            <h2>Próximas Reservas</h2>
            <Button 
              variant="secondary" 
              size="small"
              onClick={() => navigate('/reservations')}
            >
              Ver todas
            </Button>
          </div>

          {loading ? (
            <SkeletonList />
          ) : upcoming.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>No tienes reservas próximas</p>
              <Button onClick={() => navigate('/reservations/new')}>
                Crear Primera Reserva
              </Button>
            </div>
          ) : (
            <div className="reservations-list">
              {upcoming.map(reservation => (
                <div 
                  key={reservation.id} 
                  className="reservation-item"
                  onClick={() => navigate(`/reservations/${reservation.id}`)}
                >
                  <div className="reservation-time">
                    <span className="time">{formatTime(reservation.time)}</span>
                    <span className="date">{formatDate(reservation.date)}</span>
                  </div>
                  <div className="reservation-details">
                    <h3>{reservation.title}</h3>
                    <p>{reservation.description}</p>
                    <div className="reservation-meta">
                      <span className="location">📍 {reservation.location}</span>
                      <span className={`status status-${reservation.status}`}>
                        {reservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="today-section glass-card">
          <h2>Reservas de Hoy</h2>
          {loading ? (
            <SkeletonList />
          ) : todayReservations.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✨</span>
              <p>No tienes reservas programadas para hoy</p>
            </div>
          ) : (
            <div className="reservations-list">
              {todayReservations.map(reservation => (
                <div 
                  key={reservation.id} 
                  className="reservation-item"
                  onClick={() => navigate(`/reservations/${reservation.id}`)}
                >
                  <div className="reservation-time">
                    <span className="time">{formatTime(reservation.time)}</span>
                  </div>
                  <div className="reservation-details">
                    <h3>{reservation.title}</h3>
                    <p>{reservation.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

