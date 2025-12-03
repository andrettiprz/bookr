-- Script para generar datos de prueba masivos
-- Inserta 100 reservaciones de prueba para el usuario demo

-- Generar 100 reservaciones distribuidas en los próximos 60 días
DO $$
DECLARE
    i INTEGER;
    demo_user_id VARCHAR(36) := 'demo-user-id';
    reservation_date DATE;
    reservation_time TIME;
    random_hour INTEGER;
    random_minute INTEGER;
    titles TEXT[] := ARRAY[
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
    locations TEXT[] := ARRAY[
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
    statuses TEXT[] := ARRAY['Confirmada', 'Pendiente'];
    colors TEXT[] := ARRAY['#3B82F6', '#F59E0B', '#06D6A0', '#8B5CF6', '#EF4444'];
BEGIN
    FOR i IN 1..100 LOOP
        -- Fecha aleatoria en los próximos 60 días
        reservation_date := CURRENT_DATE + (random() * 60)::INTEGER;
        
        -- Hora aleatoria entre 8:00 y 18:00
        random_hour := 8 + (random() * 10)::INTEGER;
        random_minute := (random() * 3)::INTEGER * 15; -- 0, 15, 30, 45
        reservation_time := make_time(random_hour, random_minute, 0);
        
        INSERT INTO reservations (
            id, 
            user_id, 
            title, 
            description, 
            date, 
            time, 
            duration, 
            location, 
            status, 
            color
        ) VALUES (
            'test-res-' || i,
            demo_user_id,
            titles[1 + (random() * (array_length(titles, 1) - 1))::INTEGER],
            'Reservación de prueba #' || i || ' para testing de performance',
            reservation_date,
            reservation_time,
            30 + (random() * 3)::INTEGER * 30, -- 30, 60, 90 minutos
            locations[1 + (random() * (array_length(locations, 1) - 1))::INTEGER],
            statuses[1 + (random() * (array_length(statuses, 1) - 1))::INTEGER],
            colors[1 + (random() * (array_length(colors, 1) - 1))::INTEGER]
        ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
    
    RAISE NOTICE '✅ Se insertaron 100 reservaciones de prueba exitosamente';
END $$;

-- Verificar cuántas reservaciones tiene el usuario demo
SELECT COUNT(*) as total_reservations 
FROM reservations 
WHERE user_id = 'demo-user-id';
