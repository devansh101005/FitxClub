CREATE TABLE access_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id       UUID NOT NULL,
    facility_id     UUID NOT NULL,
    entry_time      TIMESTAMP WITH TIME ZONE NOT NULL,
    exit_time       TIMESTAMP WITH TIME ZONE,
    access_status   VARCHAR(30) NOT NULL,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_access_log_member FOREIGN KEY (member_id) REFERENCES member(id),
    CONSTRAINT fk_access_log_facility FOREIGN KEY (facility_id) REFERENCES facility(id)
);

CREATE INDEX idx_access_log_member ON access_log(member_id);
CREATE INDEX idx_access_log_facility ON access_log(facility_id);
CREATE INDEX idx_access_log_entry_time ON access_log(entry_time);
