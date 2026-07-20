// Map hiển thị cho trạng thái tour từ backend.
// Chỉ là lớp trình bày — không thay đổi giá trị enum gốc.
const TOUR_STATUS_DISPLAY = {
  OPEN: { label: "Đang mở bán", dotClass: "bg-[#7FB77E]" },
  DRAFT: { label: "Sắp mở bán", dotClass: "bg-[#f4c27a]" },
  CLOSED: { label: "Ngừng bán", dotClass: "bg-slate-400" },
  FULL: { label: "Hết chỗ", dotClass: "bg-[#f4c27a]" },
  CANCELLED: { label: "Đã hủy", dotClass: "bg-rose-400" },
  INACTIVE: { label: "Tạm dừng", dotClass: "bg-slate-400" },
};

export const getTourStatusDisplay = (status) =>
  TOUR_STATUS_DISPLAY[status] || {
    label: status || "Chưa rõ",
    dotClass: "bg-slate-400",
  };
