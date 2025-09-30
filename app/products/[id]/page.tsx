import { Package, MapPin, DollarSign, ShoppingCart, Star, Heart, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { reviewService } from '@/lib/reviewService';
import { createClient } from '@/lib/supabase/client';
import { wishlistService } from '@/lib/wishlistService';

export default function ProductDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const productId = Array.isArray(id) ? id[0] : id;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [traderInfo, setTraderInfo] = useState<{ name: string; averageRating: number | null } | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (!productId) {
      router.push('/marketplace');
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await productService.getProductById(productId);
        if (productData) {
          setProduct(productData);

          // Fetch trader info
          const supabase = createClient();
          const { data: traderProfile, error: traderError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', productData.trader_id)
            .single();

          if (traderError) {
            console.error('Error fetching trader profile:', traderError);
          } else if (traderProfile) {
            const avgRating = await reviewService.getAverageRating(productData.trader_id);
            setTraderInfo({ name: traderProfile.full_name, averageRating: avgRating });
          }

          // Check wishlist status
          if (user) {
            const inWishlist = await wishlistService.isInWishlist(user.id, productData.id);
            setIsWishlisted(inWishlist);
          }
        } else {
          router.push('/marketplace');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        router.push('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (user) {
        try {
          const count = await cartService.getCartCount(user.id);
          setCartCount(count);
        } catch (error) {
          console.error('Error fetching cart count:', error);
        }
      }
    };

    fetchCartCount();
  }, [user]);

  const addToCart = async () => {
    if (!user) {
      router.push('/');
      return;
    }
    
    if (!product) return;
    
    try {
      await cartService.addToCart(user.id, product.id, quantity);
      toast.success(`${quantity} ${product.name} added to cart!`);
      
      // Update cart count
      const count = await cartService.getCartCount(user.id);
      setCartCount(count);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const handleToggleWishlist = async () => {
    if (!user || !product) {
      toast.error('Please log in to manage your wishlist.');
      return;
    }

    try {
      if (isWishlisted) {
        await wishlistService.removeFromWishlist(user.id, product.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist!');
      } else {
        await wishlistService.addToWishlist(user.id, product.id);
        setIsWishlisted(true);
        toast.success('Added to wishlist!');
      }
      // Notify Navbar to update wishlist count
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist.');
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading product...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found.</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image */}
            <div className="flex flex-col items-center">
              <div className="w-full h-96 bg-gray-200 rounded-xl overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Package className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleToggleWishlist}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  Wishlist
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Share functionality (not implemented yet)
                    toast.info('Link copied to clipboard');
                  }}
                >
                  Share
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{product.name}</h1>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{product.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-muted-foreground mx-2">•</span>
                    <span className="text-muted-foreground">In stock: {product.stock_quantity}</span>
                  </div>
                </div>
                
                <div className="text-3xl font-bold text-primary">
                  KSh {product.price.toFixed(2)}
                </div>
              </div>

              <p className="text-lg text-muted-foreground mb-6">
                {product.description}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Seller:</span>
                  <span className="font-medium">
                    {traderInfo?.name || 'N/A'}
                    {traderInfo?.averageRating !== null && (
                      <span className="ml-2 flex items-center">
                        ({traderInfo?.averageRating.toFixed(1)} <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-1" />)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Delivery:</span>
                  <span className="font-medium">Standard (3-5 days)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Available:</span>
                  <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                    {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                      >
                        <span className="text-lg">-</span>
                      </Button>
                      
                      <span className="text-xl font-medium w-12 text-center">
                        {quantity}
                      </span>
                      
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={incrementQuantity}
                        disabled={quantity >= product.stock_quantity}
                      >
                        <span className="text-lg">+</span>
                      </Button>
                    </div>
                    
                    <div className="text-xl font-bold">
                      Total: KSh {(product.price * quantity).toFixed(2)}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      className="flex-1 py-6 text-lg" 
                      onClick={addToCart}
                      disabled={product.stock_quantity <= 0}
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </Button>
                    
                    <Button 
                      className="py-6 px-8 text-lg" 
                      onClick={() => {
                        addToCart();
                        router.push('/cart');
                      }}
                      disabled={product.stock_quantity <= 0}
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                <ul className="space-y-2">
                  <li className="flex">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>High quality product</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Free shipping on orders over KSh 2000</span>
                  </li>
                  <li className="flex">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>30-day money-back guarantee</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}