import { ArrowLeft, Compass, MapPinned } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import PublicLayout from "../public/PublicLayout";
import { scenicImages } from "../public/publicContent";

export default function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <PublicLayout>
      <section className="relative isolate flex min-h-[calc(100svh-80px)] items-center overflow-hidden bg-[#020617] px-4 py-16">
        <img
          src={scenicImages.sonLaLandscape}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#020617]/95 via-[#04120d]/92 to-[#020617]/75" />

        <div className="mx-auto w-full max-w-4xl text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#7FB77E]/30 bg-[#7FB77E]/12 text-[#9de09c] shadow-soft-green">
            <MapPinned size={29} aria-hidden="true" />
          </span>
          <p className="mt-6 text-sm font-black uppercase tracking-[0.32em] text-[#d4a878]">
            Lạc khỏi hành trình · 404
          </p>
          <h1 className="mt-4 text-4xl font-black text-white sm:text-6xl">
            Không tìm thấy điểm đến này
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Địa chỉ <span className="font-bold text-white">{pathname}</span> có
            thể đã được thay đổi. Bạn có thể trở về trang chủ hoặc tiếp tục khám
            phá các tour đang mở bán.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/" className="btn-primary min-h-12 px-6">
              <ArrowLeft size={18} aria-hidden="true" />
              Về trang chủ
            </Link>
            <Link to="/tours" className="btn-outline min-h-12 px-6">
              <Compass size={18} aria-hidden="true" />
              Khám phá tour
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

