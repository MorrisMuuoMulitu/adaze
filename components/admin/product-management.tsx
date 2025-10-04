"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Search, MoreVertical, Check, X, Trash2, Star, Eye, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  trader_id: string;
  status: 'active' | 'pending' | 'rejected';
  is_featured: boolean;
  created_at: string;
  trader?: {
    full_name: string;
  };
  rejection_reason?: string;
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: string | null }>({
    open: false,
    productId: null,
  });
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean;
    productId: string | null;
    reason: string;
  }>({
    open: false,
    productId: null,
    reason: '',
  });
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    product: Product | null;
  }>({
    open: false,
    product: null,
  });
  const [statusChangeDialog, setStatusChangeDialog] = useState<{
    open: boolean;
    productId: string | null;
    currentStatus: string | null;
    newStatus: string | null;
  }>({
    open: false,
    productId: null,
    currentStatus: null,
    newStatus: null,
  });

  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          trader:profiles!trader_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.trader?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((product) => product.status === statusFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleApproveProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'active', rejection_reason: null })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product approved successfully',
      });

      fetchProducts();
    } catch (error) {
      console.error('Error approving product:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve product',
        variant: 'destructive',
      });
    }
  };

  const handleRejectProduct = async () => {
    if (!rejectDialog.productId) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          status: 'rejected',
          rejection_reason: rejectDialog.reason || 'Does not meet platform guidelines',
        })
        .eq('id', rejectDialog.productId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product rejected',
      });

      setRejectDialog({ open: false, productId: null, reason: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject product',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      console.log('Attempting to delete product:', productId);
      
      // Check if product is in any ACTIVE orders (not cancelled)
      const { data: orderItems, error: orderCheckError } = await supabase
        .from('order_items')
        .select(`
          id,
          order:orders!order_id (
            status
          )
        `)
        .eq('product_id', productId);

      console.log('Order items check:', { orderItems, orderCheckError });

      if (orderCheckError) {
        console.error('Error checking order items:', orderCheckError);
        // If we can't check orders, just try to delete anyway
        // This handles RLS permission issues
      }

      // Filter for active orders only (exclude cancelled)
      const activeOrderItems = (orderItems || []).filter(
        (item: any) => item.order?.status !== 'cancelled'
      );

      console.log('Active order items:', activeOrderItems.length);

      if (activeOrderItems.length > 0) {
        // Product is in active orders - can't delete (preserve history)
        // Instead, set status to rejected to hide it
        const { error } = await supabase
          .from('products')
          .update({ 
            status: 'rejected',
            rejection_reason: 'Product removed by admin'
          })
          .eq('id', productId);

        if (error) {
          console.error('Error hiding product:', error);
          throw error;
        }

        toast({
          title: 'Product Hidden',
          description: `Product is in ${activeOrderItems.length} active order(s), so it was hidden instead of deleted. Cancel the orders first to delete permanently.`,
          duration: 5000,
        });
      } else {
        // Product not in orders - try to delete
        console.log('Product not in orders, attempting delete...');
        
        // First, remove from carts and wishlists (ignore errors)
        try {
          console.log('Deleting from cart...');
          const { data: cartData, error: cartError } = await supabase
            .from('cart')
            .delete()
            .eq('product_id', productId);
          console.log('Cart delete result:', { cartData, cartError });

          console.log('Deleting from wishlist...');
          const { data: wishlistData, error: wishlistError } = await supabase
            .from('wishlist')
            .delete()
            .eq('product_id', productId);
          console.log('Wishlist delete result:', { wishlistData, wishlistError });
        } catch (cleanupError) {
          console.log('Cleanup error (non-critical):', cleanupError);
        }
        
        // Now delete the product
        console.log('Deleting product...');
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', productId);

        console.log('Product delete result:', { deleteError });

        if (deleteError) {
          console.error('Error deleting product:', deleteError);
          console.log('Error code:', deleteError.code);
          console.log('Error details:', deleteError.details);
          console.log('Error hint:', deleteError.hint);
          console.log('Error message:', deleteError.message);
          
          // If delete fails due to foreign key, hide it instead
          if (deleteError.code === '23503') {
            console.log('Foreign key constraint detected');
            console.log('Constraint details:', deleteError.details);
            console.log('Hiding product instead...');
            
            const { error: hideError } = await supabase
              .from('products')
              .update({ 
                status: 'rejected',
                rejection_reason: 'Product removed by admin'
              })
              .eq('id', productId);

            if (hideError) throw hideError;

            toast({
              title: 'Product Hidden',
              description: `Product has dependencies (${deleteError.details}), so it was hidden instead. It will no longer appear in marketplace.`,
              duration: 7000,
            });
          } else {
            throw deleteError;
          }
        } else {
          toast({
            title: 'Success',
            description: 'Product deleted permanently',
          });
        }
      }

      setDeleteDialog({ open: false, productId: null });
      fetchProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFeatured = async (productId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !currentFeatured })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Product ${!currentFeatured ? 'featured' : 'unfeatured'} successfully`,
      });

      fetchProducts();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    }
  };

  const handleChangeStatus = async () => {
    if (!statusChangeDialog.productId || !statusChangeDialog.newStatus) return;

    try {
      const updateData: any = { status: statusChangeDialog.newStatus };
      
      // If changing to active, clear rejection reason
      if (statusChangeDialog.newStatus === 'active') {
        updateData.rejection_reason = null;
      }

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', statusChangeDialog.productId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Product status changed to ${statusChangeDialog.newStatus}`,
      });

      setStatusChangeDialog({ open: false, productId: null, currentStatus: null, newStatus: null });
      fetchProducts();
    } catch (error) {
      console.error('Error changing status:', error);
      toast({
        title: 'Error',
        description: 'Failed to change product status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'rejected':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, category, or trader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
            {statusFilter === 'pending' && products.filter(p => p.status === 'pending').length > 0 && (
              <span className="ml-2 text-amber-600 font-medium">
                • {products.filter(p => p.status === 'pending').length} pending approval
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Trader</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-100">
                        <Image
                          src={product.image_url || '/placeholder.png'}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {product.name}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>KSh {product.price.toLocaleString()}</TableCell>
                    <TableCell>{product.trader?.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {product.is_featured ? (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <Star className="h-4 w-4 text-gray-300" />
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setViewDialog({ open: true, product })}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              setStatusChangeDialog({
                                open: true,
                                productId: product.id,
                                currentStatus: product.status,
                                newStatus: null,
                              })
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Change Status
                          </DropdownMenuItem>
                          {product.status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApproveProduct(product.id)}
                              >
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                                Quick Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  setRejectDialog({
                                    open: true,
                                    productId: product.id,
                                    reason: '',
                                  })
                                }
                              >
                                <X className="mr-2 h-4 w-4 text-red-600" />
                                Quick Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {product.status === 'active' && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleFeatured(product.id, product.is_featured)
                              }
                            >
                              <Star className="mr-2 h-4 w-4" />
                              {product.is_featured ? 'Unfeature' : 'Feature'} Product
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              setDeleteDialog({ open: true, productId: product.id })
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* View Product Dialog */}
      <Dialog
        open={viewDialog.open}
        onOpenChange={(open) => setViewDialog({ ...viewDialog, open })}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {viewDialog.product && (
            <div className="space-y-4">
              <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={viewDialog.product.image_url || '/placeholder.png'}
                  alt={viewDialog.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm">{viewDialog.product.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category</p>
                  <p className="text-sm">{viewDialog.product.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price</p>
                  <p className="text-sm">KSh {viewDialog.product.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trader</p>
                  <p className="text-sm">{viewDialog.product.trader?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusBadgeColor(viewDialog.product.status)}>
                    {viewDialog.product.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Featured</p>
                  <p className="text-sm">{viewDialog.product.is_featured ? 'Yes' : 'No'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{viewDialog.product.description}</p>
              </div>
              {viewDialog.product.rejection_reason && (
                <div>
                  <p className="text-sm font-medium text-red-600 mb-2">Rejection Reason</p>
                  <p className="text-sm text-red-600">{viewDialog.product.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteDialog.productId && handleDeleteProduct(deleteDialog.productId)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Product Dialog */}
      <AlertDialog
        open={rejectDialog.open}
        onOpenChange={(open) => setRejectDialog({ ...rejectDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Product</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejection (optional)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="e.g., Product does not meet quality standards..."
              value={rejectDialog.reason}
              onChange={(e) =>
                setRejectDialog({ ...rejectDialog, reason: e.target.value })
              }
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Status Dialog */}
      <AlertDialog
        open={statusChangeDialog.open}
        onOpenChange={(open) =>
          setStatusChangeDialog({ ...statusChangeDialog, open })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Product Status</AlertDialogTitle>
            <AlertDialogDescription>
              Current status: <strong className="capitalize">{statusChangeDialog.currentStatus}</strong>
              <br />
              Select new status to hide/show product in marketplace
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={statusChangeDialog.newStatus || ''}
              onValueChange={(value) =>
                setStatusChangeDialog({ ...statusChangeDialog, newStatus: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Active (Visible in marketplace)
                  </div>
                </SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Pending (Hidden from marketplace)
                  </div>
                </SelectItem>
                <SelectItem value="rejected">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Rejected (Hidden from marketplace)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Only "Active" products are visible in the marketplace
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleChangeStatus}>
              Change Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
