-- Seed a trainer staff record
INSERT INTO staff (id, name, email, phone, role, specialization, bio, certifications, hourly_rate)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Rahul Sharma',
    'trainer@fitnessclub.com',
    '9876543210',
    'TRAINER',
    'Weight Training, HIIT',
    'Certified personal trainer with 5 years of experience in strength and conditioning.',
    'ACE Certified, CrossFit Level 1',
    1500.00
);

-- Seed trainer user account (password: Trainer@123)
INSERT INTO user_account (id, email, password_hash, role, staff_id, is_active)
VALUES (
    gen_random_uuid(),
    'trainer@fitnessclub.com',
    '$2a$10$TY1Zrhi.F5DeJX1oxuWgLe3PQqfPsBf4nJGpfUiIYdpjKAIVAOs7W',
    'TRAINER',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    TRUE
);

-- Add membership pricing columns to support payment calculation
ALTER TABLE member ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2);
