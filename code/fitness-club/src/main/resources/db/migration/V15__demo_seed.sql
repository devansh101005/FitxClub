-- Demo-ready seed data for TA presentation (2026-04-20)
-- Populates realistic volumes so every dashboard and analytics page shows content.

-- ═══════════════════════ ADDITIONAL TRAINERS ═══════════════════════
INSERT INTO staff (id, name, email, phone, role, specialization, bio, certifications, hourly_rate)
VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Sarah Chen', 'sarah@fitnessclub.com', '9876543211', 'TRAINER', 'Yoga, Pilates, Meditation', 'RYT-500 certified yoga therapist with 10+ years guiding practitioners from recovery to advanced asana.', 'RYT 500, Yoga Alliance E-RYT', 1200.00),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Prateek Malhotra', 'prateek@fitnessclub.com', '9876543212', 'TRAINER', 'Spin, CrossFit, Functional Training', 'Former national-level cyclist turned CrossFit coach. Specialises in metabolic conditioning and endurance programming.', 'CrossFit Level 2, Spinning Certified', 1000.00);

INSERT INTO user_account (id, email, password_hash, role, staff_id, is_active)
VALUES
    (gen_random_uuid(), 'sarah@fitnessclub.com',   '$2a$10$TY1Zrhi.F5DeJX1oxuWgLe3PQqfPsBf4nJGpfUiIYdpjKAIVAOs7W', 'TRAINER', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', TRUE),
    (gen_random_uuid(), 'prateek@fitnessclub.com', '$2a$10$TY1Zrhi.F5DeJX1oxuWgLe3PQqfPsBf4nJGpfUiIYdpjKAIVAOs7W', 'TRAINER', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', TRUE);

-- ═══════════════════════ MEMBERS ═══════════════════════
INSERT INTO member (id, member_id, first_name, last_name, email, phone, membership_type, access_level, status, start_date, expiry_date, qr_code)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'FC-1001', 'Arjun',   'Mehta',     'arjun.mehta@gmail.com',     '9820145678', 'QUARTERLY', 'ALL_FACILITIES', 'ACTIVE', DATE '2026-02-15', DATE '2026-08-15', 'FC-1001'),
    ('d0000000-0000-0000-0000-000000000002', 'FC-1002', 'Priya',   'Kapoor',    'priya.kapoor@gmail.com',    '9833217890', 'MONTHLY',   'GYM_ONLY',       'ACTIVE', DATE '2026-03-01', DATE '2026-06-01', 'FC-1002'),
    ('d0000000-0000-0000-0000-000000000003', 'FC-1003', 'Vikram',  'Singhania', 'vikram.s@outlook.com',      '9845098765', 'ANNUAL',    'ALL_FACILITIES', 'ACTIVE', DATE '2026-01-10', DATE '2026-07-10', 'FC-1003'),
    ('d0000000-0000-0000-0000-000000000004', 'FC-1004', 'Ananya',  'Reddy',     'ananya.reddy@gmail.com',    '9867654321', 'QUARTERLY', 'ALL_FACILITIES', 'ACTIVE', DATE '2026-03-20', DATE '2026-09-20', 'FC-1004'),
    ('d0000000-0000-0000-0000-000000000005', 'FC-1005', 'Karthik', 'Iyer',      'karthik.iyer@yahoo.com',    '9812309876', 'ANNUAL',    'ALL_FACILITIES', 'ACTIVE', DATE '2026-01-01', DATE '2027-01-01', 'FC-1005');

-- User accounts for members (password: Admin@123)
INSERT INTO user_account (id, email, password_hash, role, member_id, is_active)
VALUES
    (gen_random_uuid(), 'arjun.mehta@gmail.com',  '$2a$10$TY1Zrhi.F5DeJX1oxuWgLe3PQqfPsBf4nJGpfUiIYdpjKAIVAOs7W', 'MEMBER', 'd0000000-0000-0000-0000-000000000001', TRUE),
    (gen_random_uuid(), 'priya.kapoor@gmail.com', '$2a$10$TY1Zrhi.F5DeJX1oxuWgLe3PQqfPsBf4nJGpfUiIYdpjKAIVAOs7W', 'MEMBER', 'd0000000-0000-0000-0000-000000000002', TRUE),
    (gen_random_uuid(), 'vikram.s@outlook.com',   '$2a$10$TY1Zrhi.F5DeJX1oxuWgLe3PQqfPsBf4nJGpfUiIYdpjKAIVAOs7W', 'MEMBER', 'd0000000-0000-0000-0000-000000000003', TRUE),
    (gen_random_uuid(), 'ananya.reddy@gmail.com', '$2a$10$TY1Zrhi.F5DeJX1oxuWgLe3PQqfPsBf4nJGpfUiIYdpjKAIVAOs7W', 'MEMBER', 'd0000000-0000-0000-0000-000000000004', TRUE),
    (gen_random_uuid(), 'karthik.iyer@yahoo.com', '$2a$10$TY1Zrhi.F5DeJX1oxuWgLe3PQqfPsBf4nJGpfUiIYdpjKAIVAOs7W', 'MEMBER', 'd0000000-0000-0000-0000-000000000005', TRUE);

-- ═══════════════════════ CLASS SESSIONS (future-dated) ═══════════════════════
INSERT INTO class_session (class_name, date, start_time, end_time, capacity, trainer_id, facility_id)
SELECT v.class_name, v.date, v.start_time, v.end_time, v.capacity,
       (SELECT id FROM staff WHERE name = v.trainer_name),
       (SELECT id FROM facility WHERE name = v.facility_name)
FROM (VALUES
    ('Power HIIT',              DATE '2026-04-20', TIME '18:00', TIME '19:00', 20, 'Rahul Sharma',     'Main Gym'),
    ('Morning Vinyasa Flow',    DATE '2026-04-20', TIME '07:30', TIME '08:30', 25, 'Sarah Chen',       'Yoga Studio'),
    ('Spin Endurance',          DATE '2026-04-20', TIME '12:00', TIME '13:00', 15, 'Prateek Malhotra', 'Main Gym'),
    ('Pilates Core Sculpt',     DATE '2026-04-21', TIME '09:00', TIME '10:00', 20, 'Sarah Chen',       'Yoga Studio'),
    ('Boxing Fundamentals',     DATE '2026-04-21', TIME '19:00', TIME '20:00', 12, 'Rahul Sharma',     'Main Gym'),
    ('Ashtanga Primary Series', DATE '2026-04-22', TIME '08:00', TIME '09:00', 25, 'Sarah Chen',       'Yoga Studio'),
    ('CrossFit WOD',            DATE '2026-04-22', TIME '17:30', TIME '18:30', 18, 'Prateek Malhotra', 'Main Gym'),
    ('Guided Meditation',       DATE '2026-04-23', TIME '07:00', TIME '07:45', 30, 'Sarah Chen',       'Yoga Studio'),
    ('Strength & Conditioning', DATE '2026-04-23', TIME '18:00', TIME '19:00', 20, 'Rahul Sharma',     'Main Gym'),
    ('Power HIIT',              DATE '2026-04-24', TIME '18:00', TIME '19:00', 20, 'Rahul Sharma',     'Main Gym'),
    ('Sunrise Yoga',            DATE '2026-04-25', TIME '07:00', TIME '08:00', 25, 'Sarah Chen',       'Yoga Studio'),
    ('Evening Spin',            DATE '2026-04-25', TIME '19:00', TIME '20:00', 15, 'Prateek Malhotra', 'Main Gym')
) AS v(class_name, date, start_time, end_time, capacity, trainer_name, facility_name);

-- ═══════════════════════ TRAINER AVAILABILITY ═══════════════════════
INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time)
SELECT (SELECT id FROM staff WHERE name = v.trainer_name), v.day_of_week, v.start_time, v.end_time
FROM (VALUES
    ('Rahul Sharma',     'MONDAY',    TIME '09:00', TIME '12:00'),
    ('Rahul Sharma',     'WEDNESDAY', TIME '09:00', TIME '12:00'),
    ('Rahul Sharma',     'FRIDAY',    TIME '09:00', TIME '12:00'),
    ('Rahul Sharma',     'TUESDAY',   TIME '17:00', TIME '20:00'),
    ('Rahul Sharma',     'THURSDAY',  TIME '17:00', TIME '20:00'),
    ('Sarah Chen',       'MONDAY',    TIME '06:30', TIME '10:30'),
    ('Sarah Chen',       'TUESDAY',   TIME '06:30', TIME '10:30'),
    ('Sarah Chen',       'WEDNESDAY', TIME '06:30', TIME '10:30'),
    ('Sarah Chen',       'THURSDAY',  TIME '06:30', TIME '10:30'),
    ('Sarah Chen',       'FRIDAY',    TIME '06:30', TIME '10:30'),
    ('Prateek Malhotra', 'MONDAY',    TIME '14:00', TIME '18:00'),
    ('Prateek Malhotra', 'WEDNESDAY', TIME '14:00', TIME '18:00'),
    ('Prateek Malhotra', 'FRIDAY',    TIME '14:00', TIME '18:00'),
    ('Prateek Malhotra', 'SATURDAY',  TIME '08:00', TIME '12:00')
) AS v(trainer_name, day_of_week, start_time, end_time);

