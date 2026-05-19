import axiosClient from "./axiosClient";

const BASE = "/admin/tours";

export const getDeparturesByTour = (tourId) =>
  axiosClient.get(`${BASE}/${tourId}/departures`);

export const replaceDepartures = (tourId, data) =>
  axiosClient.put(`${BASE}/${tourId}/departures/replace`, data);