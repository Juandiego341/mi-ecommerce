import { useState, useEffect } from 'react'
import { productService } from '../services/product.service'
import { categoryService } from '../services/category.service'
import { orderService } from '../services/order.service'
import { getErrorMessage } from '../utils/getErrorMessage'
import ErrorBanner from '../components/ErrorBanner'
import { ListRowSkeleton } from '../components/Skeleton'
import OrderStatusStepper from '../components/OrderStatusStepper'

const NEXT_STAGE = {
  PAGADO: { status: 'PREPARANDO', label: 'Marcar como preparando' },
  PREPARANDO: { status: 'ENVIADO', label: 'Marcar como enviado' },
  ENVIADO: { status: 'ENTREGADO', label: 'Marcar como entregado' }
}
const CANCELABLE_STATUSES = ['PENDIENTE', 'PAGADO', 'PREPARANDO']

const Admin = () => {

  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [orderActionId, setOrderActionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', desc: '' })
  const [imagen, setImagen] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    SKU: '',
    price: '',
    categoryId: '',
    quantity: ''
  })
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [showImport, setShowImport] = useState(false)

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll(),
        orderService.getAllOrdersAdmin()
      ])
      setProducts(productsRes.data)
      setCategories(categoriesRes.data)
      setOrders(ordersRes.data)
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar los productos'))
    } finally {
      setLoading(false)
    }
  }

  const handleAdvanceOrder = async (orderId, status) => {
    setOrderActionId(orderId)
    setError(null)
    try {
      await orderService.updateFulfillment(orderId, status)
      fetchData()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo actualizar el estado del pedido'))
    } finally {
      setOrderActionId(null)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('desc', formData.desc)
      formDataToSend.append('SKU', formData.SKU)
      formDataToSend.append('price', formData.price)
      formDataToSend.append('categoryId', formData.categoryId)
      formDataToSend.append('quantity', formData.quantity)
      if (imagen) {
        formDataToSend.append('imagen', imagen)
      }

      if (editingProduct) {
        await productService.update(editingProduct.id, formDataToSend)
      } else {
        await productService.create(formDataToSend)
      }

      setShowForm(false)
      setEditingProduct(null)
      setImagen(null)
      setFormData({ name: '', desc: '', SKU: '', price: '', categoryId: '', quantity: '' })
      fetchData()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar el producto'))
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      desc: product.desc,
      SKU: product.SKU,
      price: product.price,
      categoryId: product.categoryId,
      quantity: product.inventory?.quantity || 0
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return
    setError(null)
    try {
      await productService.remove(id)
      fetchData()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo eliminar el producto'))
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
    setImagen(null)
    setFormData({ name: '', desc: '', SKU: '', price: '', categoryId: '', quantity: '' })
  }

  const handleImport = async () => {
    if (!importFile) return
    setImporting(true)
    setError(null)
    setImportResult(null)
    try {
      const response = await productService.importExcel(importFile)
      setImportResult(response.data)
      setImportFile(null)
      fetchData()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo importar el archivo'))
    } finally {
      setImporting(false)
    }
  }

  const handleCreateCategory = async () => {
    setError(null)
    try {
      await categoryService.create(newCategory)
      setNewCategory({ name: '', desc: '' })
      setShowCategoryForm(false)
      fetchData()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo crear la categoría'))
    }
  }

  const handleDeleteCategory = async (id) => {
    setError(null)
    try {
      await categoryService.remove(id)
      fetchData()
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo eliminar la categoría'))
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-4">
        <h1 className="text-3xl font-bold text-white mb-8">Panel de Admin</h1>
        <ListRowSkeleton />
        <ListRowSkeleton />
        <ListRowSkeleton />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Panel de Admin</h1>
          {activeTab === 'products' && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowImport(!showImport)}
                className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
              >
                {showImport ? 'Cancelar' : 'Importar Excel'}
              </button>
              <button
                onClick={() => showForm ? handleCancel() : setShowForm(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
              >
                {showForm ? 'Cancelar' : '+ Nuevo producto'}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'products' ? 'text-white border-indigo-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            Productos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'orders' ? 'text-white border-indigo-500' : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            Pedidos
          </button>
        </div>

        {error && <div className="mb-6"><ErrorBanner message={error} /></div>}

        {/* Importar Excel */}
        {activeTab === 'products' && showImport && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
            <h2 className="text-white font-bold text-lg mb-2">Importar productos desde Excel</h2>
            <p className="text-zinc-400 text-sm mb-4">
              El archivo debe ser .xlsx con las columnas: <span className="text-zinc-300">Nombre, Descripcion, SKU, Precio, Categoria, Stock</span>.
              Si el SKU ya existe, el producto se actualiza; si no, se crea (y la categoría también se crea si no existe).
            </p>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => setImportFile(e.target.files[0])}
                className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                onClick={handleImport}
                disabled={!importFile || importing}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
              >
                {importing ? 'Importando...' : 'Importar'}
              </button>
            </div>

            {importResult && (
              <div className="mt-4 space-y-2">
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3">
                  {importResult.created} producto{importResult.created !== 1 ? 's' : ''} creado{importResult.created !== 1 ? 's' : ''}, {importResult.updated} actualizado{importResult.updated !== 1 ? 's' : ''}
                </div>
                {importResult.errors.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
                    <p className="font-medium mb-1">{importResult.errors.length} fila{importResult.errors.length !== 1 ? 's' : ''} con errores:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {importResult.errors.map((e) => (
                        <li key={e.row}>Fila {e.row}: {e.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
        <>
        {/* Formulario producto */}
        {showForm && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
            <h2 className="text-white font-bold text-lg mb-6">
              {editingProduct ? 'Editar producto' : 'Nuevo producto'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">SKU</label>
                <input
                  type="text"
                  name="SKU"
                  value={formData.SKU}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-zinc-400 mb-1.5">Descripción</label>
                <textarea
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Precio</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Stock</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImagen(e.target.files[0])}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
                {imagen && (
                  <p className="text-zinc-400 text-xs mt-1">{imagen.name}</p>
                )}
              </div>

              {/* Categoría con botón de crear */}
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Categoría</label>
                <div className="flex gap-2">
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    required
                    className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(!showCategoryForm)}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 rounded-lg text-sm transition"
                  >
                    +
                  </button>
                </div>

                {showCategoryForm && (
                  <div className="mt-3 p-4 bg-zinc-800 rounded-lg space-y-3">
                    <p className="text-zinc-300 text-sm font-medium">Nueva categoría</p>
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full bg-zinc-700 border border-zinc-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition"
                    />
                    <input
                      type="text"
                      placeholder="Descripción"
                      value={newCategory.desc}
                      onChange={(e) => setNewCategory({ ...newCategory, desc: e.target.value })}
                      className="w-full bg-zinc-700 border border-zinc-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition"
                    >
                      Crear categoría
                    </button>

                    <div className="border-t border-zinc-700 pt-3 space-y-2">
                      <p className="text-zinc-400 text-xs font-medium">Categorías existentes</p>
                      {categories.map(cat => (
                        <div key={cat.id} className="flex items-center justify-between">
                          <span className="text-zinc-300 text-sm">{cat.name}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="text-red-400 hover:text-red-300 text-xs transition"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
                >
                  {editingProduct ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Lista de productos */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-zinc-400 text-sm font-medium px-6 py-4">Producto</th>
                <th className="text-left text-zinc-400 text-sm font-medium px-6 py-4">SKU</th>
                <th className="text-left text-zinc-400 text-sm font-medium px-6 py-4">Categoría</th>
                <th className="text-left text-zinc-400 text-sm font-medium px-6 py-4">Precio</th>
                <th className="text-left text-zinc-400 text-sm font-medium px-6 py-4">Stock</th>
                <th className="text-left text-zinc-400 text-sm font-medium px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-zinc-500 text-xs mt-0.5 line-clamp-1">{product.desc}</p>
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{product.SKU}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{product.category?.name}</td>
                  <td className="px-6 py-4 text-indigo-400 font-medium">${product.price}</td>
                  <td className="px-6 py-4 text-zinc-400 text-sm">{product.inventory?.quantity}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs px-3 py-1.5 rounded-lg transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-lg transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}

        {/* Pedidos */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-zinc-400">No hay pedidos todavía</p>
              </div>
            ) : (
              orders.map(order => {
                const next = NEXT_STAGE[order.status]
                const canCancel = CANCELABLE_STATUSES.includes(order.status)
                return (
                  <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-zinc-400 text-sm">Pedido #{order.id}</span>
                        <p className="text-white font-bold text-xl mt-1">${order.total.toFixed(2)}</p>
                        <p className="text-zinc-500 text-xs mt-1">{order.user?.username} · {order.user?.email}</p>
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

                    <div className="border-t border-zinc-800 pt-5 pb-2 px-2 mb-4">
                      <OrderStatusStepper status={order.status} />
                    </div>

                    {(next || canCancel) && (
                      <div className="flex gap-2 justify-end">
                        {next && (
                          <button
                            onClick={() => handleAdvanceOrder(order.id, next.status)}
                            disabled={orderActionId === order.id}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-xs px-4 py-2 rounded-lg transition"
                          >
                            {orderActionId === order.id ? 'Actualizando...' : next.label}
                          </button>
                        )}
                        {canCancel && (
                          <button
                            onClick={() => handleAdvanceOrder(order.id, 'CANCELADO')}
                            disabled={orderActionId === order.id}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs px-4 py-2 rounded-lg transition"
                          >
                            Cancelar pedido
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default Admin