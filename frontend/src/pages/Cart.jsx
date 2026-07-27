import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cartService } from '../services/cart.service'

const Cart = () => {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await cartService.getCart()
      setCart(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return
    try {
      await cartService.updateItem({ quantity }, itemId)
      fetchCart()
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      await cartService.removeItem(itemId)
      fetchCart()
    } catch (err) {
      console.error(err)
    }
  }

  const total = cart?.cartItems?.reduce((acc, item) => {
    return acc + item.product.price * item.quantity
  }, 0) || 0

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-zinc-400">Cargando carrito...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-8">Mi Carrito</h1>

        {!cart || cart.cartItems?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400 mb-4">Tu carrito está vacío</p>
            <Link
              to="/products"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg transition"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.cartItems.map(item => (
                <div
                  key={item.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex gap-4"
                >
                  {/* Imagen */}
                  <div className="bg-zinc-800 rounded-xl w-20 h-20 flex items-center justify-center shrink-0">
                    <span className="text-zinc-500 text-xs">IMG</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{item.product.name}</h3>
                    <p className="text-indigo-400 font-bold mt-1">${item.product.price}</p>

                    {/* Cantidad */}
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white w-7 h-7 rounded-lg flex items-center justify-center transition"
                      >
                        -
                      </button>
                      <span className="text-white text-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white w-7 h-7 rounded-lg flex items-center justify-center transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Subtotal + eliminar */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-zinc-500 hover:text-red-400 text-sm transition"
                    >
                      ✕
                    </button>
                    <span className="text-white font-bold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit">
              <h2 className="text-white font-bold text-lg mb-4">Resumen</h2>
              <div className="flex justify-between text-zinc-400 text-sm mb-2">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-sm mb-4">
                <span>Envío</span>
                <span className="text-green-400">Gratis</span>
              </div>
              <div className="border-t border-zinc-800 pt-4 flex justify-between text-white font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <Link
                to="/orders"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg py-2.5 text-sm transition mt-6 block text-center"
              >
                Proceder al pago
              </Link>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

export default Cart