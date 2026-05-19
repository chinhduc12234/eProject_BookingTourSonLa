function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return String(value);
  }
}

export default function TourInfoStep({
  data,
  onChange,
}) {

  const set = (field, value) => {
    onChange({
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">

      {/* SYSTEM INFO */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600">
            <span className="font-bold text-lg">#</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mã tour</p>
            <h3 className="text-xl font-black text-slate-800 font-mono">{data?.tourCode || "—"}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600">
            <span className="font-bold text-lg">👤</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Người tạo</p>
            <h3 className="text-lg font-bold text-slate-800">{data?.createdByName || "—"}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600">
            <span className="font-bold text-lg">📅</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tạo lúc</p>
            <h3 className="text-sm font-bold text-slate-800">{formatDateTime(data?.createdAt)}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600">
            <span className="font-bold text-lg">⏱️</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cập nhật</p>
            <h3 className="text-sm font-bold text-slate-800">{formatDateTime(data?.updatedAt)}</h3>
          </div>
        </div>
      </div>

      {/* BASIC FORM */}

      <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">

        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-6">
          Thông tin cơ bản
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Tên tour
            </label>

            <input
              value={data?.title || ""}
              onChange={(e) =>
                set("title", e.target.value)
              }
              className="
                w-full
                px-4
                py-3
                rounded-2xl
                border
                border-slate-200
                focus:border-slate-900
                focus:ring-2
                focus:ring-slate-100
                outline-none
                transition-all
                bg-white
              "
              placeholder="VD: Tour Mộc Châu 3N2Đ"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Slug
            </label>

            <input
              value={data?.slug || ""}
              onChange={(e) =>
                set("slug", e.target.value)
              }
              className="
                w-full
                px-4
                py-3
                rounded-2xl
                border
                border-slate-200
                focus:border-slate-900
                focus:ring-2
                focus:ring-slate-100
                outline-none
                transition-all
                bg-white
              "
              placeholder="tour-moc-chau-3n2d"
            />
          </div>

        </div>
      </div>

      {/* THUMBNAIL */}

      <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">

        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-6">
          Ảnh đại diện
        </h2>

        <input
          value={data?.thumbnail || ""}
          onChange={(e) =>
            set("thumbnail", e.target.value)
          }
          className="
            w-full
            px-4
            py-3
            rounded-2xl
            border
            border-slate-200
            focus:border-slate-900
            focus:ring-2
            focus:ring-slate-100
            outline-none
            transition-all
            mb-4
            bg-white
          "
          placeholder="https://..."
        />

        {data?.thumbnail && (
          <div className="overflow-hidden rounded-3xl border border-slate-100 group">

            <img
              src={data.thumbnail}
              alt="thumbnail"
              className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
            />

          </div>
        )}

      </div>

      {/* TOUR INFO */}

      <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">

        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-6">
          Thông tin tour
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Số ngày
            </label>

            <input
              type="number"
              value={data?.durationDays || ""}
              onChange={(e) =>
                set("durationDays", Number(e.target.value))
              }
              className="
                w-full
                px-4
                py-3
                rounded-2xl
                border
                border-slate-200
                focus:border-slate-900
                focus:ring-2
                focus:ring-slate-100
                outline-none
                transition-all
                bg-white
              "
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Số đêm
            </label>

            <input
              type="number"
              value={data?.durationNights || ""}
              onChange={(e) =>
                set("durationNights", Number(e.target.value))
              }
              className="
                w-full
                px-4
                py-3
                rounded-2xl
                border
                border-slate-200
                focus:border-slate-900
                focus:ring-2
                focus:ring-slate-100
                outline-none
                transition-all
                bg-white
              "
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Điểm khởi hành
            </label>

            <input
              value={data?.departureLocation || ""}
              onChange={(e) =>
                set("departureLocation", e.target.value)
              }
              className="
                w-full
                px-4
                py-3
                rounded-2xl
                border
                border-slate-200
                focus:border-slate-900
                focus:ring-2
                focus:ring-slate-100
                outline-none
                transition-all
                bg-white
              "
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Số khách tối đa
            </label>

            <input
              type="number"
              value={data?.maxPeople || ""}
              onChange={(e) =>
                set("maxPeople", Number(e.target.value))
              }
              className="
                w-full
                px-4
                py-3
                rounded-2xl
                border
                border-slate-200
                focus:border-slate-900
                focus:ring-2
                focus:ring-slate-100
                outline-none
                transition-all
                bg-white
              "
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Giá tour
            </label>

            <input
              type="number"
              value={data?.price || ""}
              onChange={(e) =>
                set("price", Number(e.target.value))
              }
              className="
                w-full
                px-4
                py-3
                rounded-2xl
                border
                border-slate-200
                focus:border-slate-900
                focus:ring-2
                focus:ring-slate-100
                outline-none
                transition-all
                bg-white
              "
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Trạng thái
            </label>

            <select
              value={data?.status || "DRAFT"}
              onChange={(e) =>
                set("status", e.target.value)
              }
              className="
                w-full
                px-4
                py-3
                rounded-2xl
                border
                border-slate-200
                focus:border-slate-900
                focus:ring-2
                focus:ring-slate-100
                outline-none
                transition-all
                bg-white
              "
            >
              <option value="DRAFT">Draft</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

        </div>
      </div>

      {/* SHORT DESCRIPTION */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-6">
            Mô tả ngắn
          </h2>

          <textarea
            rows={8}
            value={data?.shortDescription || ""}
            onChange={(e) =>
              set("shortDescription", e.target.value)
            }
            className="
              w-full
              p-4
              rounded-2xl
              border
              border-slate-200
              focus:border-slate-900
              focus:ring-2
              focus:ring-slate-100
              outline-none
              transition-all
              resize-none
              bg-white
            "
            placeholder="Mô tả ngắn tour..."
          />

        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">

          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-6">
            Mô tả chi tiết
          </h2>

          <textarea
            rows={8}
            value={data?.description || ""}
            onChange={(e) =>
              set("description", e.target.value)
            }
            className="
              w-full
              p-4
              rounded-2xl
              border
              border-slate-200
              focus:border-slate-900
              focus:ring-2
              focus:ring-slate-100
              outline-none
              transition-all
              resize-none
              bg-white
            "
            placeholder="Lịch trình chi tiết..."
          />

        </div>

      </div>
    </div>
  );
}