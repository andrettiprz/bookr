import { useParams, useNavigate } from 'react-router-dom'
import { useReservations } from '../context/ReservationsContext'
import Card from '../components/Card'
import Button from '../components/Button'
import './ReservationDetail.css'

export default function ReservationDetail() {
  const { id } = useParams()
  const { reservations, deleteReservation } = useReservations()
  const navigate = useNavigate()

  const reservation = reservations.find(r => r.id === id)

  if (!reservation) {
    return (
      <div className="reservation-detail-page">
        <Card>
          <div className="not-found">
            <span className="not-found-icon">🔍</span>
            <h2>Reserva no encontrada</h2>
            <p>La reserva que buscas no existe o ha sido eliminada.</p>
            <Button onClick={() => navigate('/reservations')}>
              Volver a Reservas
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    })
  }

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      deleteReservation(id)
      navigate('/reservations')
    }
  }

  return (
    <div className="reservation-detail-page">
      <div className="detail-header">
        <Button variant="secondary" onClick={() => navigate('/reservations')}>
          ← Volver
        </Button>
        <div className="header-actions">
          <Button 
            variant="secondary"
            onClick={() => navigate(`/reservations/${id}/edit`)}
          >
            Editar
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>

      <Card className="detail-card">
        <div className="detail-header-info">
          <div>
            <span className={`status-badge status-${reservation.status}`}>
              {reservation.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
            </span>
            <h1>{reservation.title}</h1>
          </div>
        </div>

        {reservation.description && (
          <div className="detail-section">
            <h3>Descripción</h3>
            <p>{reservation.description}</p>
          </div>
        )}

        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <div>
              <span className="detail-label">Fecha</span>
              <span className="detail-value">{formatDate(reservation.date)}</span>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon">⏰</span>
            <div>
              <span className="detail-label">Hora</span>
              <span className="detail-value">{reservation.time}</span>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon">⏱️</span>
            <div>
              <span className="detail-label">Duración</span>
              <span className="detail-value">{reservation.duration} minutos</span>
            </div>
          </div>

          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <div>
              <span className="detail-label">Ubicación</span>
              <span className="detail-value">{reservation.location}</span>
            </div>
          </div>
        </div>

        {reservation.attendees && reservation.attendees.length > 0 && (
          <div className="detail-section">
            <h3>Asistentes</h3>
            <div className="attendees-list">
              {reservation.attendees.map((attendee, index) => (
                <span key={index} className="attendee-badge">
                  👤 {attendee}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

