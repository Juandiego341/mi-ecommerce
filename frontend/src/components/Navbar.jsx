import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-white">
          Mi<span className="text-indigo-500">Shop</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-zinc-400 hover:text-white text-sm transition">
            Inicio
          </Link>
          <Link to="/products" className="text-zinc-400 hover:text-white text-sm transition">
            Productos
          </Link>
          {user && (
            <>
              <Link to="/cart" className="text-zinc-400 hover:text-white text-sm transition">
                Carrito
              </Link>
              <Link to="/orders" className="text-zinc-400 hover:text-white text-sm transition">
                Mis órdenes
              </Link>
              <Link to="/profile" className="text-zinc-400 hover:text-white text-sm transition">
                Perfil
              </Link>
              {user.rol === "ADMIN" && (
                <Link to ="/admin" className='text-indigo-400 hover:text-indigo-300 text-sm transition'>
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-zinc-400 text-sm">
                {user.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-4 py-2 rounded-lg transition"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-zinc-400 hover:text-white text-sm transition">
                Iniciar sesión
              </Link>
              <Link to="/register" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 py-2 rounded-lg transition">
                Registrarse
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}

export default Navbar