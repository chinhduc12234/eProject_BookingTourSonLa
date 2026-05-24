import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Loader2,
  Plus,
  Send,
  Trash2,
  UserRound,
} from "lucide-react";

import { createBooking } from "../api/bookingApi";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyCustomer = {
  customerType: "ADULT",
  fullName: "",
  phone: "",
  email: "",
  identityNumber: "",
  healthNote: "",
};

export default function BookingForm({
  tour,
  selectedDeparture,
  selectedDepartureId,
  userProfile,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    fullName: userProfile?.fullName || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    pickupAddress: userProfile?.address || "",
    adultCount: 1,
    childCount: 0,
    note: "",
    specialRequest: "",
  });

  const priceInfo = useMemo(() => {
    const adultPrice = selectedDeparture?.adultPrice ?? tour?.price ?? 0;
    const childPrice = selectedDeparture?.childPrice ?? adultPrice;
    const adultCount = Number(form.adultCount || 0);
    const childCount = Number(form.childCount || 0);

    return {
      adultPrice,
      childPrice,
      totalPeople: adultCount + childCount,
      totalPrice: adultPrice * adultCount + childPrice * childCount,
    };
  }, [form.adultCount, form.childCount, selectedDeparture, tour]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateCustomer = (index, field, value) => {
    setCustomers((current) =>
      current.map((customer, currentIndex) =>
        currentIndex === index
          ? {
              ...customer,
              [field]: value,
            }
          : customer,
      ),
    );
  };

  const validate = () => {
    const nextErrors = {};
    const availableSeats = Number(selectedDeparture?.availableSeats || 0);

    if (!selectedDepartureId) {
      nextErrors.departureId = "Vui lòng chọn lịch khởi hành";
    }

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ tên";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Vui lòng nhập email";
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = "Email không đúng định dạng";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Vui lòng nhập số điện thoại";
    }

    if (priceInfo.totalPeople <= 0) {
      nextErrors.people = "Số khách phải lớn hơn 0";
    }

    if (selectedDeparture && priceInfo.totalPeople > availableSeats) {
      nextErrors.people = `Lịch này chỉ còn ${availableSeats} chỗ`;
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        departureId: Number(selectedDepartureId),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        pickupAddress: form.pickupAddress.trim(),
        adultCount: Number(form.adultCount || 0),
        childCount: Number(form.childCount || 0),
        note: form.note.trim(),
        specialRequest: form.specialRequest.trim(),
        customers: customers
          .filter((customer) => customer.fullName.trim())
          .map((customer) => ({
            ...customer,
            fullName: customer.fullName.trim(),
            phone: customer.phone.trim(),
            email: customer.email.trim(),
            identityNumber: customer.identityNumber.trim(),
            healthNote: customer.healthNote.trim(),
          })),
      };

      const response = await createBooking(payload);

      toast.success("Đặt tour thành công");

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Không thể tạo booking, vui lòng kiểm tra lại thông tin",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "field-input";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#9de09c] to-[#4f8f4d] text-[#020617] shadow-soft-green">
          <UserRound size={20} />
        </span>
        <div>
          <h2 className="text-lg font-black text-white">Thông tin đặt tour</h2>
          <p className="text-xs text-slate-400">
            Đã tự điền từ tài khoản khách hàng
          </p>
        </div>
      </div>

      {errors.departureId && (
        <div className="mt-4 rounded-xl border border-rose-300/30 bg-rose-300/10 p-3 text-sm font-bold text-rose-100">
          {errors.departureId}
        </div>
      )}

      <div className="mt-5 grid gap-4">
        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
            Họ tên
          </label>
          <input
            value={form.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            className={inputClass}
            placeholder="Nguyễn Văn A"
          />
          {errors.fullName && (
            <p className="mt-2 text-sm text-rose-200">{errors.fullName}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className={inputClass}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-rose-200">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
              Số điện thoại
            </label>
            <input
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className={inputClass}
              placeholder="09xx xxx xxx"
            />
            {errors.phone && (
              <p className="mt-2 text-sm text-rose-200">{errors.phone}</p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
            Địa chỉ đón
          </label>
          <input
            value={form.pickupAddress}
            onChange={(event) => updateField("pickupAddress", event.target.value)}
            className={inputClass}
            placeholder="Địa chỉ đón khách"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
              Người lớn
            </label>
            <input
              type="number"
              min="0"
              value={form.adultCount}
              onChange={(event) => updateField("adultCount", event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
              Trẻ em
            </label>
            <input
              type="number"
              min="0"
              value={form.childCount}
              onChange={(event) => updateField("childCount", event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {errors.people && (
          <div className="rounded-xl border border-rose-300/30 bg-rose-300/10 p-3 text-sm font-bold text-rose-100">
            {errors.people}
          </div>
        )}

        <div className="relative overflow-hidden rounded-2xl border border-[#7FB77E]/30 bg-gradient-to-br from-[#7FB77E]/15 via-[#020617]/40 to-[#A67C52]/15 p-5">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#7FB77E]/20 blur-2xl" />
          <div className="relative flex items-center justify-between text-sm text-slate-300">
            <span>Người lớn × {form.adultCount}</span>
            <span className="font-bold text-white">
              {formatCurrency(priceInfo.adultPrice)}
            </span>
          </div>
          <div className="relative mt-2 flex items-center justify-between text-sm text-slate-300">
            <span>Trẻ em × {form.childCount}</span>
            <span className="font-bold text-white">
              {formatCurrency(priceInfo.childPrice)}
            </span>
          </div>
          <div className="relative mt-4 flex items-center justify-between border-t border-white/15 pt-4">
            <span className="font-black text-white">
              {priceInfo.totalPeople} khách
            </span>
            <span className="text-2xl font-black text-gradient-gold">
              {formatCurrency(priceInfo.totalPrice)}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
            Ghi chú
          </label>
          <textarea
            rows={3}
            value={form.note}
            onChange={(event) => updateField("note", event.target.value)}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-[#7FB77E] focus:bg-[#7FB77E]/10 focus:ring-4 focus:ring-[#7FB77E]/15"
            placeholder="Ghi chú thêm cho điều hành tour..."
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
            Yêu cầu đặc biệt
          </label>
          <textarea
            rows={3}
            value={form.specialRequest}
            onChange={(event) => updateField("specialRequest", event.target.value)}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition focus:border-[#7FB77E] focus:bg-[#7FB77E]/10 focus:ring-4 focus:ring-[#7FB77E]/15"
            placeholder="Ăn chay, dị ứng, yêu cầu phòng..."
          />
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-black text-white">Khách đi cùng</h3>
            <button
              type="button"
              onClick={() =>
                setCustomers((current) => [...current, { ...emptyCustomer }])
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/[0.08] px-3 text-sm font-bold text-white transition hover:bg-[#7FB77E]/15 hover:text-[#9de09c]"
            >
              <Plus size={17} />
              Thêm
            </button>
          </div>

          {customers.length > 0 && (
            <div className="mt-4 grid gap-4">
              {customers.map((customer, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#7FB77E]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#9de09c]">
                      Khách {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setCustomers((current) =>
                          current.filter((_, currentIndex) => currentIndex !== index),
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-400/15 text-rose-100 transition hover:bg-rose-400/25"
                      aria-label="Xóa khách đi cùng"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <select
                      value={customer.customerType}
                      onChange={(event) =>
                        updateCustomer(index, "customerType", event.target.value)
                      }
                      className="h-11 rounded-xl border border-white/10 bg-[#102019] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                    >
                      <option value="ADULT">Người lớn</option>
                      <option value="CHILD">Trẻ em</option>
                      <option value="INFANT">Em bé</option>
                    </select>

                    <input
                      value={customer.fullName}
                      onChange={(event) =>
                        updateCustomer(index, "fullName", event.target.value)
                      }
                      placeholder="Họ tên"
                      className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                    />

                    <input
                      value={customer.phone}
                      onChange={(event) =>
                        updateCustomer(index, "phone", event.target.value)
                      }
                      placeholder="Số điện thoại"
                      className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                    />

                    <input
                      value={customer.email}
                      onChange={(event) =>
                        updateCustomer(index, "email", event.target.value)
                      }
                      placeholder="Email"
                      className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                    />

                    <input
                      value={customer.identityNumber}
                      onChange={(event) =>
                        updateCustomer(index, "identityNumber", event.target.value)
                      }
                      placeholder="CCCD/Hộ chiếu"
                      className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                    />

                    <input
                      value={customer.healthNote}
                      onChange={(event) =>
                        updateCustomer(index, "healthNote", event.target.value)
                      }
                      placeholder="Ghi chú sức khỏe"
                      className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary mt-2 w-full text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
          {submitting ? "Đang xử lý..." : "Đặt tour ngay"}
        </button>
      </div>
    </form>
  );
}
