import { useState, useEffect } from 'react'
import { orderService } from '../services/order.service'
import { getErrorMessage } from '../utils/getErrorMessage'
import { ListRowSkeleton } from '../components/Skeleton'
import OrderStatusStepper from '../components/OrderStatusStepper'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [page, setPage] = useState(1)
  const pageSize = 5

  const fetchOrders = async () => {
    try {
      const response = await orderService.getOrders()
      setOrders(response.data)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar las órdenes'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders()
  }, [])

  const handleCreateOrder = async () => {
    try {
      setCreating(true)
      setError(null)
      await orderService.createOrder({ provider: 'stripe', amount: 0 })
      setSuccess('¡Orden creada exitosamente!')
      setTimeout(() => setSuccess(null), 3000)
      fetchOrders()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo crear la orden. ¿Tienes productos en el carrito?'))
    } finally {
      setCreating(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(orders.length / pageSize))
  const paginatedOrders = orders.slice((page - 1) * pageSize, page * pageSize)

  if (loading) return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-3xl font-bold text-white mb-8">Mis Órdenes</h1>
        <ListRowSkeleton />
        <ListRowSkeleton />
        <ListRowSkeleton />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-10">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Mis Órdenes</h1>
          <button
            onClick={handleCreateOrder}
            disabled={creating}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
          >
            {creating ? 'Procesando...' : 'Crear orden'}
          </button>
        </div>

        {/* Mensajes */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3 mb-6">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-400">No tienes órdenes aún</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedOrders.map(order => (
              <div
                key={order.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
              >
                {/* Header orden */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-zinc-400 text-sm">Orden #{order.id}</span>
                    <p className="text-white font-bold text-xl mt-1">${order.total.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-indigo-500/10 text-indigo-400 text-xs px-3 py-1 rounded-full border border-indigo-500/30">
                      Pago: {order.payment?.status}
                    </span>
                    <p className="text-zinc-500 text-xs mt-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Progreso del pedido */}
                <div className="border-t border-zinc-800 pt-5 pb-2 px-2">
                  <OrderStatusStepper status={order.status} />
                </div>

                {/* Items */}
                <div className="border-t border-zinc-800 pt-4 space-y-2">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-zinc-400">
                        {item.product.name} x{item.quantity}
                      </span>
                      <span className="text-white">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

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

export default Orders