-- ═══════════════════════ PERSONAL TRAINING SESSIONS ═══════════════════════
INSERT INTO personal_training_session (trainer_id, member_id, session_date, start_time, end_time, status, notes)
SELECT (SELECT id FROM staff WHERE name = v.trainer_name),
       (SELECT id FROM member WHERE email = v.member_email),
       v.session_date, v.start_time, v.end_time, v.status, v.notes
FROM (VALUES
    ('Rahul Sharma',     'arjun.mehta@gmail.com',  DATE '2026-04-22', TIME '10:00', TIME '11:00', 'CONFIRMED', 'Deadlift form correction and progressive overload plan'),
    ('Sarah Chen',       'arjun.mehta@gmail.com',  DATE '2026-04-25', TIME '08:00', TIME '09:00', 'CONFIRMED', 'Hip-opener sequence and injury prevention stretches'),
    ('Prateek Malhotra', 'arjun.mehta@gmail.com',  DATE '2026-04-28', TIME '16:00', TIME '17:00', 'REQUESTED', 'VO2 max baseline test and zone-2 cardio protocol'),
    ('Rahul Sharma',     'arjun.mehta@gmail.com',  DATE '2026-04-10', TIME '18:00', TIME '19:00', 'COMPLETED', 'Squat and Romanian deadlift technique session'),
    ('Sarah Chen',       'priya.kapoor@gmail.com', DATE '2026-04-21', TIME '07:00', TIME '08:00', 'CONFIRMED', 'Prenatal-safe yoga flow and breathing techniques'),
    ('Rahul Sharma',     'priya.kapoor@gmail.com', DATE '2026-04-23', TIME '18:00', TIME '19:00', 'REQUESTED', 'Initial strength assessment and goal setting')
) AS v(trainer_name, member_email, session_date, start_time, end_time, status, notes);

