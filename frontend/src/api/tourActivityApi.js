import axiosClient from "./axiosClient";

const BASE = "/admin";

export const getActivities = (
  tourDayId
) =>
  axiosClient.get(
    `${BASE}/tour-days/${tourDayId}/activities`
  );

export const replaceActivities = (
  tourDayId,
  data
) =>
  axiosClient.put(
    `${BASE}/tour-days/${tourDayId}/activities/replace`,
    data
  );