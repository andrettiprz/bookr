// Vercel Serverless Function - Seed Test Data
// TEMPORAL: Solo para generar datos de prueba

import { query } from '../lib/db.js';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const demoUserId = 'demo-user-id';
        const count = req.body?.count || 100;

        const titles = [
            'Reunión de Equipo',
            'Presentación de Proyecto',
            'Sesión de Planning',
            'Review de Sprint',
            'Capacitación',
            'Entrevista',
            'Consulta',
            'Workshop',
            'Conferencia',
            'Networking'
        ];

        const locations = [
            'Sala de Juntas A',
            'Sala de Juntas B',
            'Oficina Principal',
            'Sala de Conferencias',
            'Auditorio',
            'Sala Virtual',
            'Coworking Space',
            'Sala de Reuniones 1',
            'Sala de Reuniones 2',
            'Sala Ejecutiva'
        ];

        const statuses = ['Confirmada', 'Pendiente'];
        const colors = ['#3B82F6', '#F59E0B', '#06D6A0', '#8B5CF6', '#EF4444'];

        let inserted = 0;

        for (let i = 1; i <= count; i++) {
            // Fecha aleatoria en los próximos 60 días
            const daysAhead = Math.floor(Math.random() * 60);
            const date = new Date();
            date.setDate(date.getDate() + daysAhead);
            const dateStr = date.toISOString().split('T')[0];

            // Hora aleatoria entre 8:00 y 18:00
            const hour = 8 + Math.floor(Math.random() * 10);
            const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

            // Duración: 30, 60 o 90 minutos
            const duration = 30 + Math.floor(Math.random() * 3) * 30;

            try {
                await query(
                    `INSERT INTO reservations (id, user_id, title, description, date, time, duration, location, status, color)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO NOTHING`,
                    [
                        `test-res-${randomUUID()}`,
                        demoUserId,
                        titles[Math.floor(Math.random() * titles.length)],
                        `Reservación de prueba #${i} para testing de performance`,
                        dateStr,
                        timeStr,
                        duration,
                        locations[Math.floor(Math.random() * locations.length)],
                        statuses[Math.floor(Math.random() * statuses.length)],
                        colors[Math.floor(Math.random() * colors.length)]
                    ]
                );
                inserted++;
            } catch (err) {
                console.error(`Error inserting reservation ${i}:`, err);
            }
        }

        // Contar total de reservaciones
        const result = await query(
            'SELECT COUNT(*) as total FROM reservations WHERE user_id = $1',
            [demoUserId]
        );

        return res.status(200).json({
            success: true,
            message: `✅ Se insertaron ${inserted} reservaciones de prueba`,
            totalReservations: parseInt(result[0].total)
        });

    } catch (error) {
        console.error('Error seeding data:', error);
        return res.status(500).json({
            error: error.message || 'Internal server error'
        });
    }
}
