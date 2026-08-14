import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../services/product.service'
import { cartService } from '../services/cart.service'
import { useAuth } from '../context/useAuth'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getOne(id)
        setProduct(response.data)
      } catch (err) {
        setError('Producto no encontrado',err)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      setAdding(true)
      await cartService.addItem({ productId: product.id, quantity })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (err) {
      setError('Error al agregar al carrito',err)
    } finally {
      setAdding(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-zinc-400">Cargando producto...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-red-400">{error}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
          <span
            onClick={() => navigate('/products')}
            className="hover:text-white cursor-pointer transition"
          >
            Productos
          </span>
          <span>/</span>
          <span className="text-zinc-300">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Imagen */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl h-96 flex items-center justify-center">
            <span className="text-zinc-500">Sin imagen</span>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">

            {/* Categoria */}
            <span className="text-indigo-400 text-sm font-medium mb-2">
              {product.category?.name}
            </span>

            {/* Nombre */}
            <h1 className="text-4xl font-bold text-white mb-4">
              {product.name}
            </h1>

            {/* Precio */}
            <p className="text-3xl font-bold text-indigo-400 mb-6">
              ${product.price}
            </p>

            {/* Descripcion */}
            <p className="text-zinc-400 leading-relaxed mb-8">
              {product.desc}
            </p>

            {/* Stock */}
            <p className="text-zinc-500 text-sm mb-6">
              Stock disponible:{' '}
              <span className="text-white font-medium">
                {product.inventory?.quantity} unidades
              </span>
            </p>

            {/* Cantidad */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-zinc-400 text-sm">Cantidad:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white w-8 h-8 rounded-lg flex items-center justify-center transition"
                >
                  -
                </button>
                <span className="text-white font-medium w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.inventory?.quantity || 99, q + 1))}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white w-8 h-8 rounded-lg flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium rounded-lg py-3 transition"
              >
                {success ? '✓ Agregado al carrito' : adding ? 'Agregando...' : 'Agregar al carrito'}
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 rounded-lg transition"
              >
                Ver carrito
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail