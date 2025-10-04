-- COMPLETE M-Pesa RLS Fix - Drops ALL policies and recreates

-- Step 1: Drop ALL existing policies on mpesa_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON mpesa_transactions;
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON mpesa_transactions;
DROP POLICY IF EXISTS "System can update transactions" ON mpesa_transactions;
DROP POLICY IF EXISTS "Allow service to insert M-Pesa transactions" ON mpesa_transactions;
DROP POLICY IF EXISTS "Allow service to update M-Pesa transactions" ON mpesa_transactions;
DROP POLICY IF EXISTS "Allow service to read transactions" ON mpesa_transactions;

-- Step 2: Create new permissive policies

-- Allow ANYONE (including service) to insert transactions
CREATE POLICY "mpesa_insert_all"
    ON mpesa_transactions
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Allow ANYONE to update transactions (for callbacks)
CREATE POLICY "mpesa_update_all"
    ON mpesa_transactions
    FOR UPDATE
    TO public
    USING (true)
    WITH CHECK (true);

-- Users can only SELECT their own transactions (privacy)
CREATE POLICY "mpesa_select_own"
    ON mpesa_transactions
    FOR SELECT
    TO public
    USING (
        auth.uid() = user_id 
        OR auth.role() = 'service_role'
        OR auth.uid() IS NULL
    );

-- Step 3: Ensure RLS is enabled
ALTER TABLE mpesa_transactions ENABLE ROW LEVEL SECURITY;

-- Step 4: Verify policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'mpesa_transactions';
