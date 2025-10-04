-- Fix M-Pesa RLS Policies

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON mpesa_transactions;
DROP POLICY IF EXISTS "System can update transactions" ON mpesa_transactions;

-- Create more permissive policies for M-Pesa service
CREATE POLICY "Allow service to insert M-Pesa transactions"
    ON mpesa_transactions
    FOR INSERT
    WITH CHECK (true);  -- Allow service account to insert

CREATE POLICY "Allow service to update M-Pesa transactions" 
    ON mpesa_transactions
    FOR UPDATE
    USING (true);  -- Allow callbacks to update

-- Keep user view policy
CREATE POLICY "Users can view own transactions" ON mpesa_transactions
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- Also ensure service can read for status checks
CREATE POLICY "Allow service to read transactions"
    ON mpesa_transactions  
    FOR SELECT
    USING (true);
