import api from "./api";

export const productService = {
    getAll: () => api.get('/product'),
    getOne: (id) => api.get(`/product/${id}`),
    create: (data) => api.post(`/product`,data),
    update: (id,data) => api.put(`/product/${id}`,data),
    remove: (id) => api.delete (`/product/${id}`)
};
export default productService;