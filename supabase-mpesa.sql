-- M-Pesa Transactions Table
CREATE TABLE IF NOT EXISTS mpesa_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    checkout_request_id VARCHAR(100) UNIQUE NOT NULL,
    merchant_request_id VARCHAR(100) NOT NULL,
    mpesa_receipt_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mpesa_order_id ON mpesa_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_user_id ON mpesa_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_checkout_request ON mpesa_transactions(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_mpesa_status ON mpesa_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mpesa_created_at ON mpesa_transactions(created_at DESC);

-- RLS Policies
ALTER TABLE mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
    ON mpesa_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only authenticated users can insert transactions
CREATE POLICY "Authenticated users can insert transactions"
    ON mpesa_transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- System can update any transaction (for callbacks)
CREATE POLICY "System can update transactions"
    ON mpesa_transactions
    FOR UPDATE
    USING (true);

COMMENT ON TABLE mpesa_transactions IS 'Stores M-Pesa payment transactions for order payments';
COMMENT ON COLUMN mpesa_transactions.checkout_request_id IS 'Unique ID from M-Pesa STK Push';
COMMENT ON COLUMN mpesa_transactions.merchant_request_id IS 'Merchant request ID from M-Pesa';
COMMENT ON COLUMN mpesa_transactions.mpesa_receipt_number IS 'M-Pesa confirmation code (e.g., QGH7XXYYZZ)';
COMMENT ON COLUMN mpesa_transactions.status IS 'Payment status: pending, completed, failed, or cancelled';
