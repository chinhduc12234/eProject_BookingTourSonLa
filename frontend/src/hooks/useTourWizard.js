import {
  useCallback,
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  getTourDetail,
  updateTour,
  replaceTourImages,
} from "../api/tourApi";

import {
  replaceTourDays,
} from "../api/tourDayApi";

import {
  replaceActivities,
} from "../api/tourActivityApi";

import {
  replaceDepartures,
} from "../api/tourDepartureApi";

function buildDeparturesPayload(list) {
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = (list || [])
    .map((d, index) => {

      const departureDate = (d.departureDate || "")
        .toString()
        .slice(0, 10);

      const maxPeople = Number(d.maxPeople);
      const currentRaw = d.currentPeople;
      const currentPeople =
        currentRaw === "" ||
        currentRaw === null ||
        currentRaw === undefined
          ? 0
          : Number(currentRaw);

      const reservedRaw = d.reservedPeople;
      const reservedPeople =
        reservedRaw === "" ||
        reservedRaw === null ||
        reservedRaw === undefined
          ? 0
          : Number(reservedRaw);

      const adultPrice =
        d.adultPrice === "" || d.adultPrice == null
          ? null
          : Number(d.adultPrice);

      const childPrice =
        d.childPrice === "" || d.childPrice == null
          ? null
          : Number(d.childPrice);

      const status = d.status || null;

      if ((status || "OPEN") === "OPEN") {
        const departureDay = departureDate
          ? new Date(`${departureDate}T00:00:00`)
          : null;

        if (departureDay && departureDay < today) {
          throw new Error(
            `Lịch khởi hành dòng ${index + 1} đã qua ngày. Hãy đổi sang ngày từ hôm nay trở đi hoặc đặt trạng thái Đóng đặt.`,
          );
        }

        if (d.bookingDeadline && new Date(d.bookingDeadline) <= now) {
          throw new Error(
            `Hạn đặt của lịch khởi hành dòng ${index + 1} đã qua. Hãy cập nhật hạn đặt mới hoặc đặt trạng thái Đóng đặt.`,
          );
        }
      }

      return {
        id: d.id ?? null,
        departureDate,
        departureTime: d.departureTime || null,
        bookingDeadline: d.bookingDeadline || null,
        maxPeople,
        currentPeople: Number.isNaN(currentPeople) ? 0 : currentPeople,
        reservedPeople: Number.isNaN(reservedPeople) ? 0 : reservedPeople,
        adultPrice: Number.isFinite(adultPrice) ? adultPrice : null,
        childPrice: Number.isFinite(childPrice) ? childPrice : null,
        isPrivateDeparture: d.isPrivateDeparture || false,
        status,
      };
    })
    .filter((p) => p.departureDate && p.maxPeople > 0);

  return rows.sort((a, b) =>
    a.departureDate.localeCompare(b.departureDate),
  );
}

function buildTourUpdateBody(tour) {

  const t = tour || {};
  const priceText = t.price !== "" && t.price != null
    ? String(t.price).trim()
    : "";
  const priceNum = priceText ? Number(priceText) : NaN;

  if (!Number.isFinite(priceNum) || priceNum <= 0) {
    throw new Error("Giá tour phải lớn hơn 0");
  }

  return {
    title: (t.title || "").trim(),
    slug: (t.slug || "").trim(),
    thumbnail: t.thumbnail || null,
    shortDescription: t.shortDescription || null,
    description: t.description || null,
    includedServices: t.includedServices || null,
    excludedServices: t.excludedServices || null,
    durationDays: Math.max(1, Number(t.durationDays) || 1),
    durationNights: Math.max(0, Number(t.durationNights) || 0),
    departureLocation: t.departureLocation || null,
    maxPeople: Math.max(1, Number(t.maxPeople) || 1),
    price: priceText,
    status: t.status || "DRAFT",
  };
}

function activityToPayload(a, index) {

  return {
    title: (a.title || "").trim(),
    description: a.description || "",

    startTime: a.startTime
      ? `${a.startTime.length === 5 ? "2026-01-01T" + a.startTime + ":00" : a.startTime}`
      : null,

    endTime: a.endTime
      ? `${a.endTime.length === 5 ? "2026-01-01T" + a.endTime + ":00" : a.endTime}`
      : null,

    locationId: a.locationId ?? null,
    locationName: (a.locationName || "").trim() || null,
    sortOrder: index + 1,
  };
}

