import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReservations } from '../context/ReservationsContext'
import { useToast } from '../context/ToastContext'
import Card from '../components/Card'
import Button from '../components/Button'
import SearchBar from '../components/SearchBar'
import ViewToggle from '../components/ViewToggle'
import ExportMenu from '../components/ExportMenu'
import CategoryTag from '../components/CategoryTag'
import { SkeletonCard } from '../components/Skeleton'
import './Reservations.css'

export default function Reservations() {
  const { reservations, deleteReservation, loading } = useReservations()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState('grid')

  const filteredReservations = reservations
    .filter(r => {
      // Filter by status
      let statusMatch = true
      if (filter === 'confirmed') statusMatch = r.status === 'confirmed'
      else if (filter === 'pending') statusMatch = r.status === 'pending'
      else if (filter === 'upcoming') {
        statusMatch = new Date(r.date + 'T' + r.time) > new Date()
      }
      
      // Filter by search query
      const searchMatch = !searchQuery || 
        r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.location?.toLowerCase().includes(searchQuery.toLowerCase())
      
      return statusMatch && searchMatch
    })
    .sort((a, b) => {
      const dateA = new Date(a.date + 'T' + a.time)
      const dateB = new Date(b.date + 'T' + b.time)
      return dateB - dateA
    })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      try {
        await deleteReservation(id)
        success('Reserva eliminada exitosamente')
      } catch (err) {
        showError('Error al eliminar la reserva')
      }
    }
  }

  return (
    <div className="reservations-page">
      <div className="page-header">
        <div>
          <h1>Mis Reservas</h1>
          <p>Gestiona todas tus reservas y citas</p>
        </div>
        <div className="header-actions-group">
          <ExportMenu reservations={filteredReservations} />
          <ViewToggle view={view} onViewChange={setView} />
          <Button onClick={() => navigate('/reservations/new')}>
            + Nueva Reserva
          </Button>
        </div>
      </div>

      <div className="search-filter-bar">
        <SearchBar 
          onSearch={setSearchQuery} 
          placeholder="Buscar reservas por título, descripción o ubicación..."
          className="reservations-search"
        />
      </div>

      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas
        </button>
        <button 
          className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Próximas
        </button>
        <button 
          className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmadas
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pendientes
        </button>
      </div>

      {loading ? (
        <div className={`reservations-${view}`}>
          {[1, 2, 3, 4].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredReservations.length === 0 ? (
        <Card className="empty-reservations">
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <h3>No hay reservas</h3>
            <p>
              {filter === 'all' 
                ? 'Aún no has creado ninguna reserva'
                : `No hay reservas ${filter === 'upcoming' ? 'próximas' : filter === 'confirmed' ? 'confirmadas' : 'pendientes'}`
              }
            </p>
            <Button onClick={() => navigate('/reservations/new')}>
              Crear Primera Reserva
            </Button>
          </div>
        </Card>
      ) : (
        <div className={`reservations-${view}`}>
          {filteredReservations.map(reservation => (
            <Card 
              key={reservation.id} 
              className={`reservation-card ${view === 'list' ? 'list-view' : ''} glass-card`}
              onClick={() => navigate(`/reservations/${reservation.id}`)}
            >
              <div className="reservation-card-header">
                <div className="reservation-date-time">
                  <span className="date">{formatDate(reservation.date)}</span>
                  <span className="time">{reservation.time}</span>
                </div>
                <span className={`status-badge status-${reservation.status}`}>
                  {reservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                </span>
              </div>

              <div className="reservation-title-row">
                <h3 className="reservation-title">{reservation.title}</h3>
                {reservation.category && (
                  <CategoryTag category={reservation.category} />
                )}
              </div>
              <p className="reservation-description">{reservation.description}</p>

              <div className="reservation-info">
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <span>{reservation.location}</span>
                </div>
                <div className="info-item">
                  <span className="info-icon">⏱️</span>
                  <span>{reservation.duration} minutos</span>
                </div>
                {reservation.attendees && reservation.attendees.length > 0 && (
                  <div className="info-item">
                    <span className="info-icon">👥</span>
                    <span>{reservation.attendees.length} asistente(s)</span>
                  </div>
                )}
              </div>

              <div className="reservation-actions">
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/reservations/${reservation.id}/edit`)
                  }}
                >
                  Editar
                </Button>
                <Button 
                  variant="danger" 
                  size="small"
                  onClick={(e) => handleDelete(reservation.id, e)}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

