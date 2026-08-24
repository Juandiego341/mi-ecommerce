/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { cartService } from '../services/cart.service'

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { token } = useAuth()
  const [itemCount, setItemCount] = useState(0)

  const refreshCart = useCallback(async () => {
    if (!token) {
      setItemCount(0)
      return
    }
    try {
      const response = await cartService.getCart()
      const items = response.data?.cartItems || []
      setItemCount(items.reduce((acc, item) => acc + item.quantity, 0))
    } catch {
      setItemCount(0)
    }
  }, [token])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshCart()
  }, [refreshCart])

  return (
    <CartContext.Provider value={{ itemCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}
