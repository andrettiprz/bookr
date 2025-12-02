import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import api from '../services/api'

const ReservationsContext = createContext(null)

export function ReservationsProvider({ children }) {
  const { user } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      loadReservations()
    } else {
      setReservations([])
    }
  }, [user])

  const loadReservations = async () => {
    
    setLoading(true)
    setError(null)
    try {
      const data = await api.getReservations()
      // Transformar datos de la API al formato del frontend
      const transformed = data.reservations.map(r => ({
        id: r.Id,
        title: r.Title,
        description: r.Description,
        date: r.Date,
        time: r.Time,
        duration: r.Duration,
        location: r.Location,
        status: r.Status,
        color: r.Color,
        imageUrl: r.ImageUrl,
        attendees: r.attendees || []
      }))
      setReservations(transformed)
    } catch (err) {
      console.error('Error loading reservations:', err)
      setError(err.message)
      // Fallback a localStorage si la API falla
      const saved = localStorage.getItem('bookr_reservations')
      if (saved) {
        setReservations(JSON.parse(saved))
      }
    } finally {
      setLoading(false)
    }
  }

  const addReservation = async (reservation) => {
    try {
      const data = await api.createReservation({
        title: reservation.title,
        description: reservation.description,
        date: reservation.date,
        time: reservation.time,
        duration: reservation.duration || 60,
        location: reservation.location,
        status: reservation.status || 'pending',
        color: reservation.color,
        imageUrl: reservation.imageUrl,
        attendees: reservation.attendees || []
      })
      
      const newReservation = {
        id: data.reservation.Id,
        title: data.reservation.Title,
        description: data.reservation.Description,
        date: data.reservation.Date,
        time: data.reservation.Time,
        duration: data.reservation.Duration,
        location: data.reservation.Location,
        status: data.reservation.Status,
        color: data.reservation.Color,
        imageUrl: data.reservation.ImageUrl,
        attendees: data.reservation.attendees || []
      }
      
      setReservations([...reservations, newReservation])
      return newReservation
    } catch (err) {
      console.error('Error creating reservation:', err)
      throw err
    }
  }

  const updateReservation = async (id, updates) => {
    try {
      await api.updateReservation(id, updates)
      setReservations(reservations.map(r => 
        r.id === id ? { ...r, ...updates } : r
      ))
    } catch (err) {
      console.error('Error updating reservation:', err)
      throw err
    }
  }

  const deleteReservation = async (id) => {
    try {
      await api.deleteReservation(id)
      setReservations(reservations.filter(r => r.id !== id))
    } catch (err) {
      console.error('Error deleting reservation:', err)
      throw err
    }
  }

  const getReservationsByDate = (date) => {
    const targetDate = new Date(date).toDateString()
    return reservations.filter(r => 
      new Date(r.date).toDateString() === targetDate
    )
  }

  const getUpcomingReservations = () => {
    const now = new Date()
    return reservations
      .filter(r => {
        const reservationDateTime = new Date(`${r.date}T${r.time}`)
        return reservationDateTime > now
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateA - dateB
      })
  }

  return (
    <ReservationsContext.Provider value={{
      reservations,
      loading,
      error,
      addReservation,
      updateReservation,
      deleteReservation,
      getReservationsByDate,
      getUpcomingReservations,
      refreshReservations: loadReservations
    }}>
      {children}
    </ReservationsContext.Provider>
  )
}

export function useReservations() {
  const context = useContext(ReservationsContext)
  if (!context) {
    throw new Error('useReservations must be used within ReservationsProvider')
  }
  return context
}
