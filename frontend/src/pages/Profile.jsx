import { useState, useEffect } from 'react'
import { userService } from '../services/user.service'

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [addingAddress, setAddingAddress] = useState(false)
  const [success, setSuccess] = useState(null)

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: ''
  })

  const [addressForm, setAddressForm] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: '',
    telephone: '',
    mobile: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profileRes, addressRes] = await Promise.all([
        userService.getProfile(),
        userService.getAddresses()
      ])
      setProfile(profileRes.data.user)
      setFormData(profileRes.data.user)
      setAddresses(addressRes.data.address)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      await userService.updateProfile(formData)
      setSuccess('Perfil actualizado correctamente')
      setEditing(false)
      fetchData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      await userService.addAddress(addressForm)
      setSuccess('Dirección agregada correctamente')
      setAddingAddress(false)
      setAddressForm({
        addressLine1: '', addressLine2: '', city: '',
        postalCode: '', country: '', telephone: '', mobile: ''
      })
      fetchData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteAddress = async (id) => {
    try {
      await userService.deleteAddress(id)
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-zinc-400">Cargando perfil...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg px-4 py-3">
            {success}
          </div>
        )}

        {/* Perfil */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-lg">Información personal</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="text-indigo-400 hover:text-indigo-300 text-sm transition"
            >
              {editing ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Apellido</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Usuario</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Guardar cambios
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-zinc-500 text-xs mb-1">Nombre</p>
                <p className="text-white">{profile?.firstName} {profile?.lastName}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Usuario</p>
                <p className="text-white">@{profile?.username}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs mb-1">Email</p>
                <p className="text-white">{profile?.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* Direcciones */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-bold text-lg">Mis direcciones</h2>
            <button
              onClick={() => setAddingAddress(!addingAddress)}
              className="text-indigo-400 hover:text-indigo-300 text-sm transition"
            >
              {addingAddress ? 'Cancelar' : '+ Agregar'}
            </button>
          </div>

          {addingAddress && (
            <form onSubmit={handleAddAddress} className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Dirección línea 1</label>
                  <input
                    type="text"
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Dirección línea 2</label>
                  <input
                    type="text"
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Ciudad</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Código postal</label>
                  <input
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">País</label>
                  <input
                    type="text"
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Teléfono</label>
                  <input
                    type="text"
                    value={addressForm.telephone}
                    onChange={(e) => setAddressForm({ ...addressForm, telephone: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1.5">Celular</label>
                  <input
                    type="text"
                    value={addressForm.mobile}
                    onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition"
              >
                Guardar dirección
              </button>
            </form>
          )}

          {addresses.length === 0 ? (
            <p className="text-zinc-500 text-sm">No tienes direcciones guardadas</p>
          ) : (
            <div className="space-y-4">
              {addresses.map(address => (
                <div
                  key={address.id}
                  className="bg-zinc-800 rounded-xl p-4 flex justify-between items-start"
                >
                  <div>
                    <p className="text-white text-sm">{address.addressLine1}</p>
                    {address.addressLine2 && (
                      <p className="text-zinc-400 text-sm">{address.addressLine2}</p>
                    )}
                    <p className="text-zinc-400 text-sm">{address.city}, {address.country} {address.postalCode}</p>
                    <p className="text-zinc-500 text-xs mt-1">{address.telephone} · {address.mobile}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-zinc-500 hover:text-red-400 text-sm transition ml-4"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Profile