-- ═══════════════════════ PAYMENTS ═══════════════════════
INSERT INTO payment (id, member_id, amount, currency, payment_type, razorpay_order_id, razorpay_payment_id, status, description, created_at)
SELECT v.id::uuid,
       (SELECT id FROM member WHERE email = v.member_email),
       v.amount, 'INR', v.payment_type,
       v.order_id, v.payment_id, v.status, v.description, v.created_at
FROM (VALUES
    ('11111111-1111-1111-1111-111111111101', 'arjun.mehta@gmail.com',  3499.00, 'MEMBERSHIP_NEW',     'order_RP4a01', 'pay_RP4a01', 'CAPTURED', 'Gold membership — 6 months',           TIMESTAMPTZ '2026-02-15 10:30:00+05:30'),
    ('11111111-1111-1111-1111-111111111102', 'arjun.mehta@gmail.com',  1500.00, 'PT_SESSION',         'order_RP4a02', 'pay_RP4a02', 'CAPTURED', 'PT session with Rahul Sharma',         TIMESTAMPTZ '2026-04-05 11:20:00+05:30'),
    ('11111111-1111-1111-1111-111111111103', 'arjun.mehta@gmail.com',  800.00,  'COURT_BOOKING',      'order_RP4a03', 'pay_RP4a03', 'CAPTURED', 'Badminton court — 90 min',             TIMESTAMPTZ '2026-04-10 17:45:00+05:30'),
    ('11111111-1111-1111-1111-111111111104', 'priya.kapoor@gmail.com', 1999.00, 'MEMBERSHIP_NEW',     'order_RP4a04', 'pay_RP4a04', 'CAPTURED', 'Silver membership — monthly',          TIMESTAMPTZ '2026-03-01 09:00:00+05:30'),
    ('11111111-1111-1111-1111-111111111105', 'priya.kapoor@gmail.com', 1200.00, 'PT_SESSION',         'order_RP4a05', 'pay_RP4a05', 'CAPTURED', 'PT session with Sarah Chen',           TIMESTAMPTZ '2026-04-14 08:30:00+05:30'),
    ('11111111-1111-1111-1111-111111111106', 'vikram.s@outlook.com',   5999.00, 'MEMBERSHIP_NEW',     'order_RP4a06', 'pay_RP4a06', 'CAPTURED', 'Platinum membership — 6 months',       TIMESTAMPTZ '2026-01-10 14:00:00+05:30'),
    ('11111111-1111-1111-1111-111111111107', 'ananya.reddy@gmail.com', 3499.00, 'MEMBERSHIP_NEW',     'order_RP4a07', 'pay_RP4a07', 'CAPTURED', 'Gold membership — 6 months',           TIMESTAMPTZ '2026-03-20 15:30:00+05:30'),
    ('11111111-1111-1111-1111-111111111108', 'karthik.iyer@yahoo.com', 29999.00,'MEMBERSHIP_NEW',     'order_RP4a08', 'pay_RP4a08', 'CAPTURED', 'Platinum membership — annual',         TIMESTAMPTZ '2026-01-01 16:45:00+05:30'),
    ('11111111-1111-1111-1111-111111111109', 'arjun.mehta@gmail.com',  1500.00, 'PT_SESSION',         'order_RP4a09', NULL,          'CREATED',  'PT session — awaiting payment',        TIMESTAMPTZ '2026-04-18 20:10:00+05:30')
) AS v(id, member_email, amount, payment_type, order_id, payment_id, status, description, created_at);

