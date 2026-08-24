import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-500 mb-4">404</h1>
        <p className="text-zinc-400 mb-8">Esta página no existe</p>
        <Link
          to="/"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-medium transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFound
