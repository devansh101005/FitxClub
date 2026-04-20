CREATE TABLE trainer_availability (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id      UUID NOT NULL,
    day_of_week     VARCHAR(10) NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_availability_trainer FOREIGN KEY (trainer_id) REFERENCES staff(id),
    CONSTRAINT uq_trainer_day_time UNIQUE (trainer_id, day_of_week, start_time)
);

CREATE INDEX idx_trainer_availability_trainer ON trainer_availability(trainer_id);

-- Add bio and certifications columns to staff table for trainer profiles
ALTER TABLE staff ADD COLUMN bio TEXT;
ALTER TABLE staff ADD COLUMN certifications TEXT;
ALTER TABLE staff ADD COLUMN hourly_rate NUMERIC(10,2);
