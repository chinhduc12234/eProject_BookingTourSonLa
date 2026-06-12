import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Home, Loader2, Mail, Info, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

import { getBookingDetail } from "../../api/bookingApi";
import PublicLayout from "../public/PublicLayout";

export default function ThankYouPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        if (!bookingId) {
          toast.error("Không tìm thấy thông tin đặt tour");
          navigate("/");
          return;
        }

        const response = await getBookingDetail(bookingId);
        // Đảm bảo lấy đúng bọc dữ liệu từ axios response (thường là response.data hoặc response.data.data)
        const bookingData = response?.data?.data ? response.data.data : response?.data;
        setBooking(bookingData);
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            "Không thể tải thông tin booking"
        );
        console.error("Error loading booking:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId, navigate]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#020617]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#7FB77E]" />
            <p className="text-sm font-bold text-slate-400 tracking-wide animate-pulse">
              Đang tải dữ liệu đặt tour...
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Khai báo an toàn sau khi đã kết thúc trạng thái loading
  const isDeposit = booking?.paymentPlan === "DEPOSIT";
  
  return (
    <PublicLayout>
      <section className="bg-[#020617] py-16 sm:py-24 min-h-screen text-slate-100 selection:bg-[#7FB77E]/30">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          
          {/* Success Icon Section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[#7FB77E]/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-[#7FB77E] to-[#4f8f4d] rounded-full flex items-center justify-center shadow-lg shadow-[#7FB77E]/20">
                <CheckCircle2 size={52} className="text-[#020617] stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Title Headers */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Cảm ơn quý khách!
            </h1>
            <p className="text-lg text-slate-400 max-w-md mx-auto">
              Yêu cầu đặt tour của bạn đã thành công, chúng tôi sẽ liên hệ với bạn sớm.
            </p>
          </div>

          {/* Styled Information Cards */}
          <div className="grid gap-4 mb-8 sm:grid-cols-2">
            <div className="rounded-xl border border-[#7FB77E]/20 bg-gradient-to-br from-[#7FB77E]/10 to-transparent p-5 group transition-all duration-300 hover:border-[#7FB77E]/40">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-sm uppercase tracking-wider text-[#9de09c]">
                <Mail size={16} /> Hộp thư xác nhận
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Hóa đơn tạm tính và chi tiết đặt chỗ đã được hệ thống gửi tự động vào email đăng ký của bạn. Vui lòng kiểm tra kỹ cả mục thư rác (Spam).
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-5 group transition-all duration-300 hover:border-amber-500/40">
              <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-sm uppercase tracking-wider text-amber-400">
                <Info size={16} /> Quy trình xét duyệt
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Đơn hàng hiện tại giữ trạng thái chờ duyệt. Quản trị viên sẽ kiểm tra giao dịch chuyển khoản ngân hàng và gán nhân viên phụ trách chăm sóc đoàn sớm nhất.
              </p>
            </div>
          </div>

          {/* Action Button Links */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <button
              onClick={() => navigate("/tai-khoan/booking")}
              className="flex-1 text-center py-3.5 px-6 text-sm font-bold text-[#020617] bg-gradient-to-r from-[#7FB77E] to-[#6da36c] rounded-xl shadow-lg transition-all duration-300 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Xem lịch sử đặt tour
              <ArrowRight size={16} />
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex-1 text-center py-3.5 px-6 text-sm font-bold text-slate-300 bg-white/[0.04] border border-white/10 rounded-xl transition-all duration-300 hover:bg-white/[0.08] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Home size={16} />
              Quay về trang chủ
            </button>
          </div>

          {/* Stepper Timeline */}
          <div className="p-6 rounded-xl border border-white/[0.08] bg-slate-900/20 relative">
            <h3 className="font-bold text-white mb-4 text-base tracking-wide flex items-center gap-2">
              <span className="w-1 h-4 bg-[#7FB77E] rounded-full" />
              Các bước tiếp theo cần lưu ý
            </h3>
            
            <div className="relative border-l border-white/10 pl-5 ml-2.5 space-y-5 text-sm text-slate-300">
              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#7FB77E] text-[10px] font-bold text-[#020617]">
                  1
                </span>
                <p className="font-semibold text-white mb-0.5">Xác minh dòng tiền & Điều phối nhân sự</p>
                <p className="text-xs text-slate-400">Nhân viên tổng đài kiểm tra tài khoản và gọi điện thoại trực tiếp khớp thông tin lộ trình đón trả cho bạn.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-slate-300">
                  2
                </span>
                <p className="font-semibold text-white mb-0.5">Thanh toán khoản đối ứng còn lại</p>
                <p className="text-xs text-slate-400">
                  {isDeposit 
                    ? "Chuẩn bị nốt số tiền còn lại để gửi trực tiếp cho Hướng dẫn viên phụ trách vào ngày khởi hành đi tour."
                    : "Bạn đã tất toán toàn bộ chi phí đặt, không cần đóng thêm bất kỳ khoản phụ phí bắt buộc nào khác."}
                </p>
              </div>

              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[10px] font-bold text-slate-300">
                  3
                </span>
                <p className="font-semibold text-white mb-0.5">Nhận thông tin xe & Trưởng đoàn</p>
                <p className="text-xs text-slate-400">Trước ngày khởi hành 3 ngày, hệ thống gửi biển số xe, tên và số điện thoại Hướng dẫn viên qua SMS/Zalo của bạn.</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </PublicLayout>
  );
}