-- ═══════════════════════ INVOICES ═══════════════════════
INSERT INTO invoice (invoice_number, member_id, payment_id, amount, tax, total, description, status, paid_at, created_at)
SELECT v.invoice_number,
       (SELECT member_id FROM payment WHERE id = v.payment_id::uuid),
       v.payment_id::uuid,
       v.amount, v.tax, v.total, v.description, v.status, v.paid_at, v.created_at
FROM (VALUES
    ('INV-2026-0001', '11111111-1111-1111-1111-111111111101', 2965.25, 533.75, 3499.00,  'Gold membership — Arjun Mehta',        'PAID', TIMESTAMPTZ '2026-02-15 10:30:30+05:30', TIMESTAMPTZ '2026-02-15 10:30:00+05:30'),
    ('INV-2026-0002', '11111111-1111-1111-1111-111111111102', 1271.19, 228.81, 1500.00,  'Personal training — Rahul Sharma',      'PAID', TIMESTAMPTZ '2026-04-05 11:20:30+05:30', TIMESTAMPTZ '2026-04-05 11:20:00+05:30'),
    ('INV-2026-0003', '11111111-1111-1111-1111-111111111103', 677.97,  122.03, 800.00,   'Court booking — Badminton',             'PAID', TIMESTAMPTZ '2026-04-10 17:45:30+05:30', TIMESTAMPTZ '2026-04-10 17:45:00+05:30'),
    ('INV-2026-0004', '11111111-1111-1111-1111-111111111104', 1694.07, 304.93, 1999.00,  'Silver membership — Priya Kapoor',      'PAID', TIMESTAMPTZ '2026-03-01 09:00:30+05:30', TIMESTAMPTZ '2026-03-01 09:00:00+05:30'),
    ('INV-2026-0005', '11111111-1111-1111-1111-111111111105', 1016.95, 183.05, 1200.00,  'Personal training — Sarah Chen',        'PAID', TIMESTAMPTZ '2026-04-14 08:30:30+05:30', TIMESTAMPTZ '2026-04-14 08:30:00+05:30'),
    ('INV-2026-0006', '11111111-1111-1111-1111-111111111106', 5083.90, 915.10, 5999.00,  'Platinum membership — Vikram Singhania','PAID', TIMESTAMPTZ '2026-01-10 14:00:30+05:30', TIMESTAMPTZ '2026-01-10 14:00:00+05:30'),
    ('INV-2026-0007', '11111111-1111-1111-1111-111111111107', 2965.25, 533.75, 3499.00,  'Gold membership — Ananya Reddy',        'PAID', TIMESTAMPTZ '2026-03-20 15:30:30+05:30', TIMESTAMPTZ '2026-03-20 15:30:00+05:30'),
    ('INV-2026-0008', '11111111-1111-1111-1111-111111111108', 25423.73,4575.27,29999.00, 'Annual Platinum — Karthik Iyer',        'PAID', TIMESTAMPTZ '2026-01-01 16:45:30+05:30', TIMESTAMPTZ '2026-01-01 16:45:00+05:30')
) AS v(invoice_number, payment_id, amount, tax, total, description, status, paid_at, created_at);

