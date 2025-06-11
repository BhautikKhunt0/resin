import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import type { CartItem } from '@shared/schema';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { productId: number; weight?: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: number; weight?: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'LOAD_FROM_STORAGE'; payload: CartItem[] };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => 
        item.productId === action.payload.productId && 
        item.weight === action.payload.weight
      );
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.productId === action.payload.productId && item.weight === action.payload.weight
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => 
          !(item.productId === action.payload.productId && item.weight === action.payload.weight)
        ),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.productId === action.payload.productId && item.weight === action.payload.weight
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0),
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };
    case 'OPEN_CART':
      return {
        ...state,
        isOpen: true,
      };
    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };
    case 'LOAD_FROM_STORAGE':
      return {
        ...state,
        items: action.payload,
      };
    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, weight?: string) => void;
  updateQuantity: (productId: number, weight: string | undefined, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  buyNow: (item: CartItem) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cartItems: CartItem[] = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: cartItems });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (productId: number, weight?: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, weight } });
  };

  const updateQuantity = (productId: number, weight: string | undefined, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, weight, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const buyNow = (item: CartItem) => {
    // Add item to cart without clearing existing items
    dispatch({ type: 'ADD_ITEM', payload: item });
    // Navigate to checkout will be handled in the component
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        getTotalItems,
        getTotalPrice,
        buyNow,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
