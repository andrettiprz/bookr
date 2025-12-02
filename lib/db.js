import { sql } from '@vercel/postgres';

// Helper para ejecutar queries con manejo de errores
export async function query(text, params = []) {
  try {
    const result = await sql.query(text, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Funciones específicas para usuarios
export async function getUserByEmail(email) {
  const users = await query('SELECT * FROM users WHERE email = $1', [email]);
  return users[0] || null;
}

export async function createUser(id, name, email, password) {
  const result = await query(
    'INSERT INTO users (id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING *',
    [id, name, email, password]
  );
  return result[0];
}

// Funciones específicas para reservaciones
export async function getReservationsByUserId(userId) {
  return await query(
    `SELECT r.*, 
     COALESCE(
       json_agg(
         json_build_object('name', ra.name, 'email', ra.email)
       ) FILTER (WHERE ra.id IS NOT NULL), 
       '[]'
     ) as attendees
     FROM reservations r
     LEFT JOIN reservation_attendees ra ON r.id = ra.reservation_id
     WHERE r.user_id = $1
     GROUP BY r.id
     ORDER BY r.date DESC, r.time DESC`,
    [userId]
  );
}

export async function createReservation(data) {
  const { id, userId, title, description, date, time, duration, location, status, color, imageUrl } = data;
  
  const result = await query(
    `INSERT INTO reservations 
    (id, user_id, title, description, date, time, duration, location, status, color, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,
    [id, userId, title, description, date, time, duration, location, status, color, imageUrl]
  );
  
  return result[0];
}

export async function updateReservation(id, userId, updates) {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (fields.length === 0) return null;

  fields.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id, userId);

  const result = await query(
    `UPDATE reservations SET ${fields.join(', ')} 
     WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
     RETURNING *`,
    values
  );

  return result[0];
}

export async function deleteReservation(id, userId) {
  await query(
    'DELETE FROM reservations WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
}

export async function addAttendees(reservationId, attendees) {
  for (const attendee of attendees) {
    await query(
      'INSERT INTO reservation_attendees (id, reservation_id, name, email) VALUES ($1, $2, $3, $4)',
      [crypto.randomUUID(), reservationId, attendee.name, attendee.email]
    );
  }
}