export default function useTourWizard(tourId) {

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const load = useCallback(async () => {

    if (!tourId) return;

    try {

      setLoading(true);

      const res = await getTourDetail(tourId);
      const detail = res?.data?.data || res?.data || {};

      setData({
        tour: detail.tour || detail || {},
        images: Array.isArray(detail.images) ? detail.images : [],
        days: Array.isArray(detail.days) ? detail.days : [],
        departures: Array.isArray(detail.departures) ? detail.departures : [],
      });

      setIsDirty(false);

    } catch (err) {

      console.error("LOAD ERROR:", err);

      toast.error("Không tải được chi tiết tour");
    } finally {

      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (patch) => {

    setData((prev) => ({
      ...prev,
      ...patch,
    }));

    setIsDirty(true);
  };

  const saveAll = useCallback(async () => {

    if (!tourId || !data) return false;

    const payload = data;

    try {

      setSaving(true);

      const tourBody = buildTourUpdateBody(payload.tour);

      let imagesPayload = (payload.images || [])
        .map((img) => ({
          ...img,
          imageUrl: (img.imageUrl || "").trim(),
        }))
        .filter((img) => img.imageUrl)
        .map((img, index) => ({
          imageUrl: img.imageUrl,
          isThumbnail: Boolean(img.isThumbnail),
          sortOrder: index,
        }));

      if (
        imagesPayload.length > 0 &&
        !imagesPayload.some((img) => img.isThumbnail)
      ) {
        imagesPayload = imagesPayload.map((img, index) => ({
          ...img,
          isThumbnail: index === 0,
        }));
      }

      const thumbFromGallery = imagesPayload.find(
        (img) => img.isThumbnail && img.imageUrl,
      );

      if (thumbFromGallery?.imageUrl) {
        tourBody.thumbnail = thumbFromGallery.imageUrl;
      }

      await updateTour(tourId, tourBody);

      await replaceTourImages(tourId, {
        images: imagesPayload,
      });

      const daysPayload = (payload.days || []).map((day, index) => ({
        dayNumber: index + 1,
        title: day.title || "",
        description: day.description || "",
      }));

      await replaceTourDays(tourId, daysPayload);

      const resDays = await getTourDetail(tourId);
      const detailDays = resDays?.data?.data || resDays?.data || {};
      const freshDays = Array.isArray(detailDays.days) ? detailDays.days : [];

      for (let i = 0; i < freshDays.length; i++) {

        const day = freshDays[i];
        const oldDay = payload.days[i];

        const activitiesPayload = (oldDay?.activities || []).map(activityToPayload);

        await replaceActivities(day.id, activitiesPayload);
      }

      const rawDeps = payload.departures || [];
      const depPayload = buildDeparturesPayload(rawDeps);

      if (rawDeps.length > depPayload.length) {

        toast(
          `Lưu ${depPayload.length} lịch khởi hành. ${rawDeps.length - depPayload.length} dòng thiếu ngày hoặc số chỗ không hợp lệ đã bỏ qua.`,
          { id: "deps-filtered", duration: 5000 },
        );
      }

      await replaceDepartures(tourId, depPayload);

      const res = await getTourDetail(tourId);
      const detail = res?.data?.data || res?.data || {};

      setData({
        tour: detail.tour || detail || {},
        images: Array.isArray(detail.images) ? detail.images : [],
        days: Array.isArray(detail.days) ? detail.days : [],
        departures: Array.isArray(detail.departures) ? detail.departures : [],
      });

      setIsDirty(false);

      toast.success("Đã lưu toàn bộ thông tin tour vào database");

      return true;

    } catch (err) {

      console.error("SAVE ALL ERROR:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Lưu thất bại. Kiểm tra dữ liệu và thử lại.",
      );

      return false;

    } finally {

      setSaving(false);
    }
  }, [tourId, data]);

  return {
    data,
    loading,
    saving,
    isDirty,
    update,
    saveAll,
    reload: load,
  };
}
