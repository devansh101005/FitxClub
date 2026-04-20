CREATE TABLE member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    membership_type VARCHAR(20) NOT NULL,
    access_level VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    qr_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_member_email ON member(email);
CREATE INDEX idx_member_member_id ON member(member_id);
CREATE INDEX idx_member_status ON member(status);
