import axiosClient from "./axiosClient";

export const getAdminStatistics = (params) =>
  axiosClient.get("/admin/statistics", { params });
