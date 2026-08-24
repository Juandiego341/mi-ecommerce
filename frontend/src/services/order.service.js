    import api from "./api";

    export const orderService = {
        getOrders: () => api.get ('/order'),
        getOneOrder: (id) => api.get(`/order/${id}`),
       createOrder: (data) => api.post('/order', data),
       getAllOrdersAdmin: () => api.get('/order/admin'),
       updateFulfillment: (id, status) => api.patch(`/order/${id}/fulfillment`, { status })
    }

    export default orderService;