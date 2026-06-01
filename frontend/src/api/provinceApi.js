import axiosClient from "./axiosClient";

const BASE = "/admin/provinces";

// ================= GET PAGINATION =================

export const getProvinces = (
  pageOrParams = 0,
  size = 6
) => {
  const params =
    typeof pageOrParams === "object"
      ? {
          page: 0,
          size: 6,
          ...pageOrParams,
        }
      : {
          page: pageOrParams,
          size,
        };

  return axiosClient.get(BASE, {
    params,
  });
};

// ================= GET ALL =================

export const getAllProvinces = async () => {
  const res = await axiosClient.get(`${BASE}/all`);

  return {
    data: res.data,
  };
};

// ================= CREATE =================

export const createProvince = (data) =>
  axiosClient.post(BASE, data);

// ================= UPDATE =================

export const updateProvince = (id, data) =>
  axiosClient.put(`${BASE}/${id}`, data);

// ================= DELETE =================

export const deleteProvince = (id) =>
  axiosClient.delete(`${BASE}/${id}`);
