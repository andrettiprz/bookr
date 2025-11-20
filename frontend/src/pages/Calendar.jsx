import { useState } from 'react'
import { useReservations } from '../context/ReservationsContext'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import './Calendar.css'

export default function Calendar() {
  const { reservations, getReservationsByDate } = useReservations()
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getReservationsForDay = (day) => {
    const date = new Date(year, month, day)
    return getReservationsByDate(date.toISOString())
  }

  const isToday = (day) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayReservations = getReservationsForDay(day)
      const isTodayDate = isToday(day)
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isTodayDate ? 'today' : ''} ${dayReservations.length > 0 ? 'has-reservations' : ''}`}
          onClick={() => {
            const date = new Date(year, month, day)
            navigate(`/reservations?date=${date.toISOString().split('T')[0]}`)
          }}
        >
          <span className="day-number">{day}</span>
          {dayReservations.length > 0 && (
            <div className="reservations-indicator">
              <span className="reservation-count">{dayReservations.length}</span>
            </div>
          )}
        </div>
      )
    }

    return days
  }

  const selectedDateReservations = getReservationsByDate(currentDate.toISOString())

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1>Calendario</h1>
        <button onClick={goToToday} className="today-btn">
          Hoy
        </button>
      </div>

      <Card className="calendar-card">
        <div className="calendar-nav">
          <button onClick={goToPreviousMonth} className="nav-btn">
            ←
          </button>
          <h2 className="month-year">
            {monthNames[month]} {year}
          </h2>
          <button onClick={goToNextMonth} className="nav-btn">
            →
          </button>
        </div>

        <div className="calendar-grid">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-header">
              {day}
            </div>
          ))}
          {renderCalendarDays()}
        </div>
      </Card>

      {selectedDateReservations.length > 0 && (
        <Card className="selected-date-reservations">
          <h3>Reservas del {currentDate.toLocaleDateString('es-MX', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}</h3>
          <div className="reservations-list">
            {selectedDateReservations.map(reservation => (
              <div
                key={reservation.id}
                className="reservation-mini-card"
                onClick={() => navigate(`/reservations/${reservation.id}`)}
              >
                <div className="mini-time">{reservation.time}</div>
                <div className="mini-details">
                  <div className="mini-title">{reservation.title}</div>
                  <div className="mini-location">{reservation.location}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

