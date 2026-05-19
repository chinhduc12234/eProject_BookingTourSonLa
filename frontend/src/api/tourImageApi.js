import axiosClient from "./axiosClient";

const BASE = "/admin/tours";

export const getTourImages = (tourId) =>
  axiosClient.get(`${BASE}/${tourId}/images`);

export const replaceTourImages = (
  tourId,
  data
) =>
  axiosClient.put(
    `${BASE}/${tourId}/images`,
    data
  );

export const deleteTourImage = (
  tourId,
  imageId
) =>
  axiosClient.delete(
    `${BASE}/${tourId}/images/${imageId}`
  );

export const setTourThumbnail = (
  tourId,
  imageId
) =>
  axiosClient.put(
    `${BASE}/${tourId}/images/${imageId}/thumbnail`
  );