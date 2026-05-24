import axiosClient from "./axiosClient";

const BASE = "/bookings";

export const createBooking = (data) =>
  axiosClient.post(BASE, data);

export const getMyBookings = () =>
  axiosClient.get(`${BASE}/my`);

export const getBookingDetail = (id) =>
  axiosClient.get(`${BASE}/${id}`);

export const getAdminBookings = (params) =>
  axiosClient.get("/admin/bookings", { params });

export const getAdminBookingDetail = (id) =>
  axiosClient.get(`/admin/bookings/${id}`);

export const updateAdminBooking = (id, data) =>
  axiosClient.put(`/admin/bookings/${id}`, data);
