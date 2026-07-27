import { useState, useEffect } from 'react'
import { productService } from '../services/product.service'
import { cartService } from '../services/cart.service'
import { useAuth } from '../context/useAuth'
import { useNavigate } from 'react-router-dom'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState(null)
  const [success, setSuccess] = useState(null)

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAll()
        setProducts(response.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const handleAddToCart = async (productId) => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      setAddingId(productId)
      await cartService.addItem({ productId, quantity: 1 })
      setSuccess(productId)
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-10">

        <h1 className="text-3xl font-bold text-white mb-8">Productos</h1>

        {loading ? (
          <div className="text-zinc-400 text-center py-20">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-zinc-400 text-center py-20">No hay productos disponibles</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div
                key={product.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-indigo-500 transition flex flex-col"
              >
                {/* Imagen */}
                <div className="bg-zinc-800 rounded-xl h-44 mb-4 flex items-center justify-center">
                  <span className="text-zinc-500 text-sm">Sin imagen</span>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <span className="text-xs text-indigo-400 font-medium">
                    {product.category?.name}
                  </span>
                  <h3 className="text-white font-medium mt-1 mb-1">{product.name}</h3>
                  <p className="text-zinc-400 text-sm line-clamp-2 mb-3">{product.desc}</p>
                </div>

                {/* Price + Button */}
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-indigo-400 font-bold text-lg">${product.price}</span>
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={addingId === product.id}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-xs px-4 py-2 rounded-lg transition"
                  >
                    {success === product.id
                      ? '✓ Agregado'
                      : addingId === product.id
                      ? 'Agregando...'
                      : 'Agregar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products