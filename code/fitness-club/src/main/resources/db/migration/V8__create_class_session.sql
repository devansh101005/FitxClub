CREATE TABLE class_session (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_name      VARCHAR(200) NOT NULL,
    date            DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    capacity        INTEGER NOT NULL,
    trainer_id      UUID,
    facility_id     UUID,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_class_session_trainer FOREIGN KEY (trainer_id) REFERENCES staff(id),
    CONSTRAINT fk_class_session_facility FOREIGN KEY (facility_id) REFERENCES facility(id)
);

CREATE INDEX idx_class_session_date ON class_session(date);
CREATE INDEX idx_class_session_trainer ON class_session(trainer_id);
