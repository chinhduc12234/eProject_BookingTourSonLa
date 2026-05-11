import axiosClient from "./axiosClient";

const BASE = "/admin/locations";

// ================= GET LOCATIONS =================

export const getLocations = ({
  page = 0,
  size = 6,
  keyword = "",
  districtId = "",
  provinceId = "",
  sortBy = "name",
  direction = "asc",
}) =>
  axiosClient.get(BASE, {
    params: {
      page,
      size,
      keyword,

      districtId:
        districtId || undefined,

      provinceId:
        provinceId || undefined,

      sortBy,
      direction,
    },
  });

// ================= CREATE =================

export const createLocation = (data) =>
  axiosClient.post(BASE, data);

// ================= UPDATE =================

export const updateLocation = (
  id,
  data
) =>
  axiosClient.put(
    `${BASE}/${id}`,
    data
  );

// ================= DELETE =================

export const deleteLocation = (id) =>
  axiosClient.delete(`${BASE}/${id}`);