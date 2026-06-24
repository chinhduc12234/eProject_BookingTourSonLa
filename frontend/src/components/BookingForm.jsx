import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Building2,
  CheckCircle2,
  ClipboardList,
  ContactRound,
  Loader2,
  Send,
  UserRound,
  UsersRound,
} from "lucide-react";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("vi-VN") + " đ";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyCustomer = {
  customerType: "ADULT",
  fullName: "",
  gender: "OTHER",
  dateOfBirth: "",
  phone: "",
  email: "",
  identityNumber: "",
  address: "",
  emergencyContact: "",
  healthNote: "",
};

const bookingTypes = [
  { value: "INDIVIDUAL", label: "Cá nhân" },
  { value: "GROUP", label: "Theo đoàn" },
  { value: "PRIVATE", label: "Tour riêng" },
];

const genderOptions = [
  { value: "OTHER", label: "Khác" },
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
];

const childTypeOptions = [
  { value: "CHILD", label: "Trẻ em" },
  { value: "INFANT", label: "Em bé" },
];

const customerTypeLabel = {
  ADULT: "Người lớn",
  CHILD: "Trẻ em",
  INFANT: "Em bé",
};

const requiresIdentityDocument = (customerType) => customerType === "ADULT";

const cleanText = (value) => {
  const text = String(value || "").trim();
  return text || null;
};

const toNumber = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
};

const formStepItems = [
  { label: "Hình thức đặt", description: "Cá nhân, nhóm hoặc tour riêng" },
  { label: "Liên hệ", description: "Thông tin trưởng đoàn và điểm đón" },
  { label: "Hành khách", description: "Số lượng và hồ sơ người đi cùng" },
  { label: "Xác nhận", description: "Ghi chú, tổng tiền và chuyển thanh toán" },
];

const getBookingFormStorageKey = (userProfile, tourId) => {
  const accountKey = userProfile?.id || userProfile?.email || "anonymous";
  return `booking_temp_form:${accountKey}:${tourId || "tour"}`;
};

const readStoredBookingState = (userProfile, tourId) => {
  const defaultForm = {
    bookingType: "INDIVIDUAL",
    organizationName: "",
    contactPerson: "",
    fullName: userProfile?.fullName || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    pickupAddress: userProfile?.address || "",
    adultCount: 1,
    childCount: 0,
    note: "",
    specialRequest: "",
  };

  try {
    const storageKey = getBookingFormStorageKey(userProfile, tourId);
    const savedForm = localStorage.getItem(storageKey);
    if (!savedForm) return { form: defaultForm, customerDrafts: {} };

    const tempForm = JSON.parse(savedForm);
    const customerDrafts = {};

    if (Array.isArray(tempForm.customers)) {
      tempForm.customers.forEach((customer, index) => {
        const slotKey = customer.slotKey || `customer-${index}`;
        customerDrafts[slotKey] = customer;
      });
    }

    return {
      form: {
        ...defaultForm,
        bookingType: tempForm.bookingType || defaultForm.bookingType,
        organizationName:
          tempForm.organizationName || defaultForm.organizationName,
        contactPerson: tempForm.contactPerson || defaultForm.contactPerson,
        fullName: tempForm.fullName || defaultForm.fullName,
        email: defaultForm.email,
        phone: tempForm.phone || defaultForm.phone,
        pickupAddress: tempForm.pickupAddress || defaultForm.pickupAddress,
        adultCount: tempForm.adultCount || defaultForm.adultCount,
        childCount: tempForm.childCount || defaultForm.childCount,
        note: tempForm.note || defaultForm.note,
        specialRequest: tempForm.specialRequest || defaultForm.specialRequest,
      },
      customerDrafts,
    };
  } catch (error) {
    console.error("Không thể khôi phục biểu mẫu đặt tour:", error);
    return { form: defaultForm, customerDrafts: {} };
  }
};

