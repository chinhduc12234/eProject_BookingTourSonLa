import { Outlet, Link } from "react-router-dom";

export default function AdminLayout() {

  return (

    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}

      <aside className="w-[220px] p-4 bg-gray-900 text-white">

        <Link to="/admin" className="mb-5 block">
          <img
            src="/logo-main-tay-bac.png"
            alt="Tây Bắc Travel"
            className="h-20 w-full object-contain drop-shadow-[0_10px_22px_rgba(127,183,126,0.35)]"
          />
        </Link>

        <h3 className="font-bold mb-4">
          ADMIN
        </h3>

        <nav className="flex flex-col gap-2">

          <Link to="/admin">
            Dashboard
          </Link>

          <Link to="/admin/staff">
            Staff
          </Link>

          <Link to="/admin/provinces">
            Provinces
          </Link>

          <Link to="/admin/districts">
            Districts
          </Link>

          <Link to="/admin/locations">
            Locations
          </Link>

          <Link to="/admin/tours">
            Tours
          </Link>

        </nav>
      </aside>

      {/* CONTENT */}

      <main className="flex-1 bg-white overflow-auto">

        <Outlet />

      </main>

    </div>
  );
}
