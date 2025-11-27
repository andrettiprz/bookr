-- Bookr Database Schema
-- Sistema de agendamiento premium

-- Tabla de Usuarios
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Users] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [Email] NVARCHAR(255) NOT NULL UNIQUE,
        [PasswordHash] NVARCHAR(255) NOT NULL,
        [Name] NVARCHAR(255) NOT NULL,
        [Avatar] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 DEFAULT GETUTCDATE(),
        [IsActive] BIT DEFAULT 1
    );
    
    CREATE INDEX IX_Users_Email ON [dbo].[Users]([Email]);
END

-- Tabla de Reservaciones
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Reservations]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Reservations] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [UserId] UNIQUEIDENTIFIER NOT NULL,
        [Title] NVARCHAR(255) NOT NULL,
        [Description] NVARCHAR(MAX) NULL,
        [Date] DATETIME2 NOT NULL,
        [Time] TIME NOT NULL,
        [Duration] INT NOT NULL DEFAULT 60,
        [Location] NVARCHAR(500) NULL,
        [Status] NVARCHAR(50) NOT NULL DEFAULT 'pending',
        [Color] NVARCHAR(7) NULL,
        [ImageUrl] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
        [UpdatedAt] DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_Reservations_UserId ON [dbo].[Reservations]([UserId]);
    CREATE INDEX IX_Reservations_Date ON [dbo].[Reservations]([Date]);
    CREATE INDEX IX_Reservations_Status ON [dbo].[Reservations]([Status]);
END

-- Tabla de Asistentes (Many-to-Many)
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ReservationAttendees]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ReservationAttendees] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [ReservationId] UNIQUEIDENTIFIER NOT NULL,
        [Name] NVARCHAR(255) NOT NULL,
        [Email] NVARCHAR(255) NULL,
        [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY ([ReservationId]) REFERENCES [dbo].[Reservations]([Id]) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_ReservationAttendees_ReservationId ON [dbo].[ReservationAttendees]([ReservationId]);
END

-- Tabla de Notificaciones
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Notifications]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Notifications] (
        [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [UserId] UNIQUEIDENTIFIER NOT NULL,
        [ReservationId] UNIQUEIDENTIFIER NULL,
        [Type] NVARCHAR(50) NOT NULL,
        [Message] NVARCHAR(500) NOT NULL,
        [IsRead] BIT DEFAULT 0,
        [CreatedAt] DATETIME2 DEFAULT GETUTCDATE(),
        FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users]([Id]) ON DELETE CASCADE,
        FOREIGN KEY ([ReservationId]) REFERENCES [dbo].[Reservations]([Id]) ON DELETE CASCADE
    );
    
    CREATE INDEX IX_Notifications_UserId ON [dbo].[Notifications]([UserId]);
    CREATE INDEX IX_Notifications_IsRead ON [dbo].[Notifications]([IsRead]);
END

