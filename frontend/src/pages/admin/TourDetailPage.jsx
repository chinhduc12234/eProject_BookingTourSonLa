import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";

import useTourWizard from "../../hooks/useTourWizard";

import TourStepBar from "../../components/TourStepBar";
import TourInfoStep from "../../components/TourInfoStep";
import TourImagesStep from "../../components/TourImagesStep";
import TourItineraryStep from "../../components/TourDaysStep";
import TourDepartureStep from "../../components/TourDepartureStep";
import TourReviewStep from "../../components/TourReviewStep";

export default function TourWizardPage() {

  const { id } = useParams();

  const {
    data,
    loading,
    saving,
    isDirty,
    update,
    saveAll,
    reload,
  } = useTourWizard(id);

  const [step, setStep] =
    useState(0);

  const steps = [
    { key: "info", label: "Thông tin" },
    { key: "images", label: "Hình ảnh" },
    { key: "itinerary", label: "Lịch trình" },
    { key: "departure", label: "Khởi hành" },
    { key: "review", label: "Xác nhận" },
  ];

  const goNext = () => {
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const goPrev = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleDiscard = async () => {

    if (!isDirty) return;

    const result = await Swal.fire({
      title: "Hủy thay đổi?",
      text: "Hủy mọi thay đổi và tải lại dữ liệu từ database?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hủy thay đổi",
      cancelButtonText: "Đóng",
      confirmButtonColor: "#dc2626",
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "rounded-xl px-6 py-2",
        cancelButton: "rounded-xl px-6 py-2",
      },
    });

    if (!result.isConfirmed) return;

    void reload();
  };

  if (loading || !data) {
    return (
      <div className="p-6">
        Đang tải chi tiết tour…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">

      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">

          <div className="flex items-center gap-4">

            <div className="p-3 bg-slate-900 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Chi tiết Tour
              </h2>
              <p className="text-slate-500 font-medium">
                <Link to="/admin/tours" className="hover:text-slate-700 transition-colors">
                  ← Quay lại danh sách
                </Link>
              </p>
            </div>

          </div>

          <div className="flex flex-wrap items-center gap-3 justify-end">

            <div
              className={`
                text-sm
                font-bold
                px-4
                py-2
                rounded-2xl
                border
                transition-all
                duration-300
                flex
                items-center
                gap-2
                ${isDirty
                  ? "border-amber-300 bg-amber-50 text-amber-700"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700"}
              `}
            >
              <span className={isDirty ? "text-lg" : "text-lg"}>
                {isDirty ? "⚠️" : "✓"}
              </span>
              {isDirty ? "Chưa lưu" : "Đã lưu"}
            </div>

            {isDirty && (
              <button
                type="button"
                onClick={handleDiscard}
                disabled={saving}
                className="
                  px-4
                  py-2
                  rounded-2xl
                  border
                  border-slate-200
                  text-sm
                  font-semibold
                  text-slate-700
                  hover:bg-slate-50
                  transition-all
                  duration-300
                  disabled:opacity-50
                  hover:border-slate-300
                "
              >
                Hủy thay đổi
              </button>
            )}

          </div>

        </div>

        <TourStepBar
          steps={steps}
          current={step}
          setCurrent={setStep}
        />

        {step === 0 && (
          <TourInfoStep
            data={data.tour}
            onChange={(patch) =>
              update({
                tour: {
                  ...data.tour,
                  ...patch,
                },
              })
            }
          />
        )}

        {step === 1 && (
          <TourImagesStep
            data={data.images}
            onChange={(images) =>
              update({ images })
            }
          />
        )}

        {step === 2 && (
          <TourItineraryStep
            tourId={id}
            data={data.days}
            onChange={(days) =>
              update({ days })
            }
          />
        )}

        {step === 3 && (
          <TourDepartureStep
            data={data.departures}
            defaultMaxPeople={
              data.tour?.maxPeople > 0
                ? data.tour.maxPeople
                : 30
            }
            onChange={(departures) =>
              update({ departures })
            }
          />
        )}

        {step === 4 && (
          <TourReviewStep
            data={data}
            isDirty={isDirty}
            saving={saving}
            onSaveAll={saveAll}
            onBack={() => setStep(3)}
          />
        )}

        {step < 4 && (
          <div
            className="
              flex
              justify-between
              items-center
              gap-4
              mt-12
              pt-8
              border-t-2
              border-amber-200
            "
          >

            <button
              type="button"
              onClick={goPrev}
              disabled={step === 0 || saving}
              className="
                h-12
                px-6
                rounded-2xl
                border-2
                border-amber-300
                font-bold
                text-amber-700
                inline-flex
                items-center
                gap-2
                hover:bg-amber-50
                hover:shadow-md
                hover:shadow-amber-100
                transition-all
                duration-300
                disabled:opacity-40
                disabled:cursor-not-allowed
              "
            >

              <ChevronLeft size={20} />

              Quay lại

            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={saving}
              className="
                h-12
                px-7
                rounded-2xl
                bg-gradient-to-r
                from-amber-500
                to-amber-600
                hover:from-amber-600
                hover:to-amber-700
                text-white
                font-bold
                inline-flex
                items-center
                gap-2
                transition-all
                duration-300
                hover:shadow-lg
                hover:shadow-amber-200
                active:scale-95
                disabled:opacity-50
              "
            >

              Tiếp theo

              <ChevronRight size={20} />

            </button>

          </div>
        )}

      </div>

    </div>
  );
}
