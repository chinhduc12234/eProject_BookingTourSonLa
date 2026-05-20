import {
  CalendarRange,
  Plus,
  Trash2,
} from "lucide-react";

function toDateInputValue(value) {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

function statusLabel(status) {
  if (status === "OPEN") return "Còn chỗ";
  if (status === "FULL") return "Đã đủ";
  if (status === "CLOSED") return "Đóng";
  return "—";
}

export default function TourDepartureStep({
  data = [],
  defaultMaxPeople = 30,
  onChange,
}) {

  const setDepartures = (next) => {
    onChange(next);
  };

  const addDeparture = () => {
    setDepartures([
      ...data,
      {
        departureDate: "",
        maxPeople: defaultMaxPeople > 0 ? defaultMaxPeople : 30,
        currentPeople: 0,
      },
    ]);
  };

  const updateField = (index, field, rawValue) => {

    const copy = [...data];

    let value = rawValue;

    if (field === "maxPeople" || field === "currentPeople" || field === "reservedPeople") {
      if (rawValue === "" || rawValue === null) {
        value = field === "currentPeople" || field === "reservedPeople" ? 0 : "";
      } else {
        const n = Number(rawValue);
        value = Number.isNaN(n) ? copy[index][field] : n;
      }
    }

    if (field === "adultPrice" || field === "childPrice") {
      if (rawValue === "" || rawValue === null) {
        value = "";
      } else {
        const n = Number(rawValue);
        value = Number.isNaN(n) ? copy[index][field] : n;
      }
    }

    if (field === "isPrivateDeparture") {
      value = Boolean(rawValue);
    }

    copy[index] = {
      ...copy[index],
      [field]: value,
    };

    setDepartures(copy);
  };

  const removeDeparture = (index) => {
    setDepartures(data.filter((_, i) => i !== index));
  };

  const dateKeys = data.map((d) => toDateInputValue(d.departureDate));
  const duplicateDates = dateKeys.filter(
    (d, i) => d && dateKeys.indexOf(d) !== i
  );

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-black text-slate-900">
            Ngày khởi hành
          </h2>

          <p className="text-slate-600 mt-1 font-medium">
            Thêm các đợt khởi hành, số chỗ tối đa và số khách đã đặt
          </p>

        </div>

        <button
          type="button"
          onClick={addDeparture}
          className="
            h-12
            px-5
            rounded-2xl
            bg-slate-900
            hover:bg-slate-800
            text-white
            font-bold
            flex
            items-center
            gap-2
            transition-all
            duration-300
            active:scale-95
          "
        >

          <Plus size={18} />

          Thêm ngày khởi hành

        </button>

      </div>

      {duplicateDates.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
          <p className="text-sm text-rose-700 font-semibold">
            Có ít nhất hai dòng trùng cùng một ngày. Mỗi ngày chỉ được một đợt.
          </p>
        </div>
      )}

      {data.length === 0 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <p className="text-slate-700 text-sm font-medium">
            Chưa có ngày khởi hành. Nhấn &quot;Thêm ngày khởi hành&quot; để tạo.
          </p>
        </div>
      )}

      {data.map((row, index) => (

        <div
          key={row.id ?? `dep-${index}`}
          className="
            bg-white
            border
            border-slate-100
            rounded-[32px]
            p-6
            shadow-sm
            transition-all
            duration-300
          "
        >

          <div className="flex items-center justify-between mb-5">

            <div className="flex items-center gap-3">

              <div
                className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-slate-50
                  flex
                  items-center
                  justify-center
                  text-slate-700
                  font-bold
                "
              >

                <span>{index + 1}</span>

              </div>

              <div>

                <p className="text-sm text-slate-600 font-semibold uppercase">
                  Đợt {index + 1}
                </p>

                <p className="font-black text-lg text-slate-900">
                  {toDateInputValue(row.departureDate) || "—"}
                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <span
                className={`
                  text-xs
                  font-bold
                  px-4
                  py-2
                  rounded-full
                  transition-all
                  duration-300
                  ${row.status === "OPEN"
                    ? "bg-emerald-100 text-emerald-700"
                    : row.status === "FULL"
                    ? "bg-slate-100 text-slate-700"
                    : "bg-slate-100 text-slate-700"
                  }
                `}
              >
                {statusLabel(row.status)}
              </span>

              <button
                type="button"
                onClick={() => removeDeparture(index)}
                className="
                  h-11
                  px-4
                  rounded-2xl
                  bg-rose-500
                  hover:bg-rose-600
                  text-white
                  transition-all
                  duration-300
                  active:scale-95
                "
              >

                <Trash2 size={18} />

              </button>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                Ngày khởi hành
              </label>

              <input
                type="date"
                value={toDateInputValue(row.departureDate)}
                onChange={(e) =>
                  updateField(
                    index,
                    "departureDate",
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-12
                  px-4
                  rounded-2xl
                  border
                  border-slate-200
                  focus:border-slate-900
                  focus:ring-2
                  focus:ring-slate-100
                  transition-all
                  duration-300
                  bg-white
                "
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                Giờ khởi hành
              </label>

              <input
                type="time"
                value={row.departureTime || ""}
                onChange={(e) =>
                  updateField(
                    index,
                    "departureTime",
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-12
                  px-4
                  rounded-2xl
                  border
                  border-slate-200
                  focus:border-slate-900
                  focus:ring-2
                  focus:ring-slate-100
                  transition-all
                  duration-300
                  bg-white
                "
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                Hạn đặt
              </label>

              <input
                type="datetime-local"
                value={row.bookingDeadline ? row.bookingDeadline.slice(0, 16) : ""}
                onChange={(e) =>
                  updateField(
                    index,
                    "bookingDeadline",
                    e.target.value ? e.target.value + ":00" : ""
                  )
                }
                className="
                  w-full
                  h-12
                  px-4
                  rounded-2xl
                  border
                  border-slate-200
                  focus:border-slate-900
                  focus:ring-2
                  focus:ring-slate-100
                  transition-all
                  duration-300
                  bg-white
                "
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                Số chỗ tối đa
              </label>

              <input
                type="number"
                min={1}
                value={row.maxPeople ?? ""}
                onChange={(e) =>
                  updateField(
                    index,
                    "maxPeople",
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-12
                  px-4
                  rounded-2xl
                  border
                  border-slate-200
                  focus:border-slate-900
                  focus:ring-2
                  focus:ring-slate-100
                  transition-all
                  duration-300
                  bg-white
                "
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                Đã đặt
              </label>

              <input
                type="number"
                min={0}
                value={
                  row.currentPeople === 0 || row.currentPeople
                    ? row.currentPeople
                    : 0
                }
                onChange={(e) =>
                  updateField(
                    index,
                    "currentPeople",
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-12
                  px-4
                  rounded-2xl
                  border
                  border-slate-200
                  focus:border-slate-900
                  focus:ring-2
                  focus:ring-slate-100
                  transition-all
                  duration-300
                  bg-white
                "
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                Giữ chỗ
              </label>

              <input
                type="number"
                min={0}
                value={
                  row.reservedPeople === 0 || row.reservedPeople
                    ? row.reservedPeople
                    : 0
                }
                onChange={(e) =>
                  updateField(
                    index,
                    "reservedPeople",
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-12
                  px-4
                  rounded-2xl
                  border
                  border-slate-200
                  focus:border-slate-900
                  focus:ring-2
                  focus:ring-slate-100
                  transition-all
                  duration-300
                  bg-white
                "
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                Giá người lớn
              </label>

              <input
                type="number"
                min={0}
                step="0.01"
                value={row.adultPrice ?? ""}
                onChange={(e) =>
                  updateField(
                    index,
                    "adultPrice",
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-12
                  px-4
                  rounded-2xl
                  border
                  border-slate-200
                  focus:border-slate-900
                  focus:ring-2
                  focus:ring-slate-100
                  transition-all
                  duration-300
                  bg-white
                "
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                Giá trẻ em
              </label>

              <input
                type="number"
                min={0}
                step="0.01"
                value={row.childPrice ?? ""}
                onChange={(e) =>
                  updateField(
                    index,
                    "childPrice",
                    e.target.value
                  )
                }
                className="
                  w-full
                  h-12
                  px-4
                  rounded-2xl
                  border
                  border-slate-200
                  focus:border-slate-900
                  focus:ring-2
                  focus:ring-slate-100
                  transition-all
                  duration-300
                  bg-white
                "
              />

            </div>

            <div>

              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                Trạng thái
              </label>

              <select
                value={row.status || "OPEN"}
                onChange={(e) =>
                  updateField(index, "status", e.target.value)
                }
                className="
                  w-full
                  h-12
                  px-4
                  rounded-2xl
                  border
                  border-slate-200
                  focus:border-slate-900
                  focus:ring-2
                  focus:ring-slate-100
                  transition-all
                  duration-300
                  bg-white
                "
              >
                <option value="OPEN">Còn chỗ</option>
                <option value="FULL">Đã đủ</option>
                <option value="CLOSED">Đóng đặt</option>
              </select>

            </div>

            <div className="flex items-end">

              <label className="flex items-center gap-3 h-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 transition-all cursor-pointer bg-slate-50">
                <input
                  type="checkbox"
                  checked={row.isPrivateDeparture || false}
                  onChange={(e) =>
                    updateField(index, "isPrivateDeparture", e.target.checked)
                  }
                  className="w-5 h-5 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Tour riêng
                </span>
              </label>

            </div>

          </div>

        </div>
      ))}

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <p className="text-sm text-slate-700">
          Mỗi dòng là một đợt khởi hành (cần chọn ngày và số chỗ lớn hơn 0). 
          Các trường như giờ khởi hành, hạn đặt, giá người lớn/trẻ em là tùy chọn. 
          Một tour có thể có nhiều đợt. Chỉ khi bạn nhấn &quot;Lưu tất cả&quot; ở bước cuối thì dữ liệu mới được ghi vào database.
        </p>
      </div>

    </div>
  );
}
