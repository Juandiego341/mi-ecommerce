import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productService } from '../services/product.service'
import { categoryService } from '../services/category.service'
import { cartService } from '../services/cart.service'
import { useAuth } from '../context/useAuth'
import { useCart } from '../context/useCart'
import { getErrorMessage } from '../utils/getErrorMessage'
import ErrorBanner from '../components/ErrorBanner'
import { ProductGridSkeleton } from '../components/Skeleton'

const Products = () => {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState(null)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  // Estados de filtros
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Paginación
  const [page, setPage] = useState(1)
  const pageSize = 12

  const { user } = useAuth()
  const { refreshCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productService.getAll(),
          categoryService.getAll()
        ])
        setProducts(productsRes.data)
        setCategories(categoriesRes.data)
      } catch (err) {
        setError(getErrorMessage(err, 'No se pudieron cargar los productos'))
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleAddToCart = async (productId) => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      setAddingId(productId)
      setError(null)
      await cartService.addItem({ productId, quantity: 1 })
      setSuccess(productId)
      refreshCart()
      setTimeout(() => setSuccess(null), 2000)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo agregar el producto al carrito'))
    } finally {
      setAddingId(null)
    }
  }

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.desc.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === '' || product.categoryId === parseInt(selectedCategory)
    const matchMinPrice = minPrice === '' || product.price >= parseFloat(minPrice)
    const matchMaxPrice = maxPrice === '' || product.price <= parseFloat(maxPrice)
    return matchSearch && matchCategory && matchMinPrice && matchMaxPrice
  })

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize))
  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [search, selectedCategory, minPrice, maxPrice])

  const handleClearFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setMinPrice('')
    setMaxPrice('')
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-white mb-8">Productos</h1>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-10">

        <h1 className="text-3xl font-bold text-white mb-8">Productos</h1>

        {error && <div className="mb-6"><ErrorBanner message={error} /></div>}

        {/* Filtros */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Búsqueda */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Categoría */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Limpiar filtros */}
            <div>
              <button
                onClick={handleClearFilters}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2.5 text-sm transition"
              >
                Limpiar filtros
              </button>
            </div>

            {/* Precio mínimo */}
            <div>
              <input
                type="number"
                placeholder="Precio mínimo"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Precio máximo */}
            <div>
              <input
                type="number"
                placeholder="Precio máximo"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Resultados */}
            <div className="md:col-span-2 flex items-center">
              <p className="text-zinc-500 text-sm">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>

          </div>
        </div>

        {/* Productos */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400 mb-2">No se encontraron productos</p>
            <button
              onClick={handleClearFilters}
              className="text-indigo-400 hover:text-indigo-300 text-sm transition"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map(product => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-indigo-500 transition flex flex-col cursor-pointer"
              >
                {product.imagen ? (
                  <img
                    src={product.imagen}
                    alt={product.name}
                    className="w-full h-44 object-cover rounded-xl mb-4"
                  />
                ) : (
                  <div className="bg-zinc-800 rounded-xl h-44 mb-4 flex items-center justify-center">
                    <span className="text-zinc-500 text-sm">Sin imagen</span>
                  </div>
                )}

                <div className="flex-1">
                  <span className="text-xs text-indigo-400 font-medium">
                    {product.category?.name}
                  </span>
                  <h3 className="text-white font-medium mt-1 mb-1">{product.name}</h3>
                  <p className="text-zinc-400 text-sm line-clamp-2 mb-3">{product.desc}</p>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <span className="text-indigo-400 font-bold text-lg">${product.price}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAddToCart(product.id)
                    }}
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg transition"
            >
              Anterior
            </button>
            <span className="text-zinc-400 text-sm px-2">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm px-4 py-2 rounded-lg transition"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products