// Vercel Serverless Function - Reservations CRUD
// Nota: Usa localStorage en frontend por ahora (modo demo)
// Esta función existe para mantener compatibilidad pero retorna data de ejemplo

const DEMO_RESERVATIONS = [
  {
    id: '1',
    title: 'Reunión de Proyecto',
    description: 'Revisión de avances del trimestre',
    date: '2024-12-10',
    time: '10:00',
    duration: 60,
    location: 'Sala de Juntas A',
    status: 'Confirmada',
    color: '#3B82F6',
    imageUrl: '',
    attendees: [
      { name: 'Juan Pérez', email: 'juan@example.com' }
    ]
  },
  {
    id: '2',
    title: 'Presentación de Resultados',
    description: 'Q4 2024 Performance Review',
    date: '2024-12-15',
    time: '14:00',
    duration: 90,
    location: 'Auditorio Principal',
    status: 'Pendiente',
    color: '#F59E0B',
    imageUrl: '',
    attendees: []
  }
];

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET - Obtener todas las reservaciones
    if (req.method === 'GET') {
      return res.status(200).json({
        reservations: DEMO_RESERVATIONS,
        message: 'Demo data - Frontend usa localStorage'
      });
    }

    // POST - Crear reservación
    if (req.method === 'POST') {
      const newReservation = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      
      return res.status(201).json({
        reservation: newReservation,
        message: 'Reservación creada (demo) - Frontend usa localStorage'
      });
    }

    // PUT - Actualizar reservación
    if (req.method === 'PUT') {
      return res.status(200).json({
        message: 'Reservación actualizada (demo) - Frontend usa localStorage'
      });
    }

    // DELETE - Eliminar reservación
    if (req.method === 'DELETE') {
      return res.status(200).json({
        message: 'Reservación eliminada (demo) - Frontend usa localStorage'
      });
    }

    // Método no soportado
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Error in reservations:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

