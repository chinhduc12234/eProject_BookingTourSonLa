import { Outlet, Link } from "react-router-dom";

export default function AdminLayout() {

  return (

    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}

      <aside className="w-[220px] p-4 bg-gray-900 text-white">

        <h3 className="font-bold mb-4">
          ADMIN
        </h3>

        <nav className="flex flex-col gap-2">

          <Link to="/admin">
            Dashboard
          </Link>

          <Link to="/admin/staff">
            Nhân viên
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