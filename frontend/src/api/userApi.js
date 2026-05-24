import axiosClient from "./axiosClient";

const BASE = "/users";

export const resolveUploadedFileUrl = (url) => {
  if (!url) return "";
  if (/^(https?:|blob:|data:)/i.test(url)) return url;

  const apiOrigin = axiosClient.defaults.baseURL.replace(/\/api\/?$/, "");
  return `${apiOrigin}${url.startsWith("/") ? url : `/${url}`}`;
};

export const getCurrentUserProfile = () =>
  axiosClient.get(`${BASE}/me`);

export const updateCurrentUserProfile = (data) =>
  axiosClient.put(`${BASE}/me`, data);

export const updateCurrentUserAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.post(`${BASE}/me/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
