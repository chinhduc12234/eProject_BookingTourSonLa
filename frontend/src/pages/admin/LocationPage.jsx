import { useEffect, useState } from "react";

import {
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "../../api/locationApi";

import { getAllDistricts } from "../../api/districtApi";
import { getAllProvinces } from "../../api/provinceApi";
import { resolveUploadedFileUrl } from "../../api/userApi";

import Modal from "../../components/Modal";

import toast from "react-hot-toast";
import Swal from "sweetalert2";

import {
  Plus,
  Search,
  RefreshCcw,
  Edit3,
  Trash2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpAZ,
  Image as ImageIcon,
} from "lucide-react";

export default function LocationPage() {

  const [data, setData] = useState([]);

  const [districts, setDistricts] =
    useState([]);

  const [provinces, setProvinces] =
    useState([]);

  const [
    selectedProvince,
    setSelectedProvince,
  ] = useState("");

  const [name, setName] = useState("");

  const [districtId, setDistrictId] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [image, setImage] = useState("");

  const [search, setSearch] = useState("");

  const [selectedDistrict, setSelectedDistrict] =
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

      const res = await getLocations({
        page,
        size: pageSize,
        keyword: search,
        districtId: selectedDistrict,
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
        "Không thể tải danh sách địa điểm"
      );

    } finally {

      setTableLoading(false);
    }
  };

  // ================= LOAD DISTRICTS =================

  const loadDistricts = async () => {

    try {

      const res =
        await getAllDistricts();

      setDistricts(res.data);

    } catch (err) {

      toast.error(
        "Không thể tải quận huyện"
      );
    }
  };

  // ================= LOAD PROVINCES =================

  const loadProvinces = async () => {

    try {

      const res =
        await getAllProvinces();

      setProvinces(res.data);

    } catch (err) {

      toast.error(
        "Không thể tải tỉnh thành"
      );
    }
  };

  // ================= FILTER DISTRICTS =================

  const filteredDistricts =
    selectedProvince
      ? districts.filter(
        (d) =>
          String(d.provinceId) ===
          String(selectedProvince)
      )
      : districts;

  // ================= EFFECT =================

  useEffect(() => {

    loadDistricts();

    loadProvinces();

  }, []);

  useEffect(() => {

    loadData();

  }, [
    page,
    search,
    selectedDistrict,
    selectedProvince,
    sortBy,
    direction,
  ]);

  useEffect(() => {

    setPage(0);

  }, [
    search,
    selectedDistrict,
    selectedProvince,
    sortBy,
    direction,
  ]);

  // ================= RESET =================

  const handleResetFilter = () => {

    setSearch("");

    setSelectedDistrict("");

    setSelectedProvince("");

    setSortBy("name");

    setDirection("asc");
  };

  // ================= RESET FORM =================

  const resetForm = () => {

    setName("");

    setDistrictId("");

    setAddress("");

    setDescription("");

    setImage("");

    setEditId(null);

    setErrors({});
  };

  // ================= SAVE =================

  const handleSave = async () => {

    const newErrors = {};

    if (!name.trim()) {

      newErrors.name =
        "Tên địa điểm không được để trống";
    }

    if (!districtId) {

      newErrors.districtId =
        "Vui lòng chọn quận huyện";
    }

    if (Object.keys(newErrors).length > 0) {

      setErrors(newErrors);

      return;
    }

    try {

      setLoading(true);

      const payload = {
        name,
        districtId,
        address,
        description,
        image,
      };

      if (editId) {

        await updateLocation(
          editId,
          payload
        );

        toast.success(
          "Cập nhật địa điểm thành công!"
        );

      } else {

        await createLocation(payload);

        toast.success(
          "Thêm địa điểm thành công!"
        );
      }

      resetForm();

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
      text: "Địa điểm sẽ được lưu vào kho lưu trữ",
      icon: "warning",

      showCancelButton: true,

      confirmButtonText:
        "Đồng ý xóa",

      cancelButtonText: "Hủy bỏ",

      confirmButtonColor: "#ef4444",

      cancelButtonColor: "#64748b",
    });

    if (result.isConfirmed) {

      try {

        await deleteLocation(id);

        toast.success(
          "Đã xóa địa điểm"
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

              <MapPin className="text-white w-8 h-8" />

            </div>

            <div>

              <h2 className="text-3xl font-extrabold text-slate-900">
                Địa điểm
              </h2>

              <p className="text-slate-500 italic font-medium">
                Quản lý các địa điểm du lịch
              </p>
            </div>
          </div>

          <button
            onClick={() => {

              resetForm();

              setOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-900 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl transition-all shadow-lg"
          >

            <Plus size={20} />

            <span className="font-bold">
              Thêm địa điểm
            </span>
          </button>
        </div>

        {/* FILTER */}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-8">

          {/* TOTAL */}

          <div className="xl:col-span-2 bg-white px-5 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">

              <MapPin size={24} />

            </div>

            <div>

              <p className="text-xs uppercase tracking-widest font-bold text-slate-400">
                Tổng số
              </p>

              <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">
                {totalElements}
              </h3>
            </div>
          </div>

          {/* FILTER BOX */}
          <div className="xl:col-span-10 bg-white p-3 rounded-3xl border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3">

              {/* SEARCH - Giữ nguyên */}
              <div className="relative xl:col-span-3">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none transition-all"
                />
              </div>

              {/* PROVINCE - Giữ nguyên */}
              <div className="xl:col-span-2">
                <select
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value);
                    setSelectedDistrict("");
                  }}
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Tỉnh thành</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* DISTRICT - Giữ nguyên */}
              <div className="xl:col-span-2">
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Quận huyện</option>
                  {filteredDistricts.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* SORT - TĂNG LÊN 3 CỘT (Để rộng ra) */}
              <div className="relative xl:col-span-3">
                <ArrowUpAZ
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500 appearance-none cursor-pointer"
                >
                  <option value="name">Sắp xếp theo địa điểm</option>
                  <option value="district">Sắp xếp theo quận huyện</option>
                  <option value="province">Sắp xếp theo tỉnh thành</option>
                </select>
              </div>

              {/* DIRECTION & RESET - GIẢM XUỐNG 2 CỘT (Để bé lại) */}
              <div className="xl:col-span-2 flex gap-2">
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  className="flex-1 h-12 px-4 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500 font-medium cursor-pointer"
                >
                  <option value="asc">A-Z</option>
                  <option value="desc">Z-A</option>
                </select>

                <button
                  onClick={handleResetFilter}
                  className="w-14 h-12 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all bg-slate-50 shrink-0"
                  title="Đặt lại bộ lọc"
                >
                  <RefreshCcw size={20} />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="admin-responsive-table admin-wide-table w-full text-left">

              <thead>

                <tr className="bg-slate-50">

                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-400">
                    STT
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-400">
                    Hình ảnh
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-400">
                    Địa điểm
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-400">
                    Quận / Huyện
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-400">
                    Tỉnh / Thành phố
                  </th>

                  <th className="px-6 py-5 text-right text-xs font-bold uppercase text-slate-400">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">

                {tableLoading ? (

                  <tr>
                    <td
                      colSpan={6}
                      className="py-20 text-center"
                    >

                      <Loader2 className="w-10 h-10 animate-spin mx-auto text-amber-500" />

                      <p className="mt-4 text-slate-400">
                        Đang tải dữ liệu...
                      </p>
                    </td>
                  </tr>

                ) : data.length === 0 ? (

                  <tr>
                    <td
                      colSpan={6}
                      className="py-20 text-center text-slate-400 italic"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>

                ) : (

                  data.map((l, index) => (

                    <tr
                      key={l.id}
                      className="hover:bg-slate-50 transition-all group"
                    >

                      {/* STT */}

                      <td data-label="Số thứ tự" className="px-6 py-5 font-bold text-slate-400">

                        #
                        {(
                          page *
                          pageSize +
                          index +
                          1
                        )
                          .toString()
                          .padStart(2, "0")}
                      </td>

                      {/* IMAGE */}

                      <td data-label="Hình ảnh" className="px-6 py-5">

                        {l.image ? (

                          <img
                            src={resolveUploadedFileUrl(l.image)}
                            alt={l.name}
                            className="w-24 h-16 object-cover rounded-2xl border border-slate-100"
                          />

                        ) : (

                          <div className="w-24 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">

                            <ImageIcon
                              size={22}
                            />
                          </div>
                        )}
                      </td>

                      {/* LOCATION */}

                      <td data-label="Địa điểm" className="px-6 py-5 min-w-[260px]">

                        <div>

                          <h4 className="font-bold text-slate-700 text-base group-hover:text-amber-600 transition-colors">
                            {l.name}
                          </h4>

                          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                            {l.address || "Chưa có địa chỉ"}
                          </p>
                        </div>
                      </td>

                      {/* DISTRICT */}

                      <td data-label="Quận huyện" className="px-6 py-5">

                        <span className="inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold whitespace-nowrap">

                          {l.districtName}
                        </span>
                      </td>

                      {/* PROVINCE */}

                      <td data-label="Tỉnh thành" className="px-6 py-5">

                        <span className="inline-flex px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold whitespace-nowrap">

                          {l.provinceName}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td data-label="Thao tác" className="px-6 py-5">

                        <div className="flex justify-end gap-2 transition-all">

                          <button
                            onClick={() => {

                              setEditId(
                                l.id
                              );

                              setName(
                                l.name
                              );

                              setDistrictId(
                                l.districtId
                              );

                              setAddress(
                                l.address ||
                                ""
                              );

                              setDescription(
                                l.description ||
                                ""
                              );

                              setImage(
                                l.image ||
                                ""
                              );

                              setOpen(
                                true
                              );
                            }}
                            aria-label={`Chỉnh sửa ${l.name}`}
                            title="Chỉnh sửa địa điểm"
                            className="p-2.5 rounded-xl bg-white border border-slate-100 text-amber-500 hover:bg-amber-500 hover:text-white transition-all"
                          >

                            <Edit3 size={18} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                l.id
                              )
                            }
                            aria-label={`Xóa ${l.name}`}
                            title="Xóa địa điểm"
                            className="p-2.5 rounded-xl bg-white border border-slate-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
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

        <div className="flex justify-between items-center mt-8">

          <p className="text-sm text-slate-500">

            Trang{" "}

            <span className="font-bold text-slate-800">
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
              className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30"
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
              className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30"
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
          className="max-w-5xl"
        >
          <div className="w-full">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-800">
                  {editId ? "Cập nhật địa điểm" : "Thêm địa điểm mới"}
                </h3>
                <p className="text-slate-500 mt-1 text-base">
                  Quản lý thông tin địa điểm du lịch chi tiết
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">

              {/* CỘT TRÁI: NHẬP LIỆU */}
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">Tên địa điểm</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên địa điểm..."
                    className="w-full h-[56px] px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none transition-all shadow-sm"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-2 ml-2">{errors.name}</p>}
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">Quận / Huyện</label>
                  <select
                    value={districtId}
                    onChange={(e) => setDistrictId(e.target.value)}
                    className="w-full h-[56px] px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none transition-all cursor-pointer shadow-sm"
                  >
                    <option value="">-- Chọn quận huyện --</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.districtId && <p className="text-xs text-red-500 mt-2 ml-2">{errors.districtId}</p>}
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">Địa chỉ</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ chi tiết..."
                    className="w-full h-[56px] px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* CỘT PHẢI: HÌNH ẢNH & MÔ TẢ */}
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">Đường dẫn hình ảnh</label>
                  <input
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Dán URL hình ảnh vào đây..."
                    className="w-full h-[56px] px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none transition-all shadow-sm"
                  />
                  {image && (
                    <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-inner h-[140px]">
                      <img src={resolveUploadedFileUrl(image)} alt="Xem trước hình ảnh" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">Mô tả</label>
                  <textarea
                    rows={image ? 2 : 8} // Tự động co giãn nếu có ảnh preview
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả ngắn gọn về địa điểm..."
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 focus:bg-white outline-none transition-all resize-none shadow-sm"
                  />
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="lg:col-span-2 pt-6 mt-4 border-t border-slate-100 flex justify-end gap-4">
                <button
                  onClick={() => setOpen(false)}
                  className="px-8 h-[54px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="min-w-[200px] h-[54px] px-8 rounded-xl bg-slate-900 hover:bg-amber-600 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50"
                >
                  {loading && <Loader2 className="animate-spin" size={18} />}
                  {editId ? "Lưu thay đổi" : "Khởi tạo ngay"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
