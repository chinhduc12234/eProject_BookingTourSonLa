import axiosClient from "./axiosClient";

const BASE = "/tours";

export const getPublicTours = (params) =>
  axiosClient.get(BASE, { params });

export const getPublicTourDetail = (id) =>
  axiosClient.get(`${BASE}/${id}/detail`);
