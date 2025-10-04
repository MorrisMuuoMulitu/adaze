-- Add delivery fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add payment status if missing
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';

COMMENT ON COLUMN orders.delivery_address IS 'Full delivery address for the order';
COMMENT ON COLUMN orders.phone_number IS 'Contact phone number for delivery';
COMMENT ON COLUMN orders.notes IS 'Optional order notes from buyer';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, paid, failed';
