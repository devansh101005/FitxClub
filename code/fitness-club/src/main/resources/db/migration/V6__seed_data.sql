-- Seed default facilities
INSERT INTO facility (id, name, facility_type, max_capacity, current_occupancy, is_open) VALUES
    (gen_random_uuid(), 'Main Gym',          'GYM',              150, 0, TRUE),
    (gen_random_uuid(), 'Swimming Pool',     'POOL',              50, 0, TRUE),
    (gen_random_uuid(), 'Yoga Studio',       'YOGA_STUDIO',       30, 0, TRUE),
    (gen_random_uuid(), 'Badminton Court 1', 'BADMINTON_COURT',    4, 0, TRUE),
    (gen_random_uuid(), 'Badminton Court 2', 'BADMINTON_COURT',    4, 0, TRUE),
    (gen_random_uuid(), 'Squash Court',      'SQUASH_COURT',       2, 0, TRUE),
    (gen_random_uuid(), 'Club Café',         'CAFE',              40, 0, TRUE);

-- Seed default admin user (password: Admin@123)
INSERT INTO user_account (id, email, password_hash, role, is_active) VALUES
    (gen_random_uuid(), 'admin@fitnessclub.com',
     '$2a$10$TY1Zrhi.F5DeJX1oxuWgLe3PQqfPsBf4nJGpfUiIYdpjKAIVAOs7W',
     'ADMIN', TRUE);

-- Seed default manager (password: Manager@123)
INSERT INTO user_account (id, email, password_hash, role, is_active) VALUES
    (gen_random_uuid(), 'manager@fitnessclub.com',
     '$2a$10$TY1Zrhi.F5DeJX1oxuWgLe3PQqfPsBf4nJGpfUiIYdpjKAIVAOs7W',
     'MANAGER', TRUE);

-- Seed default receptionist (password: Reception@123)
INSERT INTO user_account (id, email, password_hash, role, is_active) VALUES
    (gen_random_uuid(), 'reception@fitnessclub.com',
     '$2a$10$TY1Zrhi.F5DeJX1oxuWgLe3PQqfPsBf4nJGpfUiIYdpjKAIVAOs7W',
     'RECEPTIONIST', TRUE);
