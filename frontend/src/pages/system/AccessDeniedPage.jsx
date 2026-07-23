import { ArrowRight, Home, ShieldX } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "../public/PublicLayout";
import { scenicImages } from "../public/publicContent";
import { getRole, roleHomePath } from "../../utils/auth";

const roleLabels = {
  ADMIN: "trung tâm điều hành",
  EMPLOYEE: "không gian nhân viên",
  CUSTOMER: "tài khoản khách hàng",
};

export default function AccessDeniedPage() {
  const role = getRole();
  const destination = roleHomePath(role);

  return (
    <PublicLayout>
      <section className="relative isolate flex min-h-[calc(100svh-80px)] items-center overflow-hidden bg-[#020617] px-4 py-16">
        <img
          src={scenicImages.taXuaRidge}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#020617] via-[#04120d]/95 to-[#020617]/70" />

        <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="hidden lg:block">
            <div className="text-[8rem] font-black leading-none text-white/[0.07]">
              403
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-[#07120f]/88 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
            <span className="section-tag">
              <ShieldX size={14} aria-hidden="true" />
              Quyền truy cập
            </span>
            <h1 className="mt-5 text-3xl font-black text-white sm:text-5xl">
              Khu vực này không thuộc vai trò của bạn
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Hệ thống đã giữ nguyên phiên đăng nhập và dữ liệu của bạn. Hãy
              quay về {roleLabels[role] || "khu vực phù hợp"} để tiếp tục công
              việc.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={destination} className="btn-primary min-h-12 px-6">
                Về khu vực của tôi
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link to="/" className="btn-outline min-h-12 px-6">
                <Home size={18} aria-hidden="true" />
                Xem trang chủ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

