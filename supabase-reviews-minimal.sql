-- ============================================
-- REVIEWS SYSTEM - MINIMAL WORKING VERSION
-- ============================================

-- Drop existing if any
DROP TABLE IF EXISTS review_helpful CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  images TEXT[],
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  trader_response TEXT,
  trader_response_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Create review helpful table
CREATE TABLE review_helpful (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Traders can respond to reviews
CREATE POLICY "Traders can respond" ON reviews FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM products WHERE products.id = reviews.product_id AND products.trader_id = auth.uid()));

-- RLS Policies for helpful
CREATE POLICY "Anyone can view helpful" ON review_helpful FOR SELECT USING (true);
CREATE POLICY "Users can mark helpful" ON review_helpful FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unmark helpful" ON review_helpful FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger: Update helpful count
CREATE OR REPLACE FUNCTION update_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = NEW.review_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews SET helpful_count = helpful_count - 1 WHERE id = OLD.review_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER helpful_count_trigger
AFTER INSERT OR DELETE ON review_helpful
FOR EACH ROW EXECUTE FUNCTION update_helpful_count();

-- Trigger: Update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
  prod_id UUID;
  avg_rating NUMERIC;
  review_count INTEGER;
BEGIN
  prod_id := COALESCE(NEW.product_id, OLD.product_id);
  
  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO avg_rating, review_count
  FROM reviews WHERE product_id = prod_id;
  
  UPDATE products SET rating = avg_rating, review_count = review_count WHERE id = prod_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Add review_count to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Function: Check if user purchased product (FIXED for buyer_id)
CREATE OR REPLACE FUNCTION has_purchased_product(user_id_param UUID, product_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.buyer_id = user_id_param
    AND oi.product_id = product_id_param
    AND o.status = 'delivered'
  );
END;
$$ LANGUAGE plpgsql;

-- Permissions
GRANT ALL ON reviews TO authenticated;
GRANT ALL ON review_helpful TO authenticated;
GRANT SELECT ON reviews TO anon;
GRANT SELECT ON review_helpful TO anon;

-- Success message
DO $$ BEGIN
  RAISE NOTICE '✅ Reviews system ready!';
END $$;
