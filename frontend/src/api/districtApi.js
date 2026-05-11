import axiosClient from "./axiosClient";

const BASE = "/admin/districts";

// ================= GET DISTRICTS =================

export const getDistricts = ({
  page = 0,
  size = 6,
  keyword = "",
  provinceId = "",
  sortBy = "name",
  direction = "asc",
}) =>
  axiosClient.get(BASE, {
    params: {
      page,
      size,
      keyword,
      provinceId:
        provinceId || undefined,
      sortBy,
      direction,
    },
  });

// ================= GET ALL =================

export const getAllDistricts = () =>
  axiosClient.get(`${BASE}/all`);

// ================= CREATE =================

export const createDistrict = (data) =>
  axiosClient.post(BASE, data);

// ================= UPDATE =================

export const updateDistrict = (
  id,
  data
) =>
  axiosClient.put(
    `${BASE}/${id}`,
    data
  );

// ================= DELETE =================

export const deleteDistrict = (id) =>
  axiosClient.delete(`${BASE}/${id}`);