import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPersistStorage } from '../lib/safeStorage';
import toast from 'react-hot-toast';
import { cartService } from '../api/services/cart.service';
import { useAuthStore } from './authStore';

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
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      setIsOpen: (isOpen) => set({ isOpen }),

      addItem: async (newItem) => {
        const token = useAuthStore.getState().token;
        if (token) {
          try {
            await cartService.addItem(newItem.id, newItem.quantity);
          } catch (e) {
            console.error('Background sync failed');
          }
        }

        set((state) => {
          const existingItemIndex = state.items.findIndex(i => i.id === newItem.id);
          
          if (existingItemIndex !== -1) {
            // Item exists, update quantity
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            toast.success('Updated quantity in cart');
            return { items: updatedItems };
          } else {
            // New item
            toast.success('Added to cart');
            return { items: [...state.items, newItem] };
          }
        });
      },

      removeItem: async (id) => {
        const token = useAuthStore.getState().token;
        if (token) {
          try { await cartService.removeItem(id); } catch(e) {}
        }

        set((state) => ({
          items: state.items.filter(i => i.id !== id)
        }));
        toast.error('Removed from cart', { icon: '🗑️' });
      },

      updateQuantity: async (id, quantity) => {
        if (quantity < 1) return;
        
        const token = useAuthStore.getState().token;
        if (token) {
          try { await cartService.updateItem(id, quantity); } catch(e) {}
        }

        set((state) => ({
          items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
        }));
      },

      clearCart: async () => {
        const token = useAuthStore.getState().token;
        if (token) {
          try { await cartService.clearCart(); } catch(e) {}
        }
        set({ items: [] });
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
