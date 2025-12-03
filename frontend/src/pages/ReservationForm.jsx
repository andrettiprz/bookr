import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useReservations } from '../context/ReservationsContext'
import { useToast } from '../context/ToastContext'
import Card from '../components/Card'
import Button from '../components/Button'
import { CategorySelect } from '../components/CategoryTag'
import './ReservationForm.css'

export default function ReservationForm() {
  const { id } = useParams()
  const { reservations, addReservation, updateReservation, refreshReservations } = useReservations()
  const navigate = useNavigate()
  const isEdit = !!id

  const existingReservation = id ? reservations.find(r => r.id === id) : null

  const { success, error: showError } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    status: 'pending',
    category: '',
    attendees: []
  })

  const [attendeeInput, setAttendeeInput] = useState('')

  useEffect(() => {
    if (existingReservation) {
      setFormData({
        title: existingReservation.title || '',
        description: existingReservation.description || '',
        date: existingReservation.date ? existingReservation.date.split('T')[0] : '',
        time: existingReservation.time || '',
        duration: existingReservation.duration || 60,
        location: existingReservation.location || '',
        status: existingReservation.status || 'pending',
        category: existingReservation.category || '',
        attendees: existingReservation.attendees || []
      })
    } else {
      // Set default date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setFormData(prev => ({
        ...prev,
        date: tomorrow.toISOString().split('T')[0]
      }))
    }
  }, [existingReservation, id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAddAttendee = () => {
    if (attendeeInput.trim()) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, attendeeInput.trim()]
      }))
      setAttendeeInput('')
    }
  }

  const handleRemoveAttendee = (index) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }))
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    // Iniciar medición de performance
    const startTime = performance.now()
    performance.mark('reservation-create-start')

    try {
      if (isEdit) {
        await updateReservation(id, formData)
        success('Reserva actualizada exitosamente')
      } else {
        await addReservation(formData)

        // Medir tiempo de creación
        const endTime = performance.now()
        const duration = endTime - startTime

        try {
          performance.mark('reservation-create-end')
          performance.measure('reservation-create', 'reservation-create-start', 'reservation-create-end')
          performance.clearMarks()
          performance.clearMeasures()
        } catch (e) {
          // Ignorar si los marks no existen
        }

        // Log para QA
        const meetsTarget = duration < 1000
        console.log(`[PERFORMANCE] Reservation created in ${duration.toFixed(2)}ms`)
        console.log(`[QA] Target: <1000ms | Actual: ${duration.toFixed(2)}ms | Status: ${meetsTarget ? '✅ PASS' : '❌ FAIL'}`)

        // Refrescar lista de reservaciones para que aparezca inmediatamente
        await refreshReservations()

        success('Reserva creada exitosamente')
      }
      navigate('/reservations')
    } catch (err) {
      showError(err.message || 'Error al guardar la reserva')
    }
  }

  return (
    <div className="reservation-form-page">
      <div className="form-header">
        <h1>{isEdit ? 'Editar Reserva' : 'Nueva Reserva'}</h1>
        <Button variant="secondary" onClick={() => navigate('/reservations')}>
          Cancelar
        </Button>
      </div>

      <Card className="form-card">
        <form onSubmit={handleSubmit} className="reservation-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Título *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Ej: Reunión con Cliente"
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Detalles adicionales sobre la reserva..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Fecha *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Hora *</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duración (minutos) *</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                required
                min="15"
                step="15"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Ubicación *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Ej: Oficina Principal, Sala de Conferencias"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoría</label>
            <CategorySelect
              value={formData.category}
              onChange={(category) => setFormData(prev => ({ ...prev, category }))}
            />
          </div>

          <div className="form-group">
            <label>Asistentes</label>
            <div className="attendees-input">
              <input
                type="text"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddAttendee()
                  }
                }}
                placeholder="Nombre del asistente"
              />
              <Button type="button" onClick={handleAddAttendee} size="small">
                Agregar
              </Button>
            </div>
            {formData.attendees.length > 0 && (
              <div className="attendees-list">
                {formData.attendees.map((attendee, index) => (
                  <span key={index} className="attendee-tag">
                    {attendee}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttendee(index)}
                      className="remove-attendee"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <Button type="submit" className="submit-btn">
              {isEdit ? 'Actualizar Reserva' : 'Crear Reserva'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

