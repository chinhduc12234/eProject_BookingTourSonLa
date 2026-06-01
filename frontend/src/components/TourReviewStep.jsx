import {
  CalendarRange,
  ImageIcon,
  ListTree,
  MapPin,
} from "lucide-react";
import { resolveUploadedFileUrl } from "../api/userApi";

function toDateStr(v) {
  if (v == null || v === "") return "—";

  if (typeof v === "string") {
    return v.slice(0, 10);
  }

  return String(v);
}

function depStatusVi(s) {
  if (s === "OPEN") return "Còn chỗ";
  if (s === "FULL") return "Đã đủ";
  if (s === "CLOSED") return "Đóng";

  return s || "—";
}

function statusClass(status) {
  if (status === "OPEN") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "FULL") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-slate-100 text-slate-600";
}

export default function TourReviewStep({
  data,
  isDirty,
  saving,
  onSaveAll,
  onBack,
}) {
  const tour = data?.tour || {};
  const images = data?.images || [];
  const days = data?.days || [];
  const departures = data?.departures || [];

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">
          Xác nhận & lưu
        </h2>

        <p className="text-slate-500 mt-2 max-w-2xl">
          Kiểm tra lại toàn bộ dữ liệu trước khi lưu vào database.
        </p>
      </div>

      {/* TOUR */}

      <section
        className="
          bg-white
          border
          border-slate-100
          rounded-[32px]
          p-8
          shadow-sm
          hover:shadow-md
          hover:border-slate-200
          transition-all
        "
      >

        <div className="flex items-center gap-4 mb-6">

          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700">
            <MapPin size={20} />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Thông tin tour
            </h3>

            <p className="text-sm text-slate-500">
              Tổng quan dữ liệu chính của tour
            </p>
          </div>

        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="p-4 rounded-2xl border border-slate-100 bg-white">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mã tour
            </dt>

            <dd className="mt-2 text-lg font-black text-slate-900 font-mono">
              {tour.tourCode || "—"}
            </dd>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 bg-white">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Trạng thái
            </dt>

            <dd className="mt-2 text-slate-900 font-bold">
              {tour.status || "—"}
            </dd>
          </div>

          <div className="md:col-span-2 p-4 rounded-2xl border border-slate-100 bg-white">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Tên tour
            </dt>

            <dd className="mt-2 text-slate-900 font-bold text-lg">
              {tour.title || "—"}
            </dd>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 bg-white">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Slug
            </dt>

            <dd className="mt-2 text-slate-800 font-mono break-all">
              {tour.slug || "—"}
            </dd>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 bg-white">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Giá tour
            </dt>

            <dd className="mt-2 text-emerald-700 font-black text-lg">
              {tour.price != null
                ? `₫${tour.price.toLocaleString()}`
                : "—"}
            </dd>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 bg-white">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Thời lượng
            </dt>

            <dd className="mt-2 text-slate-800 font-semibold">
              {tour.durationDays ?? "—"} ngày ·{" "}
              {tour.durationNights ?? "—"} đêm
            </dd>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 bg-white">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Số khách tối đa
            </dt>

            <dd className="mt-2 text-slate-800 font-semibold">
              {tour.maxPeople ?? "—"}
            </dd>
          </div>

          <div className="md:col-span-2 p-4 rounded-2xl border border-slate-100 bg-white">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Điểm khởi hành
            </dt>

            <dd className="mt-2 text-slate-800">
              {tour.departureLocation || "—"}
            </dd>
          </div>

          <div className="md:col-span-2 p-4 rounded-2xl border border-slate-100 bg-white">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mô tả ngắn
            </dt>

            <dd className="mt-2 text-slate-700 whitespace-pre-wrap">
              {tour.shortDescription || "—"}
            </dd>
          </div>

          <div className="md:col-span-2 p-4 rounded-2xl border border-slate-100 bg-white">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mô tả chi tiết
            </dt>

            <dd className="mt-2 text-slate-700 whitespace-pre-wrap max-h-56 overflow-y-auto">
              {tour.description || "—"}
            </dd>
          </div>

          <div className="md:col-span-2 p-4 rounded-2xl border border-slate-100 bg-white">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Thumbnail URL
            </dt>

            <dd className="mt-2 text-xs text-slate-700 font-mono break-all">
              {tour.thumbnail || "—"}
            </dd>
          </div>

          <div className="p-4 rounded-2xl border border-slate-100 bg-white">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Người tạo
            </dt>

            <dd className="mt-2 text-slate-800 font-semibold">
              {tour.createdByName || "—"}
            </dd>
          </div>

        </dl>

      </section>

      {/* IMAGES */}

      <section
        className="
          bg-white
          border
          border-slate-100
          rounded-[32px]
          p-8
          shadow-sm
          hover:shadow-md
          hover:border-slate-200
          transition-all
        "
      >

        <div className="flex items-center gap-4 mb-6">

          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700">
            <ImageIcon size={20} />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Hình ảnh
            </h3>

            <p className="text-sm text-slate-500">
              Tổng cộng {images.length} ảnh
            </p>
          </div>

        </div>

        {images.length === 0 ? (
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
            <p className="text-sm text-slate-500">
              Chưa có ảnh.
            </p>
          </div>
        ) : (
          <ul className="flex flex-wrap gap-4">

            {images.map((img, i) => (
              <li
                key={img.id ?? i}
                className="
                  relative
                  w-32
                  h-32
                  overflow-hidden
                  rounded-3xl
                  border
                  border-slate-100
                  bg-white
                  group
                "
              >

                <img
                  src={resolveUploadedFileUrl(img.imageUrl)}
                  alt=""
                  className="
                    w-full
                    h-full
                    object-cover
                    group-hover:scale-105
                    transition-transform
                    duration-500
                  "
                />

                {img.isThumbnail && (
                  <span
                    className="
                      absolute
                      top-2
                      right-2
                      text-[10px]
                      font-bold
                      bg-slate-900
                      text-white
                      px-2
                      py-1
                      rounded-lg
                    "
                  >
                    THUMB
                  </span>
                )}

              </li>
            ))}

          </ul>
        )}

      </section>

      {/* DAYS */}

      <section
        className="
          bg-white
          border
          border-slate-100
          rounded-[32px]
          p-8
          shadow-sm
          hover:shadow-md
          hover:border-slate-200
          transition-all
        "
      >

        <div className="flex items-center gap-4 mb-6">

          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700">
            <ListTree size={20} />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Lịch trình
            </h3>

            <p className="text-sm text-slate-500">
              {days.length} ngày hoạt động
            </p>
          </div>

        </div>

        {days.length === 0 ? (
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
            <p className="text-sm text-slate-500">
              Chưa có lịch trình.
            </p>
          </div>
        ) : (
          <ol className="space-y-4">

            {days.map((day, i) => (
              <li
                key={day.id ?? i}
                className="
                  rounded-3xl
                  border
                  border-slate-100
                  p-5
                  bg-white
                "
              >

                <p className="text-lg font-black text-slate-900">
                  Ngày {day.dayNumber ?? i + 1}:{" "}
                  {day.title || "Không tiêu đề"}
                </p>

                <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">
                  {day.description || ""}
                </p>

                {(day.activities || []).length > 0 && (
                  <ul className="mt-5 space-y-3">

                    {day.activities.map((act, ai) => (
                      <li
                        key={ai}
                        className="
                          rounded-2xl
                          border
                          border-slate-100
                          p-4
                          bg-slate-50
                        "
                      >

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="font-bold text-slate-900">
                            {act.title || "Hoạt động"}
                          </span>

                          {(act.startTime || act.endTime) && (
                            <span className="text-xs text-slate-500 font-medium">
                              {act.startTime?.slice(0, 5) || "—"}
                              {" → "}
                              {act.endTime?.slice(0, 5) || "—"}
                            </span>
                          )}

                        </div>

                        {act.locationName && (
                          <p className="mt-2 text-sm text-slate-600">
                            📍 {act.locationName}
                          </p>
                        )}

                      </li>
                    ))}

                  </ul>
                )}

              </li>
            ))}

          </ol>
        )}

      </section>

      {/* DEPARTURES */}

      <section
        className="
          bg-white
          border
          border-slate-100
          rounded-[32px]
          p-8
          shadow-sm
          hover:shadow-md
          hover:border-slate-200
          transition-all
        "
      >

        <div className="flex items-center gap-4 mb-6">

          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700">
            <CalendarRange size={20} />
          </div>

          <div>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Ngày khởi hành
            </h3>

            <p className="text-sm text-slate-500">
              {departures.length} lịch khởi hành
            </p>
          </div>

        </div>

        {departures.length === 0 ? (
          <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
            <p className="text-sm text-slate-500">
              Chưa có lịch khởi hành.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-100">

            <table className="w-full text-sm">

              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-5 py-4 text-left font-bold">
                    Ngày
                  </th>

                  <th className="px-5 py-4 text-left font-bold">
                    Tối đa
                  </th>

                  <th className="px-5 py-4 text-left font-bold">
                    Đã đặt
                  </th>

                  <th className="px-5 py-4 text-left font-bold">
                    Trạng thái
                  </th>
                </tr>
              </thead>

              <tbody>

                {departures.map((d, i) => (
                  <tr
                    key={d.id ?? i}
                    className="
                      border-t
                      border-slate-100
                      hover:bg-slate-50
                      transition-colors
                    "
                  >

                    <td className="px-5 py-4 font-mono font-semibold">
                      {toDateStr(d.departureDate)}
                    </td>

                    <td className="px-5 py-4 text-slate-700 font-semibold">
                      {d.maxPeople ?? "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-700 font-semibold">
                      {d.currentPeople ?? "—"}
                    </td>

                    <td className="px-5 py-4">

                      <span
                        className={`
                          inline-flex
                          items-center
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-bold
                          ${statusClass(d.status)}
                        `}
                      >
                        {depStatusVi(d.status)}
                      </span>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </section>

      {/* ACTIONS */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          items-stretch
          sm:items-center
          justify-between
          gap-4
          pt-6
          border-t
          border-slate-100
        "
      >

        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="
            h-12
            px-6
            rounded-2xl
            border
            border-slate-200
            text-slate-700
            font-bold
            hover:bg-slate-50
            transition-all
            disabled:opacity-50
          "
        >
          ← Quay lại
        </button>

        <div className="flex flex-col items-stretch sm:items-end gap-2">

          {!isDirty && (
            <span className="text-xs text-slate-500">
              Không có thay đổi
            </span>
          )}

          <button
            type="button"
            disabled={saving || !isDirty}
            onClick={() => {
              void onSaveAll();
            }}
            className="
              h-12
              px-8
              rounded-2xl
              bg-slate-900
              hover:bg-slate-800
              text-white
              font-bold
              transition-all
              disabled:opacity-40
              disabled:cursor-not-allowed
            "
          >
            {saving
              ? "Đang lưu..."
              : "Lưu tất cả"}
          </button>

        </div>

      </div>

    </div>
  );
}
