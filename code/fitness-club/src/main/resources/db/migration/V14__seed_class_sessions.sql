-- Seed a dummy class session so that testing and bookings can work
INSERT INTO class_session (id, class_name, date, start_time, end_time, capacity, created_at, updated_at) 
VALUES 
    (gen_random_uuid(), 'Yoga Beginners', CURRENT_DATE + INTERVAL '1 day', '10:00:00', '11:00:00', 20, NOW(), NOW());