export default function BookingForm({
  tour,
  tourId,
  selectedDeparture,
  selectedDepartureId,
  userProfile,
  onDraftReady,
}) {
  const navigate = useNavigate();
  const bookingFormStorageKey = getBookingFormStorageKey(userProfile, tourId);
  const [initialBookingState] = useState(() =>
    readStoredBookingState(userProfile, tourId),
  );
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [customerDrafts, setCustomerDrafts] = useState(
    initialBookingState.customerDrafts,
  );
  const [currentFormStep, setCurrentFormStep] = useState(0);
  const [form, setForm] = useState(initialBookingState.form);

  // Auto-save form data to localStorage whenever it changes
  useEffect(() => {
    const tempForm = {
      bookingType: form.bookingType,
      organizationName: form.organizationName,
      contactPerson: form.contactPerson,
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      pickupAddress: form.pickupAddress,
      adultCount: form.adultCount,
      childCount: form.childCount,
      note: form.note,
      specialRequest: form.specialRequest,
      customers: Object.entries(customerDrafts).map(([slotKey, customer]) => ({
        ...customer,
        slotKey,
      })),
    };
    localStorage.setItem(bookingFormStorageKey, JSON.stringify(tempForm));
    localStorage.removeItem("booking_temp_form");
  }, [bookingFormStorageKey, form, customerDrafts]);

  const adultCount = toNumber(form.adultCount);
  const childCount = toNumber(form.childCount);
  const adultCompanionCount = Math.max(0, adultCount - 1);
  const companionCount = adultCompanionCount + Math.max(0, childCount);
  const requiresOrganization =
    form.bookingType === "GROUP" || form.bookingType === "PRIVATE";

  const customers = useMemo(() => {
    const adultCustomers = Array.from(
      { length: adultCompanionCount },
      (_, index) => {
        const slotKey = `adult-${index}`;

        return {
          ...emptyCustomer,
          ...customerDrafts[slotKey],
          customerType: "ADULT",
          slotKey,
        };
      },
    );

    const childCustomers = Array.from(
      { length: Math.max(0, childCount) },
      (_, index) => {
        const slotKey = `child-${index}`;
        const draft = customerDrafts[slotKey];

        return {
          ...emptyCustomer,
          ...draft,
          customerType: draft?.customerType === "INFANT" ? "INFANT" : "CHILD",
          slotKey,
        };
      },
    );

    return [...adultCustomers, ...childCustomers];
  }, [adultCompanionCount, childCount, customerDrafts]);

  const priceInfo = useMemo(() => {
    const adultPrice = selectedDeparture?.adultPrice ?? tour?.price ?? 0;
    const childPrice = selectedDeparture?.childPrice ?? adultPrice;

    return {
      adultPrice,
      childPrice,
      totalPeople: adultCount + childCount,
      totalPrice: adultPrice * adultCount + childPrice * childCount,
    };
  }, [adultCount, childCount, selectedDeparture, tour]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateCustomer = (slotKey, field, value) => {
    setCustomerDrafts((current) => ({
      ...current,
      [slotKey]: {
        ...current[slotKey],
        [field]: value,
        ...(field === "customerType" && value !== "ADULT"
          ? { identityNumber: "" }
          : {}),
      },
    }));
  };

  const jumpToFormStep = (index) => {
    setCurrentFormStep(index);

    window.requestAnimationFrame(() => {
      const target = document.getElementById(`booking-form-step-${index}`);
      if (!target) return;

      const stickyHeaderOffset = window.innerWidth < 768 ? 92 : 108;
      const viewportRoom = window.innerHeight - stickyHeaderOffset - 24;
      const targetOffset =
        target.offsetHeight < viewportRoom
          ? stickyHeaderOffset + (viewportRoom - target.offsetHeight) / 2
          : stickyHeaderOffset + 16;
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - targetOffset;
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: reduceMotion ? "auto" : "smooth",
      });
      target.focus({ preventScroll: true });
    });
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

    if (adultCount < 1) {
      nextErrors.people = "Đơn đặt tour phải có ít nhất 1 người lớn";
    } else if (childCount < 0) {
      nextErrors.people = "Số trẻ em không hợp lệ";
    } else if (selectedDeparture && priceInfo.totalPeople > availableSeats) {
      nextErrors.people = `Lịch này chỉ còn ${availableSeats} chỗ`;
    }

    if (requiresOrganization && !form.organizationName.trim()) {
      nextErrors.organizationName = "Vui lòng nhập tên đoàn/tổ chức";
    }

    customers.forEach((customer, index) => {
      if (!customer.fullName.trim()) {
        nextErrors[`customer_${index}_fullName`] = "Vui lòng nhập họ tên";
      }

      if (
        customer.email.trim() &&
        !emailPattern.test(customer.email.trim())
      ) {
        nextErrors[`customer_${index}_email`] = "Email không đúng định dạng";
      }
    });

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        tourId: tourId ? Number(tourId) : null,
        departureId: Number(selectedDepartureId),
        bookingType: form.bookingType,
        organizationName: requiresOrganization
          ? cleanText(form.organizationName)
          : null,
        contactPerson: requiresOrganization ? cleanText(form.contactPerson) : null,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        pickupAddress: cleanText(form.pickupAddress),
        adultCount,
        childCount,
        note: cleanText(form.note),
        specialRequest: cleanText(form.specialRequest),
        customers: customers.map((customer) => ({
          customerType: customer.customerType,
          fullName: customer.fullName.trim(),
          gender: customer.gender,
          dateOfBirth: customer.dateOfBirth || null,
          phone: cleanText(customer.phone),
          email: cleanText(customer.email),
          identityNumber: requiresIdentityDocument(customer.customerType)
            ? cleanText(customer.identityNumber)
            : null,
          address: cleanText(customer.address),
          emergencyContact: cleanText(customer.emergencyContact),
          healthNote: cleanText(customer.healthNote),
        })),
      };

      const draft = {
        payload,
        tour: {
          id: tour?.id,
          title: tour?.title,
          thumbnail: tour?.thumbnail,
          departureLocation: tour?.departureLocation,
          price: tour?.price,
        },
        departure: selectedDeparture
          ? {
              id: selectedDeparture.id,
              departureDate: selectedDeparture.departureDate,
              departureTime: selectedDeparture.departureTime,
              availableSeats: selectedDeparture.availableSeats,
              adultPrice: selectedDeparture.adultPrice,
              childPrice: selectedDeparture.childPrice,
            }
          : null,
        totals: priceInfo,
        createdAt: new Date().toISOString(),
      };

      if (onDraftReady) {
        onDraftReady(draft);
      } else {
        localStorage.setItem("booking_temp_complete", JSON.stringify(payload));
        navigate("/payment");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
          "Không thể chuyển sang thanh toán, vui lòng kiểm tra lại thông tin",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "field-input booking-field";

  return (
    <form
      onSubmit={handleSubmit}
      className="booking-dark-panel booking-form-surface rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-5 sm:p-6"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#9de09c] to-[#4f8f4d] text-[#020617] shadow-soft-green">
          <UserRound size={20} />
        </span>
        <div>
          <h2 className="text-lg font-black text-white">Thông tin đặt tour</h2>
          <p className="text-sm leading-6 text-slate-300">
            Thông tin liên hệ được lưu vào đơn đặt tour và hồ sơ trưởng đoàn.
          </p>
        </div>
      </div>

      {errors.departureId && (
        <div role="alert" className="mt-4 rounded-xl border border-rose-300/40 bg-rose-300/12 p-3 text-sm font-bold text-rose-100">
          {errors.departureId}
        </div>
      )}

      <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {formStepItems.map((step, index) => {
          const active = currentFormStep === index;
          const done = currentFormStep > index;
          const StepIcon =
            index === 0
              ? ClipboardList
              : index === 1
                ? ContactRound
                : index === 2
                  ? UsersRound
                  : CheckCircle2;

          return (
            <button
              key={step.label}
              type="button"
              onClick={() => jumpToFormStep(index)}
              className={[
                "min-h-[5.25rem] rounded-xl border p-3 text-left transition",
                active
                  ? "border-[#7FB77E] bg-[#7FB77E]/16 shadow-soft-green"
                  : done
                    ? "border-[#7FB77E]/35 bg-[#7FB77E]/8"
                    : "border-white/10 bg-white/[0.035] hover:border-[#7FB77E]/40",
              ].join(" ")}
            >
              <span className="flex items-start gap-3">
                <span
                  className={[
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    active || done
                      ? "bg-[#9de09c] text-[#020617]"
                      : "bg-white/[0.06] text-slate-300",
                  ].join(" ")}
                >
                  <StepIcon size={17} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-black uppercase tracking-widest text-[#d4a878]">
                    Bước {index + 1}
                  </span>
                  <span className="mt-0.5 block font-black leading-5 text-white">
                    {step.label}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-400">
                    {step.description}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4">
        <div
          id="booking-form-step-0"
          tabIndex="-1"
          className="booking-form-step rounded-2xl border border-white/10 bg-white/[0.035] p-4 outline-none"
        >
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
            Hình thức đặt tour
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            {bookingTypes.map((item) => {
              const active = form.bookingType === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => updateField("bookingType", item.value)}
                  className={[
                    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-black transition",
                    active
                      ? "border-[#7FB77E] bg-[#7FB77E] text-[#020617]"
                      : "border-white/10 bg-white/[0.06] text-white hover:border-[#7FB77E]/50",
                  ].join(" ")}
                >
                  {item.value === "INDIVIDUAL" ? (
                    <UserRound size={16} />
                  ) : (
                    <UsersRound size={16} />
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {requiresOrganization && (
          <div className="grid gap-4 rounded-xl border border-[#A67C52]/20 bg-[#A67C52]/[0.06] p-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
                Tên đoàn/tổ chức
              </label>
              <div className="relative">
                <Building2
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={form.organizationName}
                  onChange={(event) =>
                    updateField("organizationName", event.target.value)
                  }
                  className={`${inputClass} pl-11`}
                  placeholder="Công ty, gia đình, nhóm..."
                />
              </div>
              {errors.organizationName && (
                <p className="mt-2 text-sm text-rose-200">
                  {errors.organizationName}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
                Người đại diện
              </label>
              <input
                value={form.contactPerson}
                onChange={(event) =>
                  updateField("contactPerson", event.target.value)
                }
                className={inputClass}
                placeholder="Người liên hệ của đoàn"
              />
            </div>
          </div>
        )}

        <div
          id="booking-form-step-1"
          tabIndex="-1"
          className="booking-form-step rounded-2xl border border-white/10 bg-white/[0.035] p-4 outline-none"
        >
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
            Họ tên trưởng đoàn
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

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              readOnly
              aria-readonly="true"
              className={`${inputClass} cursor-not-allowed opacity-85`}
              placeholder="email@example.com"
            />
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Email nhận xác nhận được lấy từ tài khoản đang đăng nhập.
            </p>
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

          <div className="mt-4">
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
        </div>

        <div
          id="booking-form-step-2"
          tabIndex="-1"
          className="booking-form-step rounded-2xl border border-white/10 bg-white/[0.035] p-4 outline-none"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
                Người lớn
              </label>
              <input
                type="number"
                min="1"
                value={form.adultCount}
                onChange={(event) => updateField("adultCount", event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-[#d4a878]">
                Trẻ em / em bé
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
          <div role="alert" className="mt-4 rounded-xl border border-rose-300/40 bg-rose-300/12 p-3 text-sm font-bold text-rose-100">
            {errors.people}
          </div>
        )}

        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-black text-white">Khách đi cùng</h3>
            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-slate-300">
              {companionCount}
            </span>
          </div>

          {companionCount === 0 ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
              Bạn đang đặt 1 vé, khách sẽ được ghi nhận là hành khách.
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {customers.map((customer, index) => {
                const isAdultCompanion = index < adultCompanionCount;

                return (
                  <div
                    key={index}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#7FB77E]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#9de09c]">
                        Khách {index + 2}
                      </span>
                      {isAdultCompanion ? (
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                          Người lớn
                        </span>
                      ) : (
                        <select
                          value={customer.customerType}
                          onChange={(event) =>
                            updateCustomer(
                              customer.slotKey,
                              "customerType",
                              event.target.value,
                            )
                          }
                          className="h-9 rounded-lg border border-white/10 bg-[#102019] px-3 text-xs font-bold text-white outline-none transition focus:border-[#7FB77E]"
                        >
                          {childTypeOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <input
                          value={customer.fullName}
                          onChange={(event) =>
                            updateCustomer(
                              customer.slotKey,
                              "fullName",
                              event.target.value,
                            )
                          }
                          placeholder={`Họ tên ${customerTypeLabel[customer.customerType].toLowerCase()}`}
                          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                        />
                        {errors[`customer_${index}_fullName`] && (
                          <p className="mt-2 text-sm text-rose-200">
                            {errors[`customer_${index}_fullName`]}
                          </p>
                        )}
                      </div>

                      <select
                        value={customer.gender}
                        onChange={(event) =>
                          updateCustomer(
                            customer.slotKey,
                            "gender",
                            event.target.value,
                          )
                        }
                        className="h-11 rounded-xl border border-white/10 bg-[#102019] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                      >
                        {genderOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>

                      <input
                        type="date"
                        value={customer.dateOfBirth}
                        onChange={(event) =>
                          updateCustomer(
                            customer.slotKey,
                            "dateOfBirth",
                            event.target.value,
                          )
                        }
                        className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                      />

                      {requiresIdentityDocument(customer.customerType) ? (
                        <input
                          value={customer.identityNumber}
                          onChange={(event) =>
                            updateCustomer(
                              customer.slotKey,
                              "identityNumber",
                              event.target.value,
                            )
                          }
                          placeholder="CCCD/Hộ chiếu"
                          className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                        />
                      ) : (
                        <div className="flex h-11 items-center rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-3 text-sm font-semibold text-slate-400">
                          Trẻ em và em bé không cần CCCD/hộ chiếu
                        </div>
                      )}

                      <input
                        value={customer.phone}
                        onChange={(event) =>
                          updateCustomer(
                            customer.slotKey,
                            "phone",
                            event.target.value,
                          )
                        }
                        placeholder="Số điện thoại"
                        className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                      />

                      <div>
                        <input
                          value={customer.email}
                          onChange={(event) =>
                            updateCustomer(
                              customer.slotKey,
                              "email",
                              event.target.value,
                            )
                          }
                          placeholder="Email"
                          className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                        />
                        {errors[`customer_${index}_email`] && (
                          <p className="mt-2 text-sm text-rose-200">
                            {errors[`customer_${index}_email`]}
                          </p>
                        )}
                      </div>

                      <input
                        value={customer.address}
                        onChange={(event) =>
                          updateCustomer(
                            customer.slotKey,
                            "address",
                            event.target.value,
                          )
                        }
                        placeholder="Địa chỉ"
                        className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                      />

                      <input
                        value={customer.emergencyContact}
                        onChange={(event) =>
                          updateCustomer(
                            customer.slotKey,
                            "emergencyContact",
                            event.target.value,
                          )
                        }
                        placeholder="Liên hệ khẩn cấp"
                        className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-white outline-none transition focus:border-[#7FB77E]"
                      />

                      <input
                        value={customer.healthNote}
                        onChange={(event) =>
                          updateCustomer(
                            customer.slotKey,
                            "healthNote",
                            event.target.value,
                          )
                        }
                        placeholder="Ghi chú sức khỏe"
                        className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-3 text-white outline-none transition focus:border-[#7FB77E] sm:col-span-2"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>

        <div
          id="booking-form-step-3"
          tabIndex="-1"
          className="booking-form-step rounded-2xl border border-white/10 bg-white/[0.035] p-4 outline-none"
        >
          <div className="relative overflow-hidden rounded-2xl border border-[#7FB77E]/30 bg-gradient-to-br from-[#7FB77E]/15 via-[#020617]/40 to-[#A67C52]/15 p-5">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#7FB77E]/20 blur-2xl" />
            <div className="relative flex items-center justify-between text-sm text-slate-300">
              <span>Người lớn × {adultCount}</span>
              <span className="font-bold text-white">
                {formatCurrency(priceInfo.adultPrice)}
              </span>
            </div>
            <div className="relative mt-2 flex items-center justify-between text-sm text-slate-300">
              <span>Trẻ em / em bé × {childCount}</span>
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

          <div className="mt-4">
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

          <div className="mt-4">
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
          {submitting ? "Đang xử lý..." : "Tiếp tục thanh toán"}
        </button>
      </div>
    </form>
  );
}
