const DEFAULT_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";

export function getApiErrorMessage(error, fallback = DEFAULT_MESSAGE) {
  const responseData = error?.response?.data;
  const validationMessage = responseData?.errors
    ? Object.values(responseData.errors).find(Boolean)
    : null;

  if (validationMessage) return String(validationMessage);
  if (responseData?.message) return String(responseData.message);

  if (error?.code === "ECONNABORTED") {
    return "Máy chủ phản hồi quá lâu. Vui lòng kiểm tra kết nối và thử lại.";
  }

  if (!error?.response && error?.request) {
    return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.";
  }

  if (error?.response?.status >= 500) {
    return "Hệ thống đang tạm thời gián đoạn. Vui lòng thử lại sau ít phút.";
  }

  return fallback;
}

