// Export utilities for reservations

export function exportToCSV(reservations) {
  if (!reservations || reservations.length === 0) {
    throw new Error('No hay reservas para exportar')
  }

  const headers = ['ID', 'Título', 'Descripción', 'Fecha', 'Hora', 'Ubicación', 'Duración', 'Estado', 'Asistentes']
  
  const rows = reservations.map(r => [
    r.id || '',
    r.title || '',
    r.description || '',
    r.date || '',
    r.time || '',
    r.location || '',
    `${r.duration || 0} min`,
    r.status || '',
    r.attendees?.length || 0
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `bookr-reservas-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToICal(reservations) {
  if (!reservations || reservations.length === 0) {
    throw new Error('No hay reservas para exportar')
  }

  const formatDate = (date, time) => {
    const d = new Date(`${date}T${time}`)
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const events = reservations.map(r => {
    const start = formatDate(r.date, r.time)
    const endDate = new Date(`${r.date}T${r.time}`)
    endDate.setMinutes(endDate.getMinutes() + (r.duration || 60))
    const end = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

    return [
      'BEGIN:VEVENT',
      `UID:${r.id}@bookr.app`,
      `DTSTAMP:${formatDate(new Date().toISOString().split('T')[0], '00:00:00')}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${r.title}`,
      `DESCRIPTION:${r.description || ''}`,
      `LOCATION:${r.location || ''}`,
      `STATUS:${r.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT'
    ].join('\r\n')
  }).join('\r\n')

  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bookr//Reservations//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR'
  ].join('\r\n')

  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `bookr-reservas-${new Date().toISOString().split('T')[0]}.ics`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportToJSON(reservations) {
  if (!reservations || reservations.length === 0) {
    throw new Error('No hay reservas para exportar')
  }

  const jsonContent = JSON.stringify(reservations, null, 2)
  const blob = new Blob([jsonContent], { type: 'application/json' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `bookr-reservas-${new Date().toISOString().split('T')[0]}.json`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

