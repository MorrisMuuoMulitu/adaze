-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id),
  product_id UUID REFERENCES public.products(id),
  reviewer_id UUID REFERENCES public.profiles(id) NOT NULL,
  reviewed_id UUID REFERENCES public.profiles(id) NOT NULL, -- Trader or Transporter
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for the reviews table
CREATE POLICY "Authenticated users can create reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can view all reviews" ON public.reviews
  FOR SELECT TO authenticated, anon
  USING (true);

-- Allow reviewed users to view reviews about them (optional, for profile pages)
CREATE POLICY "Reviewed users can view reviews about them" ON public.reviews
  FOR SELECT TO authenticated
  USING (auth.uid() = reviewed_id);