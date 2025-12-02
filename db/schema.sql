-- Schema para Vercel Postgres
-- Bookr - Sistema de Reservaciones

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Reservaciones
CREATE TABLE IF NOT EXISTS reservations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Pendiente',
    color VARCHAR(7) DEFAULT '#3B82F6',
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de Asistentes
CREATE TABLE IF NOT EXISTS reservation_attendees (
    id VARCHAR(36) PRIMARY KEY,
    reservation_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservation_attendees_reservation_id ON reservation_attendees(reservation_id);

-- Insertar usuario demo
INSERT INTO users (id, name, email, password, created_at)
VALUES (
    'demo-user-id',
    'Usuario Demo',
    'demo@bookr.com',
    'demo123',
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO NOTHING;

-- Insertar algunas reservaciones demo
INSERT INTO reservations (id, user_id, title, description, date, time, duration, location, status, color)
VALUES 
    (
        'demo-res-1',
        'demo-user-id',
        'Reunión de Proyecto',
        'Revisión de avances del trimestre',
        CURRENT_DATE + INTERVAL '2 days',
        '10:00:00',
        60,
        'Sala de Juntas A',
        'Confirmada',
        '#3B82F6'
    ),
    (
        'demo-res-2',
        'demo-user-id',
        'Presentación de Resultados',
        'Q4 2024 Performance Review',
        CURRENT_DATE + INTERVAL '5 days',
        '14:00:00',
        90,
        'Auditorio Principal',
        'Pendiente',
        '#F59E0B'
    )
ON CONFLICT (id) DO NOTHING;

