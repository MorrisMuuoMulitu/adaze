-- Complete orders table fix - add all missing columns

-- Core order fields
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

-- Ensure these exist too
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS trader_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_trader_id ON orders(trader_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Comments
COMMENT ON COLUMN orders.total_amount IS 'Total order amount in KSh';
COMMENT ON COLUMN orders.delivery_address IS 'Full delivery address';
COMMENT ON COLUMN orders.phone_number IS 'Contact phone number';
COMMENT ON COLUMN orders.notes IS 'Optional buyer notes';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, paid, failed';
COMMENT ON COLUMN orders.status IS 'Order status: pending, confirmed, shipped, delivered, cancelled';
