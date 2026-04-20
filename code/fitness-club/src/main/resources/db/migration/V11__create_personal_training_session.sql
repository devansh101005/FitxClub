CREATE TABLE personal_training_session (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id      UUID NOT NULL,
    member_id       UUID NOT NULL,
    session_date    DATE NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'REQUESTED',
    notes           TEXT,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_pt_session_trainer FOREIGN KEY (trainer_id) REFERENCES staff(id),
    CONSTRAINT fk_pt_session_member FOREIGN KEY (member_id) REFERENCES member(id)
);

CREATE INDEX idx_pt_session_trainer ON personal_training_session(trainer_id);
CREATE INDEX idx_pt_session_member ON personal_training_session(member_id);
CREATE INDEX idx_pt_session_date ON personal_training_session(session_date);
CREATE INDEX idx_pt_session_status ON personal_training_session(status);
