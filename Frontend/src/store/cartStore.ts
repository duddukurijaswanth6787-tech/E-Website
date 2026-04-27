import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPersistStorage } from '../lib/safeStorage';
import toast from 'react-hot-toast';
import { cartService } from '../api/services/cart.service';


export interface CartItem {
  id: string; // Typically productId
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
  fabric?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean; // Useful if we ever want to toggle a global drawer
  
  // Actions
  setIsOpen: (isOpen: boolean) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  // Selectors/Getters (could also be computed in components)
  subtotal: () => number;
  itemCount: () => number;
  
  syncBackendCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      setIsOpen: (isOpen) => set({ isOpen }),

      addItem: async (newItem) => {
        try {
          // Explicitly push to backend (handled via guest or user token interceptors natively)
          await cartService.addItem(newItem.id, newItem.quantity);
        } catch (e) {
          console.error('Background sync failed');
          toast.error("Failed to add to backend cart.");
          return;
        }

        set((state) => {
          const existingItemIndex = state.items.findIndex(i => i.id === newItem.id);
          
          if (existingItemIndex !== -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            toast.success('Updated quantity in cart');
            return { items: updatedItems };
          } else {
            toast.success('Added to cart');
            return { items: [...state.items, newItem] };
          }
        });
      },

      removeItem: async (id) => {
        try { 
          await cartService.removeItem(id); 
        } catch(e) { console.error(e); }

        set((state) => ({
          items: state.items.filter(i => i.id !== id)
        }));
        toast.error('Removed from cart', { icon: '🗑️' });
      },

      updateQuantity: async (id, quantity) => {
        if (quantity < 1) return;
        try { 
          await cartService.updateItem(id, quantity); 
        } catch(e) { console.error(e); }

        set((state) => ({
          items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
        }));
      },

      clearCart: async () => {
        try { 
          await cartService.clearCart(); 
        } catch(e) { console.error(e); }
        set({ items: [] });
      },

      syncBackendCart: async () => {
         try {
           const res: any = await cartService.getCart();
           const payload = res.data || res;
           if (payload && Array.isArray(payload.items) && payload.items.length > 0) {
             const mappedItems = payload.items.map((i: any) => ({
                id: i.product?._id || i.product,
                name: i.name || i.product?.name || 'Product',
                slug: i.product?.slug || '',
                price: i.price,
                image: i.image || i.product?.images?.[0] || '',
                quantity: i.quantity,
                fabric: i.variantId || undefined
             }));
             set({ items: mappedItems });
           } else {
             // Backend is empty
             set({ items: [] });
           }
         } catch (err) {
           console.error("Failed to sync backend cart", err);
         }
      },

      subtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      itemCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'vasanthi-cart',
      storage: getPersistStorage(),
    }
  )
);
