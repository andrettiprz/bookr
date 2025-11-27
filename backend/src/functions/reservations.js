const { app } = require('@azure/functions');
const { query } = require('../database');
const { verifyToken } = require('../auth');

function getUserIdFromToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  return decoded ? decoded.id : null;
}

app.http('getReservations', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const userId = getUserIdFromToken(request);
      if (!userId) {
        return {
          status: 401,
          jsonBody: { error: 'Unauthorized' }
        };
      }

      const reservations = await query(`
        SELECT 
          r.Id, r.Title, r.Description, r.Date, r.Time, r.Duration,
          r.Location, r.Status, r.Color, r.ImageUrl, r.CreatedAt, r.UpdatedAt
        FROM [dbo].[Reservations] r
        WHERE r.UserId = @userId
        ORDER BY r.Date DESC, r.Time DESC
      `, {
        userId: { type: require('mssql').UniqueIdentifier, value: userId }
      });

      // Get attendees for each reservation
      for (let reservation of reservations) {
        const attendees = await query(`
          SELECT Name, Email
          FROM [dbo].[ReservationAttendees]
          WHERE ReservationId = @reservationId
        `, {
          reservationId: { type: require('mssql').UniqueIdentifier, value: reservation.Id }
        });
        reservation.attendees = attendees;
      }

      return {
        status: 200,
        jsonBody: { reservations },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    } catch (err) {
      context.error('Get reservations error:', err);
      return {
        status: 500,
        jsonBody: { error: 'Failed to fetch reservations' },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }
  }
});

app.http('createReservation', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const userId = getUserIdFromToken(request);
      if (!userId) {
        return {
          status: 401,
          jsonBody: { error: 'Unauthorized' }
        };
      }

      const body = await request.json();
      const { title, description, date, time, duration, location, status, color, imageUrl, attendees } = body;

      const result = await query(`
        INSERT INTO [dbo].[Reservations] 
          (UserId, Title, Description, Date, Time, Duration, Location, Status, Color, ImageUrl)
        OUTPUT INSERTED.Id, INSERTED.Title, INSERTED.Description, INSERTED.Date, 
               INSERTED.Time, INSERTED.Duration, INSERTED.Location, INSERTED.Status, 
               INSERTED.Color, INSERTED.ImageUrl, INSERTED.CreatedAt, INSERTED.UpdatedAt
        VALUES (@userId, @title, @description, @date, @time, @duration, @location, @status, @color, @imageUrl)
      `, {
        userId: { type: require('mssql').UniqueIdentifier, value: userId },
        title: { type: require('mssql').VarChar, value: title },
        description: { type: require('mssql').VarChar, value: description || null },
        date: { type: require('mssql').DateTime2, value: date },
        time: { type: require('mssql').Time, value: time },
        duration: { type: require('mssql').Int, value: duration || 60 },
        location: { type: require('mssql').VarChar, value: location || null },
        status: { type: require('mssql').VarChar, value: status || 'pending' },
        color: { type: require('mssql').VarChar, value: color || null },
        imageUrl: { type: require('mssql').VarChar, value: imageUrl || null }
      });

      const reservation = result[0];

      // Add attendees
      if (attendees && attendees.length > 0) {
        for (const attendee of attendees) {
          await query(`
            INSERT INTO [dbo].[ReservationAttendees] (ReservationId, Name, Email)
            VALUES (@reservationId, @name, @email)
          `, {
            reservationId: { type: require('mssql').UniqueIdentifier, value: reservation.Id },
            name: { type: require('mssql').VarChar, value: attendee.name || attendee },
            email: { type: require('mssql').VarChar, value: attendee.email || null }
          });
        }
      }

      const reservationAttendees = await query(`
        SELECT Name, Email
        FROM [dbo].[ReservationAttendees]
        WHERE ReservationId = @reservationId
      `, {
        reservationId: { type: require('mssql').UniqueIdentifier, value: reservation.Id }
      });

      reservation.attendees = reservationAttendees;

      return {
        status: 201,
        jsonBody: { reservation },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    } catch (err) {
      context.error('Create reservation error:', err);
      return {
        status: 500,
        jsonBody: { error: 'Failed to create reservation' },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }
  }
});

