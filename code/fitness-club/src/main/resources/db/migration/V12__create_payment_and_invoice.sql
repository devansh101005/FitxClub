-- Payment table
CREATE TABLE payment (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id           UUID NOT NULL,
    amount              NUMERIC(10,2) NOT NULL,
    currency            VARCHAR(10) NOT NULL DEFAULT 'INR',
    payment_type        VARCHAR(30) NOT NULL,
    razorpay_order_id   VARCHAR(100) UNIQUE,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    razorpay_signature  VARCHAR(200),
    status              VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    description         TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_payment_member FOREIGN KEY (member_id) REFERENCES member(id)
);

CREATE INDEX idx_payment_member ON payment(member_id);
CREATE INDEX idx_payment_status ON payment(status);
CREATE INDEX idx_payment_razorpay_order ON payment(razorpay_order_id);

-- Invoice table
CREATE TABLE invoice (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number  VARCHAR(50) UNIQUE NOT NULL,
    member_id       UUID NOT NULL,
    payment_id      UUID,
    amount          NUMERIC(10,2) NOT NULL,
    tax             NUMERIC(10,2) NOT NULL DEFAULT 0,
    total           NUMERIC(10,2) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    due_date        DATE,
    paid_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_invoice_member FOREIGN KEY (member_id) REFERENCES member(id),
    CONSTRAINT fk_invoice_payment FOREIGN KEY (payment_id) REFERENCES payment(id)
);

CREATE INDEX idx_invoice_member ON invoice(member_id);
CREATE INDEX idx_invoice_status ON invoice(status);
CREATE INDEX idx_invoice_number ON invoice(invoice_number);
