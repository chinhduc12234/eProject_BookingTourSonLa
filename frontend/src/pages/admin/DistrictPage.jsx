import { useEffect, useState } from "react";

import {
  getDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
} from "../../api/districtApi";

import { getAllProvinces } from "../../api/provinceApi";

import Modal from "../../components/Modal";

import toast from "react-hot-toast";
import Swal from "sweetalert2";

import {
  Plus,
  Search,
  RefreshCcw,
  Edit3,
  Trash2,
  MapPinned,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpAZ,
} from "lucide-react";

export default function DistrictPage() {

  const [data, setData] = useState([]);

  const [provinces, setProvinces] = useState([]);

  const [name, setName] = useState("");

  const [provinceId, setProvinceId] =
    useState("");

  const [search, setSearch] = useState("");

  const [selectedProvince, setSelectedProvince] =
    useState("");

  const [sortBy, setSortBy] =
    useState("name");

  const [direction, setDirection] =
    useState("asc");

  const [open, setOpen] = useState(false);

  const [editId, setEditId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [tableLoading, setTableLoading] =
    useState(false);

  const [errors, setErrors] = useState({});

  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [totalElements, setTotalElements] =
    useState(0);

  const pageSize = 6;

  // ================= LOAD DATA =================

  const loadData = async () => {

    try {

      setTableLoading(true);

      const res = await getDistricts({
        page,
        size: pageSize,
        keyword: search,
        provinceId: selectedProvince,
        sortBy,
        direction,
      });

      setData(res.data.content);

      setTotalPages(res.data.totalPages);

      setTotalElements(
        res.data.totalElements
      );

    } catch (err) {

      toast.error(
        "Không thể tải danh sách quận huyện",
        {
          style: {
            borderRadius: "12px",
            background: "#334155",
            color: "#fff",
          },
        }
      );

    } finally {

      setTableLoading(false);
    }
  };

  // ================= LOAD PROVINCES =================

  const loadProvinces = async () => {

    try {

      const res = await getAllProvinces();

      setProvinces(res.data);

    } catch (err) {

      toast.error("Không thể tải tỉnh thành");
    }
  };

  // ================= EFFECT =================

  useEffect(() => {
    loadProvinces();
  }, []);

  useEffect(() => {
    loadData();
  }, [
    page,
    search,
    selectedProvince,
    sortBy,
    direction,
  ]);

  useEffect(() => {

    setPage(0);

  }, [
    search,
    selectedProvince,
    sortBy,
    direction,
  ]);

  // ================= RESET FILTER =================

  const handleResetFilter = () => {

    setSearch("");

    setSelectedProvince("");

    setSortBy("name");

    setDirection("asc");
  };

  // ================= SAVE =================

  const handleSave = async () => {

    const newErrors = {};

    if (!name.trim()) {

      newErrors.name =
        "Tên quận huyện không được để trống";

    } else if (name.trim().length < 2) {

      newErrors.name =
        "Tên quận huyện phải có ít nhất 2 ký tự";
    }

    if (!provinceId) {

      newErrors.provinceId =
        "Vui lòng chọn tỉnh thành";
    }

    if (Object.keys(newErrors).length > 0) {

      setErrors(newErrors);

      return;
    }

    try {

      setLoading(true);

      const payload = {
        name,
        provinceId,
      };

      if (editId) {

        await updateDistrict(editId, payload);

        toast.success(
          "Cập nhật quận huyện thành công!",
          {
            icon: "🗺️",
          }
        );

      } else {

        await createDistrict(payload);

        toast.success(
          "Thêm quận huyện thành công!",
          {
            icon: "🏔️",
          }
        );
      }

      setName("");

      setProvinceId("");

      setEditId(null);

      setOpen(false);

      loadData();

    } catch (err) {

      toast.error(
        err?.response?.data?.message ||
        "Thao tác thất bại"
      );

    } finally {

      setLoading(false);
    }
  };

  // ================= DELETE =================

  const handleDelete = async (id) => {

    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Dữ liệu này sẽ được chuyển vào kho lưu trữ",
      icon: "warning",

      showCancelButton: true,

      confirmButtonText: "Đồng ý xóa",

      cancelButtonText: "Hủy bỏ",

      confirmButtonColor: "#ef4444",

      cancelButtonColor: "#6b7280",

      customClass: {
        popup: "rounded-[24px]",
        confirmButton:
          "rounded-xl px-6 py-2",
        cancelButton:
          "rounded-xl px-6 py-2",
      },
    });

    if (result.isConfirmed) {

      try {

        await deleteDistrict(id);

        toast.success(
          "Đã xóa quận huyện"
        );

        loadData();

      } catch (err) {

        toast.error("Xóa thất bại");
      }
    }
  };

  // ================= UI =================

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 text-slate-800">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">

          <div className="flex items-center gap-4">

            <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-200">

              <MapPinned className="text-white w-8 h-8" />

            </div>

            <div>

              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Quận Huyện
              </h2>

              <p className="text-slate-500 font-medium italic">
                Hệ thống quản lý địa phương vùng cao
              </p>
            </div>
          </div>

          <button
            onClick={() => {

              setOpen(true);

              setEditId(null);

              setName("");

              setProvinceId("");

              setErrors({});
            }}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-amber-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl shadow-slate-200"
          >

            <Plus size={20} />

            <span className="font-bold">
              Thêm Quận Huyện
            </span>
          </button>
        </div>

        {/* FILTER */}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">

          {/* TOTAL */}

          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">

            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">

              <MapPinned size={24} />

            </div>

            <div>

              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tổng số
              </p>

              <h3 className="text-2xl font-black text-slate-800">
                {totalElements}
              </h3>
            </div>
          </div>

          {/* FILTER BOX */}

          <div className="lg:col-span-3 bg-white p-2 rounded-3xl shadow-sm border border-slate-100 flex flex-col xl:flex-row items-center gap-2">

            {/* SEARCH */}

            <div className="relative flex-1 w-full">

              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Tìm kiếm quận huyện hoặc tỉnh thành..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 focus:bg-white outline-none border-2 border-transparent focus:border-amber-500 transition-all text-sm"
              />
            </div>

            {/* FILTER PROVINCE */}

            <select
              value={selectedProvince}
              onChange={(e) =>
                setSelectedProvince(
                  e.target.value
                )
              }
              className="w-full xl:w-52 px-4 py-3 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500 text-sm"
            >

              <option value="">
                Tất cả tỉnh thành
              </option>

              {provinces.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                >
                  {p.name}
                </option>
              ))}
            </select>

            {/* SORT BY */}

            <div className="relative w-full xl:w-52">

              <ArrowUpAZ
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500 text-sm appearance-none"
              >

                <option value="name">
                  Sort quận huyện
                </option>

                <option value="province">
                  Sort tỉnh thành
                </option>
              </select>
            </div>

            {/* DIRECTION */}

            <select
              value={direction}
              onChange={(e) =>
                setDirection(e.target.value)
              }
              className="w-full xl:w-32 px-4 py-3 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500 text-sm"
            >

              <option value="asc">
                A-Z
              </option>

              <option value="desc">
                Z-A
              </option>
            </select>

            {/* RESET */}

            <button
              onClick={handleResetFilter}
              className="p-3 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
            >

              <RefreshCcw size={20} />
            </button>
          </div>
        </div>

        {/* TABLE */}

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse">

              <thead>

                <tr className="bg-slate-50/50">

                  <th className="px-8 py-5 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                    STT
                  </th>

                  <th className="px-8 py-5 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                    Quận Huyện
                  </th>

                  <th className="px-8 py-5 text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                    Tỉnh Thành
                  </th>

                  <th className="px-8 py-5 text-right text-[13px] font-bold text-slate-400 uppercase tracking-widest">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">

                {tableLoading ? (

                  <tr>
                    <td
                      colSpan={4}
                      className="py-20 text-center"
                    >

                      <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />

                      <p className="mt-4 text-slate-400 font-medium">
                        Đang tải dữ liệu...
                      </p>
                    </td>
                  </tr>

                ) : data.length === 0 ? (

                  <tr>
                    <td
                      colSpan={4}
                      className="py-20 text-center text-slate-400 font-medium italic"
                    >
                      Không tìm thấy dữ liệu phù hợp
                    </td>
                  </tr>

                ) : (

                  data.map((d, index) => (

                    <tr
                      key={d.id}
                      className="group hover:bg-slate-50/80 transition-all duration-300"
                    >

                      <td className="px-8 py-5 font-bold text-slate-400 text-sm">

                        #
                        {(
                          page * pageSize +
                          index +
                          1
                        )
                          .toString()
                          .padStart(2, "0")}
                      </td>

                      <td className="px-8 py-5">

                        <span className="font-semibold text-slate-700 group-hover:text-amber-600 transition-colors">
                          {d.name}
                        </span>
                      </td>

                      <td className="px-8 py-5">

                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                          {d.provinceName}
                        </span>
                      </td>

                      <td className="px-8 py-5">

                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">

                          <button
                            onClick={() => {

                              setEditId(d.id);

                              setName(d.name);

                              setProvinceId(
                                d.provinceId
                              );

                              setOpen(true);
                            }}
                            className="p-2.5 bg-white text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl shadow-sm border border-slate-100 transition-all"
                          >

                            <Edit3 size={18} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(d.id)
                            }
                            className="p-2.5 bg-white text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl shadow-sm border border-slate-100 transition-all"
                          >

                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}

        <div className="flex justify-between items-center mt-8 px-2">

          <p className="text-sm text-slate-500 font-medium">

            Trang{" "}

            <span className="text-slate-900 font-bold">
              {page + 1}
            </span>{" "}

            trên {totalPages || 1}
          </p>

          <div className="flex gap-2">

            <button
              disabled={page === 0}
              onClick={() =>
                setPage(page - 1)
              }
              className="p-2 bg-white rounded-xl border border-slate-200 disabled:opacity-30 hover:border-amber-500 transition-all"
            >

              <ChevronLeft size={20} />
            </button>

            <button
              disabled={
                page + 1 >= totalPages
              }
              onClick={() =>
                setPage(page + 1)
              }
              className="p-2 bg-white rounded-xl border border-slate-200 disabled:opacity-30 hover:border-amber-500 transition-all"
            >

              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* MODAL */}

        <Modal
          open={open}
          onClose={() => {

            setOpen(false);

            setErrors({});
          }}
        >

          <div className="p-2">

            <h3 className="text-2xl font-black text-slate-800 mb-2">

              {editId
                ? "Cập nhật quận huyện"
                : "Thêm mới quận huyện"}
            </h3>

            <p className="text-sm text-slate-500 mb-8 font-medium">
              Vui lòng nhập thông tin chính xác.
            </p>

            <div className="space-y-6">

              {/* NAME */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  Tên quận huyện
                </label>

                <input
                  value={name}
                  onChange={(e) => {

                    setName(e.target.value);

                    if (errors.name) {

                      setErrors({
                        ...errors,
                        name: "",
                      });
                    }
                  }}
                  placeholder="Ví dụ: Mộc Châu..."
                  className={`w-full px-5 py-4 rounded-[20px] bg-slate-50 outline-none border-2 transition-all ${errors.name
                    ? "border-rose-400 bg-rose-50"
                    : "border-transparent focus:border-amber-500 focus:bg-white"
                    }`}
                />

                {errors.name && (
                  <p className="text-rose-500 text-xs mt-2 font-bold ml-2 italic">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* PROVINCE */}

              <div>

                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  Tỉnh thành
                </label>

                <select
                  value={provinceId}
                  onChange={(e) => {

                    setProvinceId(
                      e.target.value
                    );

                    if (
                      errors.provinceId
                    ) {

                      setErrors({
                        ...errors,
                        provinceId: "",
                      });
                    }
                  }}
                  className={`w-full px-5 py-4 rounded-[20px] bg-slate-50 outline-none border-2 transition-all ${errors.provinceId
                    ? "border-rose-400 bg-rose-50"
                    : "border-transparent focus:border-amber-500 focus:bg-white"
                    }`}
                >

                  <option value="">
                    -- Chọn tỉnh thành --
                  </option>

                  {provinces.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                    >
                      {p.name}
                    </option>
                  ))}
                </select>

                {errors.provinceId && (
                  <p className="text-rose-500 text-xs mt-2 font-bold ml-2 italic">
                    {errors.provinceId}
                  </p>
                )}
              </div>

              {/* ACTIONS */}

              <div className="flex gap-3 pt-4">

                <button
                  onClick={() =>
                    setOpen(false)
                  }
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Hủy bỏ
                </button>

                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-[2] px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-amber-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                >

                  {loading && (
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />
                  )}

                  {editId
                    ? "Lưu thay đổi"
                    : "Khởi tạo ngay"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}