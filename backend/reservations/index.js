const { query } = require('../src/database');
const { verifyToken } = require('../src/auth');
const mssql = require('mssql');

function getUserIdFromToken(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    return decoded ? decoded.id : null;
}

module.exports = async function (context, req) {
    context.log('Reservations function triggered:', req.method);

    // Manejar OPTIONS para CORS
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: ''
        };
        return;
    }

    try {
        const userId = getUserIdFromToken(req);
        if (!userId) {
            context.res = {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Unauthorized' })
            };
            return;
        }

        // GET - Obtener todas las reservaciones
        if (req.method === 'GET' && !req.query.id) {
            const reservations = await query(`
                SELECT 
                    r.Id, r.Title, r.Description, r.Date, r.Time, r.Duration,
                    r.Location, r.Status, r.Color, r.ImageUrl, r.CreatedAt, r.UpdatedAt
                FROM [dbo].[Reservations] r
                WHERE r.UserId = @userId
                ORDER BY r.Date DESC, r.Time DESC
            `, {
                userId: { type: mssql.UniqueIdentifier, value: userId }
            });

            // Get attendees for each reservation
            for (let reservation of reservations) {
                const attendees = await query(`
                    SELECT Name, Email
                    FROM [dbo].[ReservationAttendees]
                    WHERE ReservationId = @reservationId
                `, {
                    reservationId: { type: mssql.UniqueIdentifier, value: reservation.Id }
                });
                reservation.attendees = attendees;
            }

            context.res = {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ reservations })
            };
            return;
        }

        // POST - Crear nueva reservación
        if (req.method === 'POST') {
            const { title, description, date, time, duration, location, status, color, imageUrl, attendees } = req.body || {};

            const result = await query(`
                INSERT INTO [dbo].[Reservations] 
                    (UserId, Title, Description, Date, Time, Duration, Location, Status, Color, ImageUrl)
                OUTPUT INSERTED.Id, INSERTED.Title, INSERTED.Description, INSERTED.Date, 
                        INSERTED.Time, INSERTED.Duration, INSERTED.Location, INSERTED.Status, 
                        INSERTED.Color, INSERTED.ImageUrl, INSERTED.CreatedAt, INSERTED.UpdatedAt
                VALUES (@userId, @title, @description, @date, @time, @duration, @location, @status, @color, @imageUrl)
            `, {
                userId: { type: mssql.UniqueIdentifier, value: userId },
                title: { type: mssql.VarChar, value: title },
                description: { type: mssql.VarChar, value: description || null },
                date: { type: mssql.DateTime2, value: date },
                time: { type: mssql.Time, value: time },
                duration: { type: mssql.Int, value: duration || 60 },
                location: { type: mssql.VarChar, value: location || null },
                status: { type: mssql.VarChar, value: status || 'pending' },
                color: { type: mssql.VarChar, value: color || null },
                imageUrl: { type: mssql.VarChar, value: imageUrl || null }
            });

            const reservation = result[0];

            // Add attendees
            if (attendees && attendees.length > 0) {
                for (const attendee of attendees) {
                    await query(`
                        INSERT INTO [dbo].[ReservationAttendees] (ReservationId, Name, Email)
                        VALUES (@reservationId, @name, @email)
                    `, {
                        reservationId: { type: mssql.UniqueIdentifier, value: reservation.Id },
                        name: { type: mssql.VarChar, value: attendee.name || attendee },
                        email: { type: mssql.VarChar, value: attendee.email || null }
                    });
                }
            }

            const reservationAttendees = await query(`
                SELECT Name, Email
                FROM [dbo].[ReservationAttendees]
                WHERE ReservationId = @reservationId
            `, {
                reservationId: { type: mssql.UniqueIdentifier, value: reservation.Id }
            });

            reservation.attendees = reservationAttendees;

            context.res = {
                status: 201,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ reservation })
            };
            return;
        }

        // PUT/PATCH - Actualizar reservación
        if (req.method === 'PUT' || req.method === 'PATCH') {
            const reservationId = req.query.id;
            if (!reservationId) {
                context.res = {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'Reservation ID is required' })
                };
                return;
            }

            const updates = [];
            const params = {
                reservationId: { type: mssql.UniqueIdentifier, value: reservationId },
                userId: { type: mssql.UniqueIdentifier, value: userId }
            };

            const body = req.body || {};

            if (body.title !== undefined) {
                updates.push('Title = @title');
                params.title = { type: mssql.VarChar, value: body.title };
            }
            if (body.description !== undefined) {
                updates.push('Description = @description');
                params.description = { type: mssql.VarChar, value: body.description };
            }
            if (body.date !== undefined) {
                updates.push('Date = @date');
                params.date = { type: mssql.DateTime2, value: body.date };
            }
            if (body.time !== undefined) {
                updates.push('Time = @time');
                params.time = { type: mssql.Time, value: body.time };
            }
            if (body.duration !== undefined) {
                updates.push('Duration = @duration');
                params.duration = { type: mssql.Int, value: body.duration };
            }
            if (body.location !== undefined) {
                updates.push('Location = @location');
                params.location = { type: mssql.VarChar, value: body.location };
            }
            if (body.status !== undefined) {
                updates.push('Status = @status');
                params.status = { type: mssql.VarChar, value: body.status };
            }
            if (body.color !== undefined) {
                updates.push('Color = @color');
                params.color = { type: mssql.VarChar, value: body.color };
            }
            if (body.imageUrl !== undefined) {
                updates.push('ImageUrl = @imageUrl');
                params.imageUrl = { type: mssql.VarChar, value: body.imageUrl };
            }

            updates.push('UpdatedAt = GETUTCDATE()');

            const result = await query(`
                UPDATE [dbo].[Reservations]
                SET ${updates.join(', ')}
                OUTPUT INSERTED.*
                WHERE Id = @reservationId AND UserId = @userId
            `, params);

            if (result.length === 0) {
                context.res = {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'Reservation not found' })
                };
                return;
            }

            context.res = {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ reservation: result[0] })
            };
            return;
        }

        // DELETE - Eliminar reservación
        if (req.method === 'DELETE') {
            const reservationId = req.query.id;
            if (!reservationId) {
                context.res = {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'Reservation ID is required' })
                };
                return;
            }

            await query(`
                DELETE FROM [dbo].[Reservations]
                WHERE Id = @reservationId AND UserId = @userId
            `, {
                reservationId: { type: mssql.UniqueIdentifier, value: reservationId },
                userId: { type: mssql.UniqueIdentifier, value: userId }
            });

            context.res = {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ message: 'Reservation deleted successfully' })
            };
            return;
        }

        // Método no soportado
        context.res = {
            status: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    } catch (err) {
        context.log.error('Reservations error:', err);
        context.res = {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

