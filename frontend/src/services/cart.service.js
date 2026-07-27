    import api from "./api";

    export const cartService = {
        getCart: () => api.get ('/cart'),
        addItem: (data) => api.post('/cart/items',data),
        updateItem: (data,id) => api.put(`/cart/items/${id}`,data),
        removeItem: (id) => api.delete(`/cart/items/${id}`),
        clearCart: () => api.delete('/cart')
    }

    export default cartService;