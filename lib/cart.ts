import { Product } from '@/types';
import { toast } from 'sonner';

const CART_STORAGE_KEY = 'adaze_cart';

interface CartItem extends Product {
  quantity: number;
}

export const getCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const cart = localStorage.getItem(CART_STORAGE_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const saveCartItems = (cartItems: CartItem[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
};

export const addToCart = (product: Product, quantity: number = 1, isUserLoggedIn: boolean = false) => {
  if (!isUserLoggedIn) {
    toast.error('You must be logged in to add items to the cart.');
    return false;
  }
  const cartItems = getCartItems();
  const existingItem = cartItems.find(item => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cartItems.push({ ...product, quantity });
  }
  saveCartItems(cartItems);
  toast.success('Item added to cart');
  window.dispatchEvent(new Event('cartUpdated'));
  return true;
};

export const removeFromCart = (productId: number) => {
  let cartItems = getCartItems();
  cartItems = cartItems.filter(item => item.id !== productId);
  saveCartItems(cartItems);
};

export const updateCartItemQuantity = (productId: number, quantity: number) => {
  let cartItems = getCartItems();
  const itemToUpdate = cartItems.find(item => item.id === productId);

  if (itemToUpdate) {
    itemToUpdate.quantity = quantity;
    if (itemToUpdate.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCartItems(cartItems);
    }
  }
};

export const clearCart = () => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(CART_STORAGE_KEY);
};
