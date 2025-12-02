// Vercel Serverless Function - Authentication
// Login y Register con Vercel Postgres

import { getUserByEmail, createUser } from '../lib/db.js';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action, email, password, name } = req.body;

    // LOGIN
    if (action === 'login') {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
      }

      const user = await getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }

      // En producción: usar bcrypt para verificar password
      if (user.password !== password) {
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }

      // Retornar usuario sin password
      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({ 
        success: true, 
        user: userWithoutPassword 
      });
    }

    // REGISTER
    if (action === 'register') {
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      // Verificar si el usuario ya existe
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Este email ya está registrado' });
      }

      // Crear nuevo usuario
      const userId = crypto.randomUUID();
      const newUser = await createUser(userId, name, email, password);

      // Retornar usuario sin password
      const { password: _, ...userWithoutPassword } = newUser;
      return res.status(201).json({ 
        success: true, 
        user: userWithoutPassword 
      });
    }

    return res.status(400).json({ error: 'Acción no válida' });

  } catch (error) {
    console.error('Error in auth:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
}

