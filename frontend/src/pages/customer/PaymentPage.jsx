import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Send,
  QrCode,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  CreditCard
} from "lucide-react";
import toast from "react-hot-toast";

import { createBooking, payBooking } from "../../api/bookingApi";
import { getPublicTourDetail } from "../../api/publicTourApi";
import { resolveUploadedFileUrl } from "../../api/userApi";
import PublicLayout from "../public/PublicLayout";

const VIETQR_CONFIG = {
  BANK_ID: "MB",
  ACCOUNT_NO: "0123456789",
  ACCOUNT_NAME: "CONG TY DU LICH SON LA",
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

const formatDate = (value) => {
  if (!value) return "Chưa có lịch";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

export default function PaymentPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tourData, setTourData] = useState(null);
  const [departureData, setDepartureData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("full");

  // Sử dụng useRef để lưu cờ điều hướng, giữ nguyên giá trị khi component re-render
  const hasRedirected = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      // Nếu đã có lệnh điều hướng đang chờ xử lý, không chạy tiếp logic
      if (hasRedirected.current) return;

      try {
        console.log("PaymentPage - Loading data from localStorage");

        const tempDeparture = localStorage.getItem("booking_temp_departure");
        const tempComplete = localStorage.getItem("booking_temp_complete");

        if (!tempDeparture || !tempComplete) {
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            toast.error("Không tìm thấy thông tin đặt tour hợp lệ");
            setTimeout(() => { if (isMounted) navigate("/"); }, 1500);
          }
          return;
        }

        let departure, complete;
        try {
          departure = JSON.parse(tempDeparture);
          complete = JSON.parse(tempComplete);
        } catch (parseError) {
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            toast.error("Dữ liệu không hợp lệ, vui lòng thử lại");
            setTimeout(() => { if (isMounted) navigate("/"); }, 1500);
          }
          return;
        }

        if (!departure.tourId) {
          if (!hasRedirected.current) {
            hasRedirected.current = true;
            toast.error("Không tìm thấy thông tin tour");
            setTimeout(() => { if (isMounted) navigate("/"); }, 1500);
          }
          return;
        }

        if (isMounted) {
          setDepartureData(departure);
          setBookingData(complete);
        }

        try {
          const tourResponse = await getPublicTourDetail(departure.tourId);
          if (isMounted) {
            setTourData(tourResponse.data);
            setLoading(false);
          }
        } catch (apiError) {
          console.error("PaymentPage - Error fetching tour details:", apiError);
          if (isMounted && !hasRedirected.current) {
            hasRedirected.current = true;
            toast.error("Không thể tải thông tin tour");
            setTimeout(() => { if (isMounted) navigate("/"); }, 1500);
          }
        }
      } catch (error) {
        console.error("PaymentPage - Unexpected error:", error);
        if (isMounted && !hasRedirected.current) {
          hasRedirected.current = true;
          toast.error("Không thể tải trang thanh toán");
          setTimeout(() => { if (isMounted) navigate("/"); }, 1500);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [navigate]); // navigate của react-router-dom có tham chiếu ổn định, không gây loop

  const handleConfirmBooking = async () => {
    try {
      setSubmitting(true);

      if (!bookingData || !departureData) {
        toast.error("Thiếu thông tin đặt tour");
        return;
      }

      const { tourId, ...bookingPayload } = bookingData;

      const bookingResponse = await createBooking(bookingPayload);
      const bookingId = bookingResponse.data.id;

      await payBooking(bookingId, {
        paymentType: paymentMethod === "full" ? "FULL" : "DEPOSIT",
        remainingPaymentMethod: "CASH_ON_DEPARTURE",
      });

      localStorage.removeItem("booking_temp_departure");
      localStorage.removeItem("booking_temp_form");
      localStorage.removeItem("booking_temp_complete");

      toast.success("Đặt tour và ghi nhận thanh toán thành công!");
      navigate(`/thank-you?bookingId=${bookingId}`);
    } catch (error) {
      console.error("Booking Error:", error);
      toast.error(
        error?.response?.data?.message || "Không thể xác nhận đặt tour"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#020617]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#7FB77E]" />
            <p className="text-sm font-bold text-slate-300">
              Đang tải trang thanh toán...
            </p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!tourData || !bookingData || !departureData) {
    return (
      <PublicLayout>
        <div className="bg-[#020617] px-4 py-24 text-center text-slate-300">
          Không tìm thấy thông tin đặt tour. Vui lòng quay lại và thử lại.
        </div>
      </PublicLayout>
    );
  }

  const { tour, images = [] } = tourData;
  const coverImage = resolveUploadedFileUrl(tour.thumbnail || images[0]?.imageUrl);

  const adultPrice = departureData.adultPrice || tour.price || 0;
  const childPrice = departureData.childPrice || Math.floor(adultPrice * 0.7);

  const adultCount = Number(bookingData.adultCount || 0);
  const childCount = Number(bookingData.childCount || 0);

  const totalAdultPrice = adultCount * adultPrice;
  const totalChildPrice = childCount * childPrice;
  const totalPrice = totalAdultPrice + totalChildPrice;
  const depositPrice = Math.floor(totalPrice * 0.3);

  const currentPaymentAmount = paymentMethod === "full" ? totalPrice : depositPrice;

  const transferDesc = `TOUR ${bookingData.phone || ""} ${bookingData.fullName || ""}`
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .substring(0, 25);

  const vietQrImageUrl = `https://img.vietqr.io/image/${VIETQR_CONFIG.BANK_ID}-${VIETQR_CONFIG.ACCOUNT_NO}-qr_only.png?amount=${currentPaymentAmount}&addInfo=${encodeURIComponent(transferDesc)}&accountName=${encodeURIComponent(VIETQR_CONFIG.ACCOUNT_NAME)}`;

  return (
    <PublicLayout>
      <section className="bg-[#020617] py-10 sm:py-14 text-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 hover:bg-white/5 transition"
          >
            <ArrowLeft size={17} />
            Quay lại chỉnh sửa
          </button>

          <h1 className="mt-6 text-3xl font-black text-white sm:text-4xl">
            Xác nhận thông tin & Thanh toán
          </h1>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            {/* CỘT 1: TÓM TẮT ĐƠN HÀNG VÀ CHI TIẾT GIÁ TOUR */}
            <div className="lg:col-span-1 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5">
                {coverImage && (
                  <img
                    src={coverImage}
                    alt={tour.title}
                    className="w-full h-44 object-cover rounded-xl mb-4 border border-white/10"
                  />
                )}
                <span className="inline-block rounded bg-[#7FB77E]/20 px-2 py-0.5 text-xs font-bold text-[#9de09c] mb-2">
                  Mã Tour: #{tour.id}
                </span>
                <h2 className="text-lg font-black text-white leading-snug">{tour.title}</h2>

                <div className="mt-4 space-y-3 border-t border-white/10 pt-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-slate-400 mt-0.5" />
                    <div className="flex justify-between w-full">
                      <span className="text-slate-400">Ngày khởi hành:</span>
                      <span className="font-bold text-white">{formatDate(departureData.departureDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Users size={16} className="text-slate-400 mt-0.5" />
                    <div className="w-full">
                      <span className="text-slate-400 block mb-1">Chi tiết số lượng & giá gốc:</span>
                      <div className="bg-white/[0.03] p-2 rounded-lg space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Người lớn ({adultCount}x):</span>
                          <span className="text-slate-300">{formatCurrency(adultPrice)}</span>
                        </div>
                        {childCount > 0 && (
                          <div className="flex justify-between">
                            <span>Trẻ em ({childCount}x):</span>
                            <span className="text-slate-300">{formatCurrency(childPrice)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-3 mt-3 space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Tạm tính người lớn:</span>
                      <span>{formatCurrency(totalAdultPrice)}</span>
                    </div>
                    {childCount > 0 && (
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Tạm tính trẻ em:</span>
                        <span>{formatCurrency(totalChildPrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm border-t border-dashed border-white/10 pt-2 mt-2">
                      <span className="text-slate-300 font-medium">Tổng chi phí tour:</span>
                      <span className="font-black text-[#d4a878] text-xl">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT 2 & 3: THÔNG TIN KHÁCH HÀNG & PHƯƠNG THỨC QUÉT QR */}
            <div className="lg:col-span-2 space-y-5">
              {/* CHI TIẾT THÔNG TIN NGƯỜI ĐẶT & HÀNH KHÁCH */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5">
                <h3 className="text-base font-black text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                  <User size={18} className="text-[#7FB77E]" />
                  Thông tin liên hệ & Danh sách hành khách
                </h3>

                <div className="grid gap-4 sm:grid-cols-3 bg-white/[0.02] p-4 rounded-xl border border-white/5 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User size={15} className="text-slate-400" />
                    <div>
                      <span className="text-xs text-slate-400 block">Người đặt:</span>
                      <span className="font-bold text-white">{bookingData.fullName}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={15} className="text-slate-400" />
                    <div>
                      <span className="text-xs text-slate-400 block">Email nhận vé:</span>
                      <span className="font-bold text-white truncate max-w-[180px] block">{bookingData.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={15} className="text-slate-400" />
                    <div>
                      <span className="text-xs text-slate-400 block">Số điện thoại:</span>
                      <span className="font-bold text-white">{bookingData.phone}</span>
                    </div>
                  </div>
                </div>

                {bookingData.customerRequests && bookingData.customerRequests.length > 0 ? (
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Danh sách thành viên đoàn:
                    </span>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {bookingData.customerRequests.map((customer, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white/[0.03] px-3 py-2 rounded-lg text-xs border border-white/5">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-slate-300 font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-white">{customer.fullName}</span>
                          </div>
                          <div className="flex gap-4 text-slate-400">
                            <span>Giới tính: <strong className="text-slate-200">{customer.gender === "MALE" ? "Nam" : customer.gender === "FEMALE" ? "Nữ" : "Khác"}</strong></span>
                            <span>Loại vé: <strong className="text-[#d4a878]">{customer.customerType === "ADULT" ? "Người lớn" : "Trẻ em"}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    * Đăng ký hình thức: {bookingData.bookingType === 'INDIVIDUAL' ? 'Cá nhân tự quản lý vé lẻ' : 'Đăng ký theo đoàn.'}
                  </p>
                )}
              </div>

              {/* TÍCH HỢP VIETQR & PHƯƠNG THỨC THANH TOÁN */}
              <div className="rounded-2xl border border-[#7FB77E]/30 bg-gradient-to-br from-[#7FB77E]/10 via-[#020617]/40 to-[#A67C52]/10 p-5">
                <h3 className="text-base font-black text-white mb-4 flex items-center gap-2">
                  <QrCode size={20} className="text-[#9de09c]" />
                  Cổng thanh toán tự động VietQR (Napas)
                </h3>

                <div className="grid gap-6 md:grid-cols-5 items-center">
                  <div className="md:col-span-2 flex flex-col items-center p-4 bg-white rounded-xl shadow-lg border border-white/10">
                    <div className="bg-white p-2 rounded-lg">
                      <img
                        src={vietQrImageUrl}
                        alt="VietQR Payment Code"
                        className="w-44 h-44 object-contain transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-center mt-2 text-[#020617]">
                      <p className="text-xs font-black tracking-tight">{VIETQR_CONFIG.BANK_ID} - {VIETQR_CONFIG.ACCOUNT_NO}</p>
                      <p className="text-[10px] uppercase font-bold text-slate-500">{VIETQR_CONFIG.ACCOUNT_NAME}</p>
                    </div>
                  </div>

                  <div className="md:col-span-3 space-y-3">
                    <span className="text-xs font-bold text-slate-300 block">Bước 1: Chọn hạn mức chuyển khoản</span>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${paymentMethod === "full" ? "border-[#7FB77E] bg-[#7FB77E]/10" : "border-white/10 hover:bg-white/5"}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="full"
                        checked={paymentMethod === "full"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 accent-[#7FB77E]"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">Thanh toán toàn bộ (100%)</p>
                        <p className="text-xs text-[#9de09c] font-medium">{formatCurrency(totalPrice)}</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${paymentMethod === "deposit" ? "border-[#7FB77E] bg-[#7FB77E]/10" : "border-white/10 hover:bg-white/5"}`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="deposit"
                        checked={paymentMethod === "deposit"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 accent-[#7FB77E]"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">Thanh toán đặt cọc giữ chỗ (30%)</p>
                        <p className="text-xs text-[#d4a878] font-medium">
                          {formatCurrency(depositPrice)} <span className="text-slate-400 font-normal">(Thu {formatCurrency(totalPrice - depositPrice)} khi khởi hành)</span>
                        </p>
                      </div>
                    </label>

                    <div className="bg-white/[0.04] p-3 rounded-lg border border-white/5 space-y-1.5 text-xs text-slate-300">
                      <p className="font-bold text-white flex items-center gap-1">
                        <CreditCard size={13} className="text-[#d4a878]" /> Bước 2: Kiểm tra nội dung chuyển khoản tự động
                      </p>
                      <p>Hệ thống tự điền nội dung: <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold text-xs">{transferDesc}</span></p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-lg bg-[#7FB77E]/10 border border-[#7FB77E]/30 p-3 text-xs text-slate-300 flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-[#9de09c] shrink-0 mt-0.5" />
                  <p>
                    <strong>Hướng dẫn:</strong> Mở ứng dụng ngân hàng của bạn, chọn chức năng <strong>Quét mã QR</strong> để tự động điền thông tin tài khoản, số tiền <strong>{formatCurrency(currentPaymentAmount)}</strong> và nội dung mà không cần nhập tay.
                  </p>
                </div>
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={submitting}
                className="w-full bg-[#7FB77E] hover:bg-[#6ca36b] text-slate-900 font-black py-4 rounded-xl text-base transition flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-[#7FB77E]/10"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang xử lý tạo đơn và đồng bộ thanh toán...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Xác nhận đã chuyển khoản & Đặt tour
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}