app.http('updateReservation', {
  methods: ['PUT', 'PATCH'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const userId = getUserIdFromToken(request);
      if (!userId) {
        return {
          status: 401,
          jsonBody: { error: 'Unauthorized' }
        };
      }

      const url = new URL(request.url);
      const reservationId = url.searchParams.get('id');
      if (!reservationId) {
        return {
          status: 400,
          jsonBody: { error: 'Reservation ID is required' }
        };
      }

      const body = await request.json();
      const updates = [];
      const params = {
        reservationId: { type: require('mssql').UniqueIdentifier, value: reservationId },
        userId: { type: require('mssql').UniqueIdentifier, value: userId }
      };

      if (body.title !== undefined) {
        updates.push('Title = @title');
        params.title = { type: require('mssql').VarChar, value: body.title };
      }
      if (body.description !== undefined) {
        updates.push('Description = @description');
        params.description = { type: require('mssql').VarChar, value: body.description };
      }
      if (body.date !== undefined) {
        updates.push('Date = @date');
        params.date = { type: require('mssql').DateTime2, value: body.date };
      }
      if (body.time !== undefined) {
        updates.push('Time = @time');
        params.time = { type: require('mssql').Time, value: body.time };
      }
      if (body.duration !== undefined) {
        updates.push('Duration = @duration');
        params.duration = { type: require('mssql').Int, value: body.duration };
      }
      if (body.location !== undefined) {
        updates.push('Location = @location');
        params.location = { type: require('mssql').VarChar, value: body.location };
      }
      if (body.status !== undefined) {
        updates.push('Status = @status');
        params.status = { type: require('mssql').VarChar, value: body.status };
      }
      if (body.color !== undefined) {
        updates.push('Color = @color');
        params.color = { type: require('mssql').VarChar, value: body.color };
      }
      if (body.imageUrl !== undefined) {
        updates.push('ImageUrl = @imageUrl');
        params.imageUrl = { type: require('mssql').VarChar, value: body.imageUrl };
      }

      updates.push('UpdatedAt = GETUTCDATE()');

      const result = await query(`
        UPDATE [dbo].[Reservations]
        SET ${updates.join(', ')}
        OUTPUT INSERTED.*
        WHERE Id = @reservationId AND UserId = @userId
      `, params);

      if (result.length === 0) {
        return {
          status: 404,
          jsonBody: { error: 'Reservation not found' }
        };
      }

      return {
        status: 200,
        jsonBody: { reservation: result[0] },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    } catch (err) {
      context.error('Update reservation error:', err);
      return {
        status: 500,
        jsonBody: { error: 'Failed to update reservation' },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }
  }
});

app.http('deleteReservation', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const userId = getUserIdFromToken(request);
      if (!userId) {
        return {
          status: 401,
          jsonBody: { error: 'Unauthorized' }
        };
      }

      const url = new URL(request.url);
      const reservationId = url.searchParams.get('id');
      if (!reservationId) {
        return {
          status: 400,
          jsonBody: { error: 'Reservation ID is required' }
        };
      }

      await query(`
        DELETE FROM [dbo].[Reservations]
        WHERE Id = @reservationId AND UserId = @userId
      `, {
        reservationId: { type: require('mssql').UniqueIdentifier, value: reservationId },
        userId: { type: require('mssql').UniqueIdentifier, value: userId }
      });

      return {
        status: 200,
        jsonBody: { message: 'Reservation deleted successfully' },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    } catch (err) {
      context.error('Delete reservation error:', err);
      return {
        status: 500,
        jsonBody: { error: 'Failed to delete reservation' },
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      };
    }
  }
});

