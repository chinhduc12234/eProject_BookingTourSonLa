import { Component } from "react";
import { Home, RefreshCcw, TriangleAlert } from "lucide-react";

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-4 py-12 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(127,183,126,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(166,111,53,0.2),transparent_40%)]" />
        <section className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#07120f]/90 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-10">
          <img
            src="/logo-main-tay-bac.png"
            alt="Tây Bắc Travel"
            className="mx-auto h-20 w-52 object-contain"
          />
          <span className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200">
            <TriangleAlert size={30} aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl font-black sm:text-4xl">
            Trang đang cần được tải lại
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
            Một lỗi giao diện không mong muốn vừa xảy ra. Dữ liệu trên máy chủ
            không bị thay đổi; bạn có thể tải lại trang hoặc trở về trang chủ.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary min-h-12 px-6"
            >
              <RefreshCcw size={18} aria-hidden="true" />
              Tải lại trang
            </button>
            <a href="/" className="btn-outline min-h-12 px-6">
              <Home size={18} aria-hidden="true" />
              Về trang chủ
            </a>
          </div>
        </section>
      </main>
    );
  }
}

