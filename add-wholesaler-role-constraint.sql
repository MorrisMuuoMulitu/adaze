-- Add wholesaler role to the profiles table role constraint

-- First, update the role column to add constraint allowing specific values
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE TEXT,
ADD CONSTRAINT role_check CHECK (role IN ('buyer', 'trader', 'transporter', 'wholesaler'));

-- Update the default role to buyer (which already exists)
ALTER TABLE public.profiles 
ALTER COLUMN role SET DEFAULT 'buyer';