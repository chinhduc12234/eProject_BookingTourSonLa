import axiosClient from "./axiosClient";

const BASE = "/admin/tours";

export const getTourDays = (tourId) =>
  axiosClient.get(`${BASE}/${tourId}/days`);

export const replaceTourDays = (
  tourId,
  data
) =>
  axiosClient.put(
    `${BASE}/${tourId}/days/replace`,
    data
  );