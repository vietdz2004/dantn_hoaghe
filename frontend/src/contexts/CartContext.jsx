import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

// Cart Context
const CartContext = createContext();

// Cart Actions
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  SET_LOADING: 'SET_LOADING'
};

// Cart Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING: {
      return {
        ...state,
        loading: action.payload
      };
    }

    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id_SanPham === product.id_SanPham);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id_SanPham === product.id_SanPham
              ? { ...item, quantity: item.quantity + quantity, soLuong: item.quantity + quantity }
              : item
          )
        };
      } else {
        const cartItem = {
          id_SanPham: product.id_SanPham,
          tenSp: product.tenSp,
          gia: product.gia,
          giaKhuyenMai: product.giaKhuyenMai,
          hinhAnh: product.hinhAnh,
          quantity: quantity,
          soLuong: quantity,
          thuongHieu: product.thuongHieu || ''
        };
        
        return {
          ...state,
          items: [...state.items, cartItem]
        };
      }
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter(item => item.id_SanPham !== action.payload.productId)
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id_SanPham !== productId)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id_SanPham === productId
            ? { ...item, quantity, soLuong: quantity }
            : item
        )
      };
    }

    case CART_ACTIONS.CLEAR_CART: {
      return {
        ...state,
        items: []
      };
    }

    case CART_ACTIONS.LOAD_CART: {
      return {
        ...state,
        items: action.payload.items || []
      };
    }

    default:
      return state;
  }
};

// Initial State
const initialState = {
  items: [],
  loading: false
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Load cart from database
  const loadCartFromDatabase = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const response = await cartAPI.getCartItems(userId);
      
      if (response.data.success) {
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: { items: response.data.data.items }
        });
      }
    } catch (error) {
      console.error('Error loading cart from database:', error);
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Load cart from localStorage
  const loadCartFromLocalStorage = useCallback(() => {
    try {
      const savedCart = localStorage.getItem('hoashop_cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: { items: cartData.items || [] }
        });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage
  const saveCartToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem('hoashop_cart', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state]);

  // Sync localStorage cart to database when user logs in
  const syncLocalStorageToDatabase = useCallback(async (userId, localItems) => {
    if (!userId || !localItems.length) return;

    try {
      await cartAPI.syncCartFromLocalStorage({
        userId,
        cartItems: localItems
      });
      
      // Clear localStorage after successful sync
      localStorage.removeItem('hoashop_cart');
    } catch (error) {
      console.error('Error syncing cart to database:', error);
    }
  }, []);

  // Handle user state changes (login/logout)
  useEffect(() => {
    const initializeCart = async () => {
      const newUserId = user?.id_NguoiDung;
      
      // Skip if same user or not initialized yet
      if (currentUserId === newUserId && isInitialized) return;
      
      setCurrentUserId(newUserId);
      
      if (newUserId) {
        // User logged in
        const localCart = localStorage.getItem('hoashop_cart');
        let localItems = [];
        
        try {
          if (localCart) {
            const cartData = JSON.parse(localCart);
            localItems = cartData.items || [];
          }
        } catch (error) {
          console.error('Error parsing localStorage cart:', error);
        }
        
        // If user has items in localStorage, sync them first
        if (localItems.length > 0) {
          await syncLocalStorageToDatabase(newUserId, localItems);
        }
        
        // Load cart from database
        await loadCartFromDatabase(newUserId);
        
      } else {
        // User logged out or not logged in
        // Clear current cart and load from localStorage
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
        loadCartFromLocalStorage();
      }
      
      if (!isInitialized) {
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, [user?.id_NguoiDung, loadCartFromDatabase, loadCartFromLocalStorage, syncLocalStorageToDatabase, currentUserId, isInitialized]);

  // Save to localStorage when cart changes (only for non-logged-in users)
  useEffect(() => {
    if (isInitialized && !user?.id_NguoiDung) {
      saveCartToLocalStorage();
    }
  }, [state, user?.id_NguoiDung, isInitialized, saveCartToLocalStorage]);

  // Cart actions
  const addToCart = async (product, quantity = 1) => {
    if (user?.id_NguoiDung) {
      // User is logged in - save to database
      try {
        await cartAPI.addToCart({
          userId: user.id_NguoiDung,
          productId: product.id_SanPham,
          quantity
        });
        
        // Reload cart from database
        await loadCartFromDatabase(user.id_NguoiDung);
      } catch (error) {
        console.error('Error adding to cart:', error);
        // Fallback to local state
        dispatch({
          type: CART_ACTIONS.ADD_ITEM,
          payload: { product, quantity }
        });
      }
    } else {
      // User not logged in - update local state
      dispatch({
        type: CART_ACTIONS.ADD_ITEM,
        payload: { product, quantity }
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (user?.id_NguoiDung) {
      try {
        await cartAPI.removeFromCart(user.id_NguoiDung, productId);
        dispatch({
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: { productId }
        });
      } catch (error) {
        console.error('Error removing from cart:', error);
        dispatch({
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: { productId }
        });
      }
    } else {
      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM,
        payload: { productId }
      });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (user?.id_NguoiDung) {
      try {
        if (quantity <= 0) {
          await removeFromCart(productId);
        } else {
          await cartAPI.updateCartItem(user.id_NguoiDung, productId, { quantity });
          dispatch({
            type: CART_ACTIONS.UPDATE_QUANTITY,
            payload: { productId, quantity }
          });
        }
      } catch (error) {
        console.error('Error updating cart quantity:', error);
        dispatch({
          type: CART_ACTIONS.UPDATE_QUANTITY,
          payload: { productId, quantity }
        });
      }
    } else {
      dispatch({
        type: CART_ACTIONS.UPDATE_QUANTITY,
        payload: { productId, quantity }
      });
    }
  };

  const clearCart = async () => {
    if (user?.id_NguoiDung) {
      try {
        await cartAPI.clearCart(user.id_NguoiDung);
      } catch (error) {
        console.error('Error clearing cart from database:', error);
      }
    }
    
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Computed values
  const totalItems = state.items.reduce((total, item) => total + (item.quantity || item.soLuong || 0), 0);
  
  const totalAmount = state.items.reduce((total, item) => {
    const price = item.giaKhuyenMai || item.gia;
    const quantity = item.quantity || item.soLuong || 0;
    return total + (price * quantity);
  }, 0);

  const isInCart = (productId) => {
    return state.items.some(item => item.id_SanPham === productId);
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id_SanPham === productId);
    return item ? (item.quantity || item.soLuong || 0) : 0;
  };

  // Helper functions for compatibility
  const getTotalItems = () => totalItems;
  const getTotalPrice = () => totalAmount;

  const value = {
    // State
    items: state.items,
    cartItems: state.items,
    totalItems,
    totalAmount,
    loading: state.loading,
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Helpers
    isInCart,
    getItemQuantity,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 