import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productService } from '../services/product.service'


const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAll()
        setProducts(response.data.slice(0, 4)) // solo 4 productos destacados
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950">
  

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Bienvenido a <span className="text-indigo-500">MiShop</span>
        </h1>
        <p className="text-zinc-400 text-lg mb-8">
          Encuentra los mejores productos al mejor precio
        </p>
        <Link
          to="/products"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-lg font-medium transition"
        >
          Ver productos
        </Link>
      </section>

      {/* Productos destacados */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-white mb-8">Productos destacados</h2>

        {loading ? (
          <div className="text-zinc-400 text-center py-10">Cargando...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div
                key={product.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-indigo-500 transition"
              >
                <div className="bg-zinc-800 rounded-xl h-40 mb-4 flex items-center justify-center">
                  <span className="text-zinc-500 text-sm">Sin imagen</span>
                </div>
                <h3 className="text-white font-medium mb-1">{product.name}</h3>
                <p className="text-zinc-400 text-sm mb-3 line-clamp-2">{product.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 font-bold">${product.price}</span>
                  <Link
                    to="/products"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg transition"
                  >
                    Ver más
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Home