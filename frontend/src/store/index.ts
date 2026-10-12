import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  nameEn?: string;
  price: number;
  quantity: number;
  image?: string;
  // Stock known when the item was added; used to cap quantities in the cart.
  stock?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  phone?: string;
  address?: string;
}

// A checkout attempt that already reached the server, so a refresh can still pay it
// instead of creating a second order.
export interface PendingOrder {
  id: number;
  userId: number;
  items: CartItem[];
  totalAmount?: number;
}

interface AppState {
  // Auth
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  consumeOrdered: (items: Array<Pick<CartItem, 'id' | 'quantity'>>) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // Checkout
  pendingOrder: PendingOrder | null;
  checkoutToken: string | null;
  setPendingOrder: (order: PendingOrder) => void;
  clearPendingOrder: () => void;
  setCheckoutToken: (token: string | null) => void;
}

function clampToStock(quantity: number, stock: number | undefined): number {
  return stock === undefined ? quantity : Math.min(quantity, stock);
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      setAuth: (user, token) => {
        const { pendingOrder, checkoutToken } = get();
        const belongsToOtherUser = pendingOrder !== null && pendingOrder.userId !== user.id;
        set({
          user,
          token,
          // A pending checkout belongs to the account that started it.
          pendingOrder: belongsToOtherUser ? null : pendingOrder,
          checkoutToken: belongsToOtherUser ? null : checkoutToken,
        });
      },
      clearAuth: () => {
        set({ user: null, token: null, pendingOrder: null, checkoutToken: null });
      },

      // Cart
      cart: [],
      addToCart: (item) => {
        const cart = get().cart;
        const existing = cart.find((i) => i.id === item.id);
        if (existing) {
          set({
            cart: cart.map((i) =>
              i.id === item.id
                ? { ...i, ...item, quantity: clampToStock(i.quantity + item.quantity, item.stock ?? i.stock) }
                : i
            ),
          });
        } else {
          set({ cart: [...cart, { ...item, quantity: clampToStock(item.quantity, item.stock) }] });
        }
      },
      removeFromCart: (id) => set({ cart: get().cart.filter((i) => i.id !== id) }),
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(id);
          return;
        }
        set({
          cart: get().cart.map((i) =>
            i.id === id ? { ...i, quantity: clampToStock(quantity, i.stock) } : i
          ),
        });
      },
      // Paying an order subtracts what it contained; items added later stay in the cart.
      consumeOrdered: (items) => {
        const ordered = new Map(items.map((item) => [item.id, item.quantity]));
        set({
          cart: get()
            .cart.map((i) =>
              ordered.has(i.id) ? { ...i, quantity: i.quantity - (ordered.get(i.id) as number) } : i
            )
            .filter((i) => i.quantity > 0),
        });
      },
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
      cartCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),

      // Checkout
      pendingOrder: null,
      checkoutToken: null,
      setPendingOrder: (order) => set({ pendingOrder: order }),
      clearPendingOrder: () => set({ pendingOrder: null, checkoutToken: null }),
      setCheckoutToken: (token) => set({ checkoutToken: token }),
    }),
    {
      name: 'xoana-store',
      partialize: (state) => ({
        cart: state.cart,
        user: state.user,
        token: state.token,
        pendingOrder: state.pendingOrder,
        checkoutToken: state.checkoutToken,
      }),
    }
  )
);
