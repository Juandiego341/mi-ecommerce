    import api from "./api";

    export const userService = {
        getProfile: () => api.get('/user/profile'),
        updateProfile: (data) => api.put('/user/profile',data),
        getAddresses: () => api.get('/user/address'),
        addAddress: (data) => api.post('/user/address',data),
        updateAddress: (id,data) => api.put(`/user/address/${id}`,data),
        deleteAddress: (id) => api.delete(`/user/address/${id}`)
    }