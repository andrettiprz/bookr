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

-- Generar 100 reservaciones de prueba para testing de performance
-- Distribuidas en los próximos 60 días
DO $$
DECLARE
    i INTEGER;
    demo_user_id VARCHAR(36) := 'demo-user-id';
    reservation_date DATE;
    reservation_time TIME;
    random_hour INTEGER;
    random_minute INTEGER;
    titles TEXT[] := ARRAY['Reunión de Equipo', 'Presentación de Proyecto', 'Sesión de Planning', 'Review de Sprint', 'Capacitación', 'Entrevista', 'Consulta', 'Workshop', 'Conferencia', 'Networking'];
    locations TEXT[] := ARRAY['Sala de Juntas A', 'Sala de Juntas B', 'Oficina Principal', 'Sala de Conferencias', 'Auditorio', 'Sala Virtual', 'Coworking Space', 'Sala de Reuniones 1', 'Sala de Reuniones 2', 'Sala Ejecutiva'];
    statuses TEXT[] := ARRAY['Confirmada', 'Pendiente'];
    colors TEXT[] := ARRAY['#3B82F6', '#F59E0B', '#06D6A0', '#8B5CF6', '#EF4444'];
BEGIN
    FOR i IN 1..100 LOOP
        reservation_date := CURRENT_DATE + (random() * 60)::INTEGER;
        random_hour := 8 + (random() * 10)::INTEGER;
        random_minute := (random() * 3)::INTEGER * 15;
        reservation_time := make_time(random_hour, random_minute, 0);
        
        INSERT INTO reservations (id, user_id, title, description, date, time, duration, location, status, color)
        VALUES (
            'test-res-' || i,
            demo_user_id,
            titles[1 + (random() * (array_length(titles, 1) - 1))::INTEGER],
            'Reservación de prueba #' || i || ' para testing de performance',
            reservation_date,
            reservation_time,
            30 + (random() * 3)::INTEGER * 30,
            locations[1 + (random() * (array_length(locations, 1) - 1))::INTEGER],
            statuses[1 + (random() * (array_length(statuses, 1) - 1))::INTEGER],
            colors[1 + (random() * (array_length(colors, 1) - 1))::INTEGER]
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
END $$;

