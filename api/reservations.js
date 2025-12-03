// Vercel Serverless Function - Reservations CRUD
// Conectado a Vercel Postgres

import { randomUUID } from 'crypto';
import { getReservationsByUserId, createReservation, updateReservation, deleteReservation, addAttendees } from '../lib/db.js';

export default async function handler(req, res) {
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
    // Verificar que el usuario esté autenticado (desde headers o body)
    const userId = req.headers['x-user-id'] || req.body?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // GET - Obtener todas las reservaciones del usuario
    if (req.method === 'GET') {
      const reservations = await getReservationsByUserId(userId);
      return res.status(200).json({ reservations });
    }

    // POST - Crear reservación
    if (req.method === 'POST') {
      const { title, description, date, time, duration, location, status, color, imageUrl, attendees } = req.body;

      try {
        const reservationId = randomUUID();
        const newReservation = await createReservation({
          id: reservationId,
          userId,
          title,
          description,
          date,
          time,
          duration: duration || 60,
          location,
          status: status || 'Pendiente',
          color: color || '#3B82F6',
          imageUrl
        });

        // Agregar asistentes si hay
        if (attendees && attendees.length > 0) {
          await addAttendees(reservationId, attendees);
        }

        return res.status(201).json({ reservation: newReservation });
      } catch (error) {
        // Detectar error de constraint único (doble reserva)
        if (error.code === '23505') { // Unique violation en PostgreSQL
          console.log('[CONCURRENCY] Double booking prevented:', { date, time, location });
          return res.status(409).json({
            error: 'Este horario ya está reservado. Por favor selecciona otro horario.',
            code: 'SLOT_ALREADY_BOOKED',
            details: { date, time, location }
          });
        }
        throw error; // Re-throw otros errores
      }
    }

    // PUT - Actualizar reservación
    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID de reservación requerido' });
      }

      const updatedReservation = await updateReservation(id, userId, updates);

      if (!updatedReservation) {
        return res.status(404).json({ error: 'Reservación no encontrada' });
      }

      return res.status(200).json({ reservation: updatedReservation });
    }

    // DELETE - Eliminar reservación
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID de reservación requerido' });
      }

      await deleteReservation(id, userId);
      return res.status(200).json({ message: 'Reservación eliminada' });
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

