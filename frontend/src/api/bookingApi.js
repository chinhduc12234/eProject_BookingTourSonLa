import axiosClient from "./axiosClient";

const BASE = "/bookings";

export const createBooking = (data) =>
  axiosClient.post(BASE, data);

export const getMyBookings = () =>
  axiosClient.get(`${BASE}/my`);

export const getBookingDetail = (id) =>
  axiosClient.get(`${BASE}/${id}`);

export const payBooking = (id, data = {}) =>
  axiosClient.post(`${BASE}/${id}/pay`, data);

export const cancelBooking = (id, data = {}) =>
  axiosClient.post(`${BASE}/${id}/cancel`, data);

export const getAdminBookings = (params) =>
  axiosClient.get("/admin/bookings", { params });

export const getAdminBookingDetail = (id) =>
  axiosClient.get(`/admin/bookings/${id}`);

export const updateAdminBooking = (id, data) =>
  axiosClient.put(`/admin/bookings/${id}`, data);

export const employeeApi = {
  getEmployeeBookings: async () => {
    return await axiosClient.get("/employee/bookings");
  },
  getDashboardStats: async () => {
    return await axiosClient.get("/employee/stats");
  },
  updateBookingStatus: async (bookingId, status) => {
    return await axiosClient.put(`/employee/bookings/${bookingId}/status`, null, {
      params: { status }
    });
  }
};
