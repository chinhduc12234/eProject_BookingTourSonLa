import axiosClient from "./axiosClient";

const BASE = "/admin/provinces";

// ================= GET PAGINATION =================

export const getProvinces = (
  page = 0,
  size = 6
) =>
  axiosClient.get(BASE, {
    params: {
      page,
      size,
    },
  });

// ================= GET ALL =================

export const getAllProvinces = async () => {
  const res = await axiosClient.get(BASE, {
    params: {
      page: 0,
      size: 999,
    },
  });

  return {
    data: res.data.content,
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