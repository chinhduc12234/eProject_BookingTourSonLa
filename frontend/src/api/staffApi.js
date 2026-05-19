import axiosClient from "./axiosClient";

const BASE = "/users/admin/staff";

export const getAllStaff = (params) =>
  axiosClient.get(BASE, { params });

export const getStaffById = (id) =>
  axiosClient.get(`${BASE}/${id}`);

export const createStaff = (data) =>
  axiosClient.post(BASE, data);

export const updateStaff = (id, data) =>
  axiosClient.put(`${BASE}/${id}`, data);

export const deleteStaff = (id) =>
  axiosClient.delete(`${BASE}/${id}`);
