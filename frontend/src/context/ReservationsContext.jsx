import { createContext, useContext, useState, useEffect } from 'react'

const ReservationsContext = createContext(null)

export function ReservationsProvider({ children }) {
  const [reservations, setReservations] = useState(() => {
    // Datos mock iniciales
    const saved = localStorage.getItem('bookr_reservations')
    if (saved) {
      return JSON.parse(saved)
    }
    return [
      {
        id: '1',
        title: 'Reunión con Cliente',
        description: 'Revisión de proyecto y próximos pasos',
        date: new Date(Date.now() + 86400000).toISOString(),
        time: '10:00',
        duration: 60,
        status: 'confirmed',
        location: 'Oficina Principal',
        attendees: ['Cliente ABC', 'Equipo de Desarrollo']
      },
      {
        id: '2',
        title: 'Consulta Médica',
        description: 'Chequeo anual',
        date: new Date(Date.now() + 172800000).toISOString(),
        time: '14:30',
        duration: 30,
        status: 'pending',
        location: 'Clínica San José',
        attendees: []
      },
      {
        id: '3',
        title: 'Presentación de Proyecto',
        description: 'Demo del nuevo sistema',
        date: new Date(Date.now() + 259200000).toISOString(),
        time: '16:00',
        duration: 90,
        status: 'confirmed',
        location: 'Sala de Conferencias',
        attendees: ['Equipo Directivo', 'Stakeholders']
      }
    ]
  })

  useEffect(() => {
    localStorage.setItem('bookr_reservations', JSON.stringify(reservations))
  }, [reservations])

  const addReservation = (reservation) => {
    const newReservation = {
      ...reservation,
      id: Date.now().toString(),
      status: reservation.status || 'pending'
    }
    setReservations([...reservations, newReservation])
    return newReservation
  }

  const updateReservation = (id, updates) => {
    setReservations(reservations.map(r => 
      r.id === id ? { ...r, ...updates } : r
    ))
  }

  const deleteReservation = (id) => {
    setReservations(reservations.filter(r => r.id !== id))
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
      .filter(r => new Date(r.date + 'T' + r.time) > now)
      .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
  }

  return (
    <ReservationsContext.Provider value={{
      reservations,
      addReservation,
      updateReservation,
      deleteReservation,
      getReservationsByDate,
      getUpcomingReservations
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

