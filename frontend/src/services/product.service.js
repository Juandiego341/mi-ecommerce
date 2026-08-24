import api from "./api";

export const productService = {
    getAll: () => api.get('/product'),
    getOne: (id) => api.get(`/product/${id}`),
    create: (data) => api.post('/product', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/product/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    remove: (id) => api.delete(`/product/${id}`),
    importExcel: (file) => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post('/product/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }
};
export default productService;