import axiosClient from "./axiosClient";

const BASE = "/bookings";

export const createBooking = (data) =>
  axiosClient.post(BASE, data);

export const getMyBookings = () =>
  axiosClient.get(`${BASE}/my`);

export const getBookingDetail = (id) =>
  axiosClient.get(`${BASE}/${id}`);

export const resendBookingConfirmation = (id) =>
  axiosClient.post(`${BASE}/${id}/resend-confirmation-email`);

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

export const getAdminGroupTours = (params) =>
  axiosClient.get("/admin/group-tours", { params });

export const getAdminGroupTourDetail = (departureId) =>
  axiosClient.get(`/admin/group-tours/${departureId}`);

export const getAdminGroupTourTracking = (departureId) =>
  axiosClient.get(`/admin/group-tours/${departureId}/tracking`);

export const assignAdminGroupTourStaff = (departureId, employeeId) =>
  axiosClient.put(`/admin/group-tours/${departureId}/staff`, { employeeId });

export const confirmAdminGroupTour = (departureId) =>
  axiosClient.post(`/admin/group-tours/${departureId}/confirm`);

export const employeeApi = {
  getEmployeeBookings: async () => {
    return await axiosClient.get("/employee/bookings");
  },
  getEmployeeBookingDetail: async (bookingId) => {
    return await axiosClient.get(`/employee/bookings/${bookingId}`);
  },
  getDashboardStats: async () => {
    return await axiosClient.get("/employee/stats");
  },
  updateScheduleActivity: async (bookingId, activityId, data) => {
    return await axiosClient.put(
      `/employee/bookings/${bookingId}/schedule-activities/${activityId}`,
      data,
    );
  },
  uploadScheduleActivityReportImage: async (bookingId, activityId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return await axiosClient.post(
      `/employee/bookings/${bookingId}/schedule-activities/${activityId}/report-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },
  updateBookingStatus: async (bookingId, status) => {
    return await axiosClient.put(`/employee/bookings/${bookingId}/status`, null, {
      params: { status }
    });
  },
  completeBooking: async (bookingId) => {
    return await axiosClient.put(`/employee/bookings/${bookingId}/complete`);
  }
};
