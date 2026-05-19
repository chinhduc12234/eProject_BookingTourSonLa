import { useEffect, useState } from "react";
import {
  CalendarDays,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";

import { getLocations } from "../api/locationApi";

export default function TourDaysStep({
  data = [],
  onChange,
}) {

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getLocations({ page: 0, size: 500 });
        const list = res?.data?.content ?? res?.data ?? [];
        setLocations(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("LOAD LOCATIONS:", err);
      }
    })();
  }, []);

  // ================= UPDATE ROOT =================

  const setDays = (days) => {
    onChange(days);
  };

  // ================= ADD DAY =================

  const addDay = () => {

    const nextDay =
      data.length + 1;

    setDays([
      ...data,
      {
        dayNumber: nextDay,
        title: `Ngày ${nextDay}`,
        description: "",
        activities: [],
      },
    ]);
  };

  // ================= UPDATE DAY =================

  const updateDayField = (
    dayIndex,
    field,
    value
  ) => {

    const updated = [...data];

    updated[dayIndex] = {
      ...updated[dayIndex],
      [field]: value,
    };

    setDays(updated);
  };

  // ================= DELETE DAY =================

  const removeDay = (
    dayIndex
  ) => {

    const updated =
      data
        .filter(
          (_, i) => i !== dayIndex
        )
        .map((day, index) => ({
          ...day,
          dayNumber: index + 1,
        }));

    setDays(updated);
  };

  // ================= ADD ACTIVITY =================

  const addActivity = (
    dayIndex
  ) => {

    const updated = [...data];

    const activities =
      updated[dayIndex]
        .activities || [];

    updated[dayIndex] = {
      ...updated[dayIndex],

      activities: [
        ...activities,
        {
          title:
            "Hoạt động mới",

          description: "",

          startTime: "",

          endTime: "",

          locationId: null,

          sortOrder:
            activities.length,
        },
      ],
    };

    setDays(updated);
  };

  // ================= UPDATE ACTIVITY =================

  const updateActivityField = (
    dayIndex,
    activityIndex,
    field,
    value
  ) => {

    const updated = [...data];

    const activities = [
      ...(updated[dayIndex]
        .activities || []),
    ];

    activities[activityIndex] = {
      ...activities[activityIndex],
      [field]: value,
    };

    updated[dayIndex] = {
      ...updated[dayIndex],
      activities,
    };

    setDays(updated);
  };

  // ================= DELETE ACTIVITY =================

  const removeActivity = (
    dayIndex,
    activityIndex
  ) => {

    const updated = [...data];

    const activities =
      (
        updated[dayIndex]
          .activities || []
      )
        .filter(
          (_, i) =>
            i !== activityIndex
        )
        .map((a, index) => ({
          ...a,
          sortOrder: index,
        }));

    updated[dayIndex] = {
      ...updated[dayIndex],
      activities,
    };

    setDays(updated);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-black text-slate-900">
            Lịch trình tour
          </h2>

          <p className="text-slate-600 mt-1 font-medium">
            Quản lý ngày và hoạt động
          </p>

        </div>

        <button
          type="button"
          onClick={addDay}
          className="
            h-12
            px-5
            rounded-[32px]
            bg-slate-900
            hover:bg-slate-800
            text-white
            font-bold
            flex
            items-center
            gap-2
            transition-all
            duration-300
            shadow-sm
            active:scale-95
          "
        >

          <Plus size={18} />

          Thêm ngày

        </button>

      </div>

      {/* DAYS */}

      {data.map((day, dayIndex) => (

        <div
          key={dayIndex}
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

          {/* TOP */}

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
                  text-slate-900
                  font-bold
                  shadow-sm
                  border
                  border-slate-100
                "
              >

                <span>{day.dayNumber}</span>

              </div>

              <div>

                <p className="text-sm text-slate-500 font-semibold uppercase">
                  Ngày {day.dayNumber}
                </p>

                <h3 className="font-black text-lg text-slate-900">
                  {day.title}
                </h3>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                removeDay(dayIndex)
              }
              className="
                h-11
                px-4
                rounded-2xl
                bg-rose-500
                hover:bg-rose-600
                text-white
                transition-all
                duration-300
                shadow-sm
                active:scale-95
              "
            >

              <Trash2 size={18} />

            </button>

          </div>

          {/* FORM */}

          <div className="space-y-4 mb-6">

            <input
              value={day.title || ""}
              onChange={(e) =>
                updateDayField(
                  dayIndex,
                  "title",
                  e.target.value
                )
              }
              placeholder="Tiêu đề ngày"
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

            <textarea
              value={
                day.description || ""
              }
              onChange={(e) =>
                updateDayField(
                  dayIndex,
                  "description",
                  e.target.value
                )
              }
              rows={3}
              placeholder="Mô tả ngày..."
              className="
                w-full
                p-4
                rounded-2xl
                border
                border-slate-200
                focus:border-slate-900
                focus:ring-2
                focus:ring-slate-100
                transition-all
                duration-300
                resize-none
                bg-white
              "
            />

          </div>

          {/* ACTIVITIES */}

          <div className="space-y-4">

            {day.activities?.map(
              (
                activity,
                activityIndex
              ) => (

                <div
                  key={activityIndex}
                  className="
                    border
                    border-slate-100
                    rounded-2xl
                    p-4
                    bg-white
                    transition-all
                    duration-300
                    shadow-sm
                  "
                >

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                    <div className="lg:col-span-3">

                      <input
                        type="time"
                        value={
                          activity.startTime ||
                          ""
                        }
                        onChange={(e) =>
                          updateActivityField(
                            dayIndex,
                            activityIndex,
                            "startTime",
                            e.target.value
                          )
                        }
                        className="
                          w-full
                          h-11
                          px-3
                          rounded-xl
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

                    <div className="lg:col-span-3">

                      <input
                        type="time"
                        value={
                          activity.endTime ||
                          ""
                        }
                        onChange={(e) =>
                          updateActivityField(
                            dayIndex,
                            activityIndex,
                            "endTime",
                            e.target.value
                          )
                        }
                        className="
                          w-full
                          h-11
                          px-3
                          rounded-xl
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

                    <div className="lg:col-span-5">

                      <input
                        value={
                          activity.title ||
                          ""
                        }
                        onChange={(e) =>
                          updateActivityField(
                            dayIndex,
                            activityIndex,
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Tên hoạt động"
                        className="
                          w-full
                          h-11
                          px-3
                          rounded-xl
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

                    <div className="lg:col-span-1">

                      <button
                        type="button"
                        onClick={() =>
                          removeActivity(
                            dayIndex,
                            activityIndex
                          )
                        }
                        className="
                          w-full
                          h-11
                          rounded-xl
                          bg-rose-500
                          hover:bg-rose-600
                          text-white
                          transition-all
                          duration-300
                          shadow-sm
                          active:scale-95
                        "
                      >

                        <Trash2 size={16} />

                      </button>

                    </div>

                  </div>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">

                    <div>

                      <label className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1 uppercase">
                        <MapPin size={14} />
                        Địa điểm
                      </label>

                      <select
                        value={activity.locationId ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const id = raw === "" ? null : Number(raw);
                          const loc = locations.find((l) => l.id === id);
                          const updated = [...data];
                          const activities = [
                            ...(updated[dayIndex].activities || []),
                          ];
                          activities[activityIndex] = {
                            ...activities[activityIndex],
                            locationId: id,
                            locationName: loc?.name ?? null,
                          };
                          updated[dayIndex] = {
                            ...updated[dayIndex],
                            activities,
                          };
                          setDays(updated);
                        }}
                        className="
                          w-full
                          h-11
                          px-3
                          rounded-xl
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
                        <option value="">— Không chọn —</option>
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.name}
                          </option>
                        ))}
                      </select>

                    </div>

                    <div className="flex items-end">
                      {activity.locationName && (
                        <p className="text-xs text-slate-600 pb-2 font-medium">
                          📍 {activity.locationName}
                        </p>
                      )}
                    </div>

                  </div>

                  <textarea
                    value={
                      activity.description ||
                      ""
                    }
                    onChange={(e) =>
                      updateActivityField(
                        dayIndex,
                        activityIndex,
                        "description",
                        e.target.value
                      )
                    }
                    rows={2}
                    placeholder="Mô tả hoạt động..."
                    className="
                      mt-4
                      w-full
                      p-3
                      rounded-xl
                      border
                      border-slate-200
                      focus:border-slate-900
                      focus:ring-2
                      focus:ring-slate-100
                      transition-all
                      duration-300
                      resize-none
                      bg-white
                    "
                  />

                </div>
              )
            )}

            <button
              type="button"
              onClick={() =>
                addActivity(dayIndex)
              }
              className="
                h-11
                px-4
                rounded-2xl
                bg-slate-50
                hover:bg-slate-100
                text-slate-900
                font-semibold
                flex
                items-center
                gap-2
                transition-all
                duration-300
                shadow-sm
                border
                border-slate-200
              "
            >

              <Plus size={16} />

              Thêm hoạt động

            </button>

          </div>

        </div>
      ))}

    </div>
  );
}