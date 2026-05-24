import axiosClient from "./axiosClient";

const BASE = "/admin/tours";

export const getTours = (params) =>
  axiosClient.get(BASE, { params });

export const getTourById = (id) =>
  axiosClient.get(`${BASE}/${id}`);

export const getTourDetail = (id) =>
  axiosClient.get(`${BASE}/${id}/detail`);

export const createTour = (data) =>
  axiosClient.post(BASE, data);

export const uploadTourThumbnail = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.post(`${BASE}/thumbnail`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateTour = (id, data) =>
  axiosClient.put(`${BASE}/${id}`, data);

export const replaceTourImages = (
  id,
  data
) =>
  axiosClient.put(
    `${BASE}/${id}/images`,
    data
  );

export const deleteTour = (id) =>
  axiosClient.delete(`${BASE}/${id}`);
