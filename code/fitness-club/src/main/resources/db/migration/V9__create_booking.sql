CREATE TABLE booking (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id         UUID NOT NULL,
    class_session_id  UUID,
    facility_id       UUID,
    slot_date         DATE NOT NULL,
    start_time        TIME,
    end_time          TIME,
    booking_type      VARCHAR(20) NOT NULL,
    status            VARCHAR(20) NOT NULL,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_booking_member FOREIGN KEY (member_id) REFERENCES member(id),
    CONSTRAINT fk_booking_class_session FOREIGN KEY (class_session_id) REFERENCES class_session(id),
    CONSTRAINT fk_booking_facility FOREIGN KEY (facility_id) REFERENCES facility(id)
);

CREATE INDEX idx_booking_member ON booking(member_id);
CREATE INDEX idx_booking_status ON booking(status);
CREATE INDEX idx_booking_class_session ON booking(class_session_id);
CREATE INDEX idx_booking_slot_date ON booking(slot_date);