-- Pending invoice
INSERT INTO invoice (invoice_number, member_id, payment_id, amount, tax, total, description, status, due_date)
VALUES ('INV-2026-0009',
        (SELECT id FROM member WHERE email = 'vikram.s@outlook.com'),
        NULL,
        1271.19, 228.81, 1500.00,
        'PT session package — pending clearance',
        'PENDING',
        DATE '2026-04-25');

-- ═══════════════════════ ACCESS LOG ═══════════════════════
INSERT INTO access_log (member_id, facility_id, entry_time, exit_time, access_status)
SELECT (SELECT id FROM member WHERE email = v.member_email),
       (SELECT id FROM facility WHERE name = v.facility_name),
       v.entry_time, v.exit_time, v.access_status
FROM (VALUES
    ('arjun.mehta@gmail.com',  'Main Gym',          TIMESTAMPTZ '2026-04-19 07:15:00+05:30', TIMESTAMPTZ '2026-04-19 08:45:00+05:30', 'GRANTED'),
    ('arjun.mehta@gmail.com',  'Swimming Pool',     TIMESTAMPTZ '2026-04-18 18:00:00+05:30', TIMESTAMPTZ '2026-04-18 19:00:00+05:30', 'GRANTED'),
    ('arjun.mehta@gmail.com',  'Main Gym',          TIMESTAMPTZ '2026-04-17 06:30:00+05:30', TIMESTAMPTZ '2026-04-17 08:00:00+05:30', 'GRANTED'),
    ('arjun.mehta@gmail.com',  'Yoga Studio',       TIMESTAMPTZ '2026-04-16 07:00:00+05:30', TIMESTAMPTZ '2026-04-16 08:00:00+05:30', 'GRANTED'),
    ('arjun.mehta@gmail.com',  'Main Gym',          TIMESTAMPTZ '2026-04-15 07:00:00+05:30', TIMESTAMPTZ '2026-04-15 08:30:00+05:30', 'GRANTED'),
    ('arjun.mehta@gmail.com',  'Badminton Court 1', TIMESTAMPTZ '2026-04-14 17:30:00+05:30', TIMESTAMPTZ '2026-04-14 19:00:00+05:30', 'GRANTED'),
    ('priya.kapoor@gmail.com', 'Main Gym',          TIMESTAMPTZ '2026-04-19 08:00:00+05:30', TIMESTAMPTZ '2026-04-19 09:30:00+05:30', 'GRANTED'),
    ('priya.kapoor@gmail.com', 'Yoga Studio',       TIMESTAMPTZ '2026-04-18 07:00:00+05:30', TIMESTAMPTZ '2026-04-18 08:00:00+05:30', 'GRANTED'),
    ('priya.kapoor@gmail.com', 'Swimming Pool',     TIMESTAMPTZ '2026-04-17 18:30:00+05:30', TIMESTAMPTZ '2026-04-17 19:45:00+05:30', 'GRANTED'),
    ('priya.kapoor@gmail.com', 'Main Gym',          TIMESTAMPTZ '2026-04-16 06:00:00+05:30', TIMESTAMPTZ '2026-04-16 07:30:00+05:30', 'GRANTED'),
    ('vikram.s@outlook.com',   'Main Gym',          TIMESTAMPTZ '2026-04-19 06:45:00+05:30', TIMESTAMPTZ '2026-04-19 08:15:00+05:30', 'GRANTED'),
    ('vikram.s@outlook.com',   'Squash Court',      TIMESTAMPTZ '2026-04-18 17:00:00+05:30', TIMESTAMPTZ '2026-04-18 18:00:00+05:30', 'GRANTED'),
    ('ananya.reddy@gmail.com', 'Main Gym',          TIMESTAMPTZ '2026-04-19 19:00:00+05:30', NULL,                                    'GRANTED'),
    ('ananya.reddy@gmail.com', 'Yoga Studio',       TIMESTAMPTZ '2026-04-18 08:00:00+05:30', TIMESTAMPTZ '2026-04-18 09:00:00+05:30', 'GRANTED'),
    ('karthik.iyer@yahoo.com', 'Main Gym',          TIMESTAMPTZ '2026-04-19 17:30:00+05:30', TIMESTAMPTZ '2026-04-19 19:00:00+05:30', 'GRANTED'),
    ('karthik.iyer@yahoo.com', 'Swimming Pool',     TIMESTAMPTZ '2026-04-17 07:00:00+05:30', TIMESTAMPTZ '2026-04-17 08:15:00+05:30', 'GRANTED')
) AS v(member_email, facility_name, entry_time, exit_time, access_status);

-- ═══════════════════════ CLASS BOOKINGS ═══════════════════════
INSERT INTO booking (member_id, class_session_id, facility_id, slot_date, start_time, end_time, booking_type, status)
SELECT (SELECT id FROM member WHERE email = 'arjun.mehta@gmail.com'),
       cs.id, cs.facility_id, cs.date, cs.start_time, cs.end_time, 'CLASS', 'CONFIRMED'
FROM class_session cs
WHERE cs.class_name IN ('Power HIIT', 'Morning Vinyasa Flow', 'Ashtanga Primary Series')
  AND cs.date >= DATE '2026-04-20'
  AND cs.date <= DATE '2026-04-22';

-- Court booking
INSERT INTO booking (member_id, facility_id, slot_date, start_time, end_time, booking_type, status)
VALUES ((SELECT id FROM member WHERE email = 'arjun.mehta@gmail.com'),
        (SELECT id FROM facility WHERE name = 'Badminton Court 1'),
        DATE '2026-04-21', TIME '18:00', TIME '19:30', 'COURT', 'CONFIRMED');
