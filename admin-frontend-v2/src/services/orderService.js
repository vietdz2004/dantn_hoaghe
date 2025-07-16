import axios from "./api";

const orderService = {
  getAll: (params) => axios.get("/admin/orders", { params }),
  getById: (id) => axios.get(`/admin/orders/${id}`),
  update: (id, data) => axios.put(`/admin/orders/${id}`, data),
};

export default orderService; 