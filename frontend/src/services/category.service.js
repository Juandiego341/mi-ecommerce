import api from "./api"

export const categoryService = {
  getAll: () => api.get('/category'),
  create: (data)=> api.post('/category',data),
  remove: (id) => api.delete(`/category/${id}`)
}