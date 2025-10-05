-- ============================================
-- REVIEWS & RATINGS SYSTEM
-- Complete review system with ratings, photos, and trader responses
-- ============================================

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[], -- Array of image URLs
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  trader_response TEXT,
  trader_response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id) -- One review per user per product
);

-- Create review helpfulness tracking table
CREATE TABLE IF NOT EXISTS review_helpful (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id) -- One vote per user per review
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_helpful_review_id ON review_helpful(review_id);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR REVIEWS
-- ============================================

-- Anyone can read reviews
CREATE POLICY "Anyone can view reviews"
  ON reviews
  FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews"
  ON reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Traders can add responses to reviews on their products
CREATE POLICY "Traders can respond to reviews on their products"
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = reviews.product_id
      AND products.trader_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = reviews.product_id
      AND products.trader_id = auth.uid()
    )
  );

-- Admins can do everything with reviews
CREATE POLICY "Admins can manage all reviews"
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ============================================
-- RLS POLICIES FOR REVIEW HELPFULNESS
-- ============================================

-- Anyone can see helpful votes
CREATE POLICY "Anyone can view helpful votes"
  ON review_helpful
  FOR SELECT
  USING (true);

-- Authenticated users can mark reviews as helpful
CREATE POLICY "Authenticated users can mark helpful"
  ON review_helpful
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their helpful marks
CREATE POLICY "Users can remove their helpful marks"
  ON review_helpful
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update helpful_count automatically
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews
    SET helpful_count = helpful_count - 1
    WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update helpful count
DROP TRIGGER IF EXISTS update_review_helpful_count_trigger ON review_helpful;
CREATE TRIGGER update_review_helpful_count_trigger
AFTER INSERT OR DELETE ON review_helpful
FOR EACH ROW
EXECUTE FUNCTION update_review_helpful_count();

-- Function to update product rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC;
  review_count INTEGER;
BEGIN
  -- Get product_id (handle INSERT, UPDATE, DELETE)
  DECLARE
    prod_id UUID;
  BEGIN
    IF TG_OP = 'DELETE' THEN
      prod_id := OLD.product_id;
    ELSE
      prod_id := NEW.product_id;
    END IF;

    -- Calculate average rating and count
    SELECT 
      COALESCE(AVG(rating), 0),
      COUNT(*)
    INTO avg_rating, review_count
    FROM reviews
    WHERE product_id = prod_id;

    -- Update product
    UPDATE products
    SET 
      rating = avg_rating,
      review_count = review_count
    WHERE id = prod_id;
  END;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product rating
DROP TRIGGER IF EXISTS update_product_rating_trigger ON reviews;
CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ADD REVIEW_COUNT TO PRODUCTS TABLE
-- ============================================

-- Add review_count column if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Update existing products with review count
UPDATE products p
SET review_count = (
  SELECT COUNT(*)
  FROM reviews r
  WHERE r.product_id = p.id
);

-- ============================================
-- HELPFUL FUNCTIONS FOR QUERIES
-- ============================================

-- Function to check if user has purchased product (for verified purchase badge)
CREATE OR REPLACE FUNCTION has_purchased_product(user_id_param UUID, product_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = user_id_param
    AND oi.product_id = product_id_param
    AND o.status = 'delivered'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get average rating for a product
CREATE OR REPLACE FUNCTION get_product_avg_rating(product_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT COALESCE(AVG(rating), 0)
  INTO avg_rating
  FROM reviews
  WHERE product_id = product_id_param;
  
  RETURN ROUND(avg_rating, 1);
END;
$$ LANGUAGE plpgsql;

-- Function to get rating breakdown for a product
CREATE OR REPLACE FUNCTION get_rating_breakdown(product_id_param UUID)
RETURNS TABLE(
  five_star INTEGER,
  four_star INTEGER,
  three_star INTEGER,
  two_star INTEGER,
  one_star INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE rating = 5)::INTEGER AS five_star,
    COUNT(*) FILTER (WHERE rating = 4)::INTEGER AS four_star,
    COUNT(*) FILTER (WHERE rating = 3)::INTEGER AS three_star,
    COUNT(*) FILTER (WHERE rating = 2)::INTEGER AS two_star,
    COUNT(*) FILTER (WHERE rating = 1)::INTEGER AS one_star
  FROM reviews
  WHERE product_id = product_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE QUERIES (for testing)
-- ============================================

-- Get all reviews for a product with user info
-- SELECT 
--   r.*,
--   p.full_name as user_name,
--   p.avatar_url as user_avatar
-- FROM reviews r
-- JOIN profiles p ON r.user_id = p.id
-- WHERE r.product_id = 'YOUR_PRODUCT_ID'
-- ORDER BY r.created_at DESC;

-- Get average rating and count for a product
-- SELECT 
--   get_product_avg_rating('YOUR_PRODUCT_ID') as avg_rating,
--   COUNT(*) as review_count
-- FROM reviews
-- WHERE product_id = 'YOUR_PRODUCT_ID';

-- Get rating breakdown
-- SELECT * FROM get_rating_breakdown('YOUR_PRODUCT_ID');

-- Check if user has reviewed a product
-- SELECT EXISTS (
--   SELECT 1 FROM reviews
--   WHERE product_id = 'YOUR_PRODUCT_ID'
--   AND user_id = auth.uid()
-- );

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON reviews TO authenticated;
GRANT ALL ON review_helpful TO authenticated;
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON review_helpful TO anon;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Reviews system created successfully!';
  RAISE NOTICE '📊 Tables: reviews, review_helpful';
  RAISE NOTICE '🔒 RLS policies enabled';
  RAISE NOTICE '⚡ Automatic rating updates configured';
  RAISE NOTICE '🎯 Ready to accept reviews!';
END $$;
