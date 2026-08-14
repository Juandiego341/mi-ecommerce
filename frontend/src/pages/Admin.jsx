import { useState, useEffect } from 'react'
import { productService } from '../services/product.service'
import { categoryService } from '../services/category.service'

const Admin = () => {

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', desc: '' })
  const [formData, setFormData] = useState({
    name: '',
    desc: '',
    SKU: '',
    price: '',
    categoryId: '',
    quantity: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productService.getAll(),
        categoryService.getAll()
      ])
      setProducts(productsRes.data)
      setCategories(categoriesRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        categoryId: parseInt(formData.categoryId),
        quantity: parseInt(formData.quantity)
      }
      if (editingProduct) {
        await productService.update(editingProduct.id, dataToSend)
      } else {
        await productService.create(dataToSend)
      }
      setShowForm(false)
      setEditingProduct(null)
      setFormData({ name: '', desc: '', SKU: '', price: '', categoryId: '', quantity: '' })
      fetchData()
    } catch (err) {
      console.error(err)
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
    try {
      await productService.remove(id)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
    setFormData({ name: '', desc: '', SKU: '', price: '', categoryId: '', quantity: '' })
  }

  const handleCreateCategory = async () => {
    try {
      await categoryService.create(newCategory)
      setNewCategory({ name: '', desc: '' })
      setShowCategoryForm(false)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteCategory = async (id) => {
    try {
      await categoryService.remove(id)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-zinc-400">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Panel de Admin</h1>
          <button
            onClick={() => showForm ? handleCancel() : setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
          >
            {showForm ? 'Cancelar' : '+ Nuevo producto'}
          </button>
        </div>

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

                {/* Formulario nueva categoría */}
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

                    {/* Lista de categorías existentes */}
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

      </div>
    </div>
  )
}

export default Admin