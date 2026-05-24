import axiosClient from "./axiosClient";

const BASE = "/bookings";

export const createBooking = (data) =>
  axiosClient.post(BASE, data);

export const getMyBookings = () =>
  axiosClient.get(`${BASE}/my`);

export const getBookingDetail = (id) =>
  axiosClient.get(`${BASE}/${id}`);

export const getCurrentUserProfile = () =>
  axiosClient.get("/users/me");
