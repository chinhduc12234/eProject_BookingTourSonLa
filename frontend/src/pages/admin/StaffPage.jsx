import { useCallback, useEffect, useState } from "react";

import {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  uploadStaffAvatar,
} from "../../api/staffApi";

import Modal from "../../components/Modal";
import { resolveUploadedFileUrl } from "../../api/userApi";

import toast from "react-hot-toast";
import Swal from "sweetalert2";

import {
  Plus,
  Search,
  RefreshCcw,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  User,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  UploadCloud,
} from "lucide-react";

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("vi-VN").format(new Date(`${value}T00:00:00`))
    : "Chưa cập nhật";

export default function StaffPage() {

  const [data, setData] = useState([]);

  const [open, setOpen] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [tableLoading, setTableLoading] =
    useState(false);

  const [uploadingAvatar, setUploadingAvatar] =
    useState(false);

  const [errors, setErrors] = useState({});

  const [editId, setEditId] =
    useState(null);

  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [totalElements, setTotalElements] =
    useState(0);

  const pageSize = 10;

  // ================= FORM =================

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [avatar, setAvatar] =
    useState("");

  const [gender, setGender] =
    useState("OTHER");

  const [dateOfBirth, setDateOfBirth] =
    useState("");

  const [isActive, setIsActive] =
    useState(true);

  // ================= FILTER =================

  const [search, setSearch] =
    useState("");

  const [filterGender, setFilterGender] =
    useState("");

  const [filterActive, setFilterActive] =
    useState("");

  const [sortBy, setSortBy] =
    useState("fullName");

  const [direction, setDirection] =
    useState("asc");

  // ================= LOAD DATA =================

  const loadData = useCallback(async () => {

    try {

      setTableLoading(true);

      const params = {
        page,
        size: pageSize,
        sortBy,
        direction,
      };

      if (search.trim()) {
        params.keyword = search.trim();
      }

      if (filterGender) {
        params.gender = filterGender;
      }

      if (filterActive !== "") {
        params.isActive =
          filterActive === "true";
      }

      const res =
        await getAllStaff(params);

      setData(res.data.content);

      setTotalPages(
        res.data.totalPages
      );

      setTotalElements(
        res.data.totalElements
      );

    } catch {

      toast.error(
        "Không thể tải danh sách nhân viên"
      );

    } finally {

      setTableLoading(false);
    }
  }, [direction, filterActive, filterGender, page, search, sortBy]);

  // ================= EFFECT =================

  useEffect(() => {

    loadData();

  }, [loadData]);

  useEffect(() => {

    setPage(0);

  }, [
    search,
    filterGender,
    filterActive,
    sortBy,
    direction,
  ]);

  // ================= RESET FORM =================

  const resetForm = () => {

    setFullName("");

    setEmail("");

    setPhone("");

    setPassword("");

    setAvatar("");

    setGender("OTHER");

    setDateOfBirth("");

    setIsActive(true);

    setErrors({});

    setEditId(null);
  };

  // ================= VALIDATE =================

  const validateForm = () => {

    const newErrors = {};

    if (!fullName.trim()) {

      newErrors.fullName =
        "Tên đầy đủ là bắt buộc";
    }

    if (!email.trim()) {

      newErrors.email =
        "Email là bắt buộc";

    } else if (!email.includes("@")) {

      newErrors.email =
        "Email không hợp lệ";
    }

    if (!phone.trim()) {

      newErrors.phone =
        "Số điện thoại là bắt buộc";

    } else if (
      !/^\d{10,20}$/.test(phone)
    ) {

      newErrors.phone =
        "Số điện thoại phải từ 10-20 chữ số";
    }

    if (!editId && !password.trim()) {

      newErrors.password =
        "Mật khẩu là bắt buộc";

    } else if (
      password &&
      password.length < 6
    ) {

      newErrors.password =
        "Mật khẩu phải ít nhất 6 ký tự";
    }

    if (
      avatar &&
      avatar.length > 500
    ) {

      newErrors.avatar =
        "URL avatar không được vượt quá 500 ký tự";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Ảnh đại diện chỉ hỗ trợ JPG, PNG, WEBP hoặc GIF");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh đại diện không được vượt quá 5MB");
      return;
    }

    try {
      setUploadingAvatar(true);

      const response = await uploadStaffAvatar(file);

      setAvatar(response.data.url);
      setErrors((current) => ({
        ...current,
        avatar: "",
      }));

      toast.success("Đã tải ảnh nhân viên từ máy tính");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
        "Không thể tải ảnh nhân viên"
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ================= SAVE =================

  const handleSave = async () => {

    if (!validateForm()) return;

    try {

      setLoading(true);

      if (editId) {

        const updateData = {
          fullName,
          email,
          phone,
          avatar,
          gender,
          dateOfBirth:
            dateOfBirth || null,
          isActive,
        };

        await updateStaff(
          editId,
          updateData
        );

        toast.success(
          "Cập nhật nhân viên thành công"
        );

      } else {

        const createData = {
          fullName,
          email,
          phone,
          password,
          avatar,
          gender,
          dateOfBirth:
            dateOfBirth || null,
        };

        await createStaff(createData);

        toast.success(
          "Tạo nhân viên thành công"
        );
      }

      resetForm();

      setOpen(false);

      loadData();

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Không thể lưu nhân viên"
      );

    } finally {

      setLoading(false);
    }
  };

  // ================= EDIT =================

  const handleEdit = (staff) => {

    setEditId(staff.id);

    setFullName(staff.fullName);

    setEmail(staff.email);

    setPhone(staff.phone);

    setAvatar(staff.avatar || "");

    setGender(
      staff.gender || "OTHER"
    );

    setDateOfBirth(
      staff.dateOfBirth || ""
    );

    setIsActive(staff.isActive);

    setOpen(true);
  };

  // ================= DELETE =================

  const handleDelete = async (staff) => {

    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc muốn xóa ${staff.fullName}?`,
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

        await deleteStaff(staff.id);

        toast.success(
          "Xóa nhân viên thành công"
        );

        loadData();

      } catch {

        toast.error(
          "Không thể xóa nhân viên"
        );
      }
    }
  };

  return (

    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 text-slate-800">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">

          <div className="flex items-center gap-4">

            <div className="p-3 bg-[#2f7d55] rounded-2xl shadow-lg shadow-emerald-900/20">

              <User className="text-white w-8 h-8" />

            </div>

            <div>

              <h2 className="text-3xl font-extrabold text-slate-900">
                Nhân viên
              </h2>

              <p className="text-slate-500 italic font-medium">
                Quản lý thông tin nhân viên hệ thống
              </p>

            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-900 hover:bg-[#2f7d55] text-white px-6 py-3 rounded-2xl transition-all shadow-lg"
          >

            <Plus size={20} />

            <span className="font-bold">
              Thêm nhân viên
            </span>
          </button>
        </div>

        {/* FILTER */}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-8">

          {/* TOTAL */}

          <div className="xl:col-span-2 bg-white px-5 py-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">

            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0">

              <User size={24} />

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

              {/* SEARCH */}

              <div className="relative xl:col-span-3">

                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="text"
                  placeholder="Tìm nhân viên..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-600 outline-none transition-all"
                />
              </div>

              {/* GENDER */}

              <div className="xl:col-span-2">

                <select
                  value={filterGender}
                  onChange={(e) =>
                    setFilterGender(
                      e.target.value
                    )
                  }
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-emerald-600 cursor-pointer"
                >
                  <option value="">
                    Giới tính
                  </option>

                  <option value="MALE">
                    Nam
                  </option>

                  <option value="FEMALE">
                    Nữ
                  </option>

                  <option value="OTHER">
                    Khác
                  </option>
                </select>
              </div>

              {/* STATUS */}

              <div className="xl:col-span-2">

                <select
                  value={filterActive}
                  onChange={(e) =>
                    setFilterActive(
                      e.target.value
                    )
                  }
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-emerald-600 cursor-pointer"
                >
                  <option value="">
                    Trạng thái
                  </option>

                  <option value="true">
                    Hoạt động
                  </option>

                  <option value="false">
                    Vô hiệu
                  </option>
                </select>
              </div>

              {/* SORT */}

              <div className="xl:col-span-3">

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value
                    )
                  }
                  className="w-full h-12 px-4 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-emerald-600 cursor-pointer"
                >

                  <option value="fullName">
                    Sắp xếp theo tên
                  </option>

                  <option value="email">
                    Sắp xếp theo email
                  </option>

                  <option value="phone">
                    Sắp xếp theo số điện thoại
                  </option>

                  <option value="dateOfBirth">
                    Sắp xếp theo ngày sinh
                  </option>

                  <option value="createdAt">
                    Sắp xếp theo ngày tạo
                  </option>
                </select>
              </div>

              {/* DIRECTION */}

              <div className="xl:col-span-2 flex gap-2">

                <select
                  value={direction}
                  onChange={(e) =>
                    setDirection(
                      e.target.value
                    )
                  }
                  className="flex-1 h-12 px-4 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-emerald-600 font-medium cursor-pointer"
                >
                  <option value="asc">
                    A-Z
                  </option>

                  <option value="desc">
                    Z-A
                  </option>
                </select>

                <button
                  onClick={() => {

                    setSearch("");

                    setFilterGender("");

                    setFilterActive("");

                    setSortBy("fullName");

                    setDirection("asc");

                    setPage(0);
                  }}
                  className="w-14 h-12 flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl transition-all bg-slate-50 shrink-0"
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
                    Nhân viên
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-400">
                    Email
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-400">
                    Số điện thoại
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-400">
                    Giới tính
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-400">
                    Ngày sinh
                  </th>

                  <th className="px-6 py-5 text-xs font-bold uppercase text-slate-400">
                    Trạng thái
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
                      colSpan={7}
                      className="py-20 text-center"
                    >

                      <Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-600" />

                      <p className="mt-4 text-slate-400">
                        Đang tải dữ liệu...
                      </p>
                    </td>
                  </tr>

                ) : data.length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="py-20 text-center text-slate-400 italic"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>

                ) : (

                  data.map((staff) => (

                    <tr
                      key={staff.id}
                      className="hover:bg-slate-50 transition-all group"
                    >

                      {/* STAFF */}

                      <td data-label="Nhân viên" className="px-6 py-5 min-w-[280px]">

                        <div className="flex items-center gap-3">

                          {staff.avatar ? (

                            <img
                              src={resolveUploadedFileUrl(staff.avatar)}
                              alt={staff.fullName}
                              className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
                            />

                          ) : (

                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">

                              <User className="w-6 h-6 text-slate-400" />
                            </div>
                          )}

                          <div>

                            <p className="font-bold text-slate-800">
                              {staff.fullName}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              #{staff.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}

                      <td data-label="Email" className="px-6 py-5">

                        <div className="flex items-center gap-2 text-slate-600">

                          <Mail size={16} />

                          <span className="text-sm">
                            {staff.email}
                          </span>
                        </div>
                      </td>

                      {/* PHONE */}

                      <td data-label="Số điện thoại" className="px-6 py-5">

                        <div className="flex items-center gap-2 text-slate-600">

                          <Phone size={16} />

                          <span className="text-sm">
                            {staff.phone}
                          </span>
                        </div>
                      </td>

                      {/* GENDER */}

                      <td data-label="Giới tính" className="px-6 py-5">

                        <span className="inline-flex px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold whitespace-nowrap">

                          {staff.gender === "MALE"
                            ? "Nam"
                            : staff.gender === "FEMALE"
                              ? "Nữ"
                              : "Khác"}
                        </span>
                      </td>

                      {/* DOB */}

                      <td data-label="Ngày sinh" className="px-6 py-5 text-sm text-slate-500">

                        {formatDate(staff.dateOfBirth)}
                      </td>

                      {/* STATUS */}

                      <td data-label="Trạng thái" className="px-6 py-5">

                        {staff.isActive ? (

                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">

                            <CheckCircle size={14} />

                            Hoạt động
                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold">

                            <XCircle size={14} />

                            Vô hiệu
                          </span>
                        )}
                      </td>

                      {/* ACTION */}

                      <td data-label="Thao tác" className="px-6 py-5">

                        <div className="flex justify-end gap-2 transition-all">

                          <button
                            onClick={() =>
                              handleEdit(staff)
                            }
                            aria-label={`Chỉnh sửa ${staff.fullName}`}
                            title="Chỉnh sửa nhân viên"
                            className="p-2.5 rounded-xl bg-white border border-slate-100 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                          >

                            <Edit3 size={18} />
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(staff)
                            }
                            aria-label={`Xóa ${staff.fullName}`}
                            title="Xóa nhân viên"
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
            resetForm();
          }}
          className="max-w-5xl"
        >

          <div className="w-full">

            <div className="flex items-start justify-between mb-8">

              <div>

                <h3 className="text-3xl font-black text-slate-800">

                  {editId
                    ? "Cập nhật nhân viên"
                    : "Thêm nhân viên mới"}
                </h3>

                <p className="text-slate-500 mt-1 text-base">
                  Quản lý thông tin nhân viên chi tiết
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">

              {/* LEFT */}

              <div className="space-y-5">

                <div>

                  <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">
                    Tên đầy đủ
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    placeholder="Nhập tên đầy đủ..."
                    className="w-full h-[56px] px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-600 focus:bg-white outline-none transition-all shadow-sm"
                  />

                  {errors.fullName && (
                    <p className="text-xs text-red-500 mt-2 ml-2">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>

                  <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    disabled={editId}
                    onChange={(e) =>
                      setEmail(
                        e.target.value
                      )
                    }
                    placeholder="Nhập email..."
                    className={`w-full h-[56px] px-5 rounded-2xl border-2 outline-none transition-all shadow-sm ${
                      editId
                        ? "bg-slate-100 border-slate-100"
                        : "bg-slate-50 border-transparent focus:border-emerald-600 focus:bg-white"
                    }`}
                  />

                  {errors.email && (
                    <p className="text-xs text-red-500 mt-2 ml-2">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>

                  <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">
                    Số điện thoại
                  </label>

                  <input
                    type="text"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    placeholder="Nhập số điện thoại..."
                    className="w-full h-[56px] px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-600 focus:bg-white outline-none transition-all shadow-sm"
                  />

                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-2 ml-2">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {!editId && (

                  <div>

                    <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">
                      Mật khẩu
                    </label>

                    <input
                      type="password"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Nhập mật khẩu..."
                      className="w-full h-[56px] px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-600 focus:bg-white outline-none transition-all shadow-sm"
                    />

                    {errors.password && (
                      <p className="text-xs text-red-500 mt-2 ml-2">
                        {errors.password}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT */}

              <div className="space-y-5">

                <div>

                  <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">
                    Ảnh đại diện nhân viên
                  </label>

                  <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                    <div className="relative h-40 w-40 overflow-hidden rounded-3xl border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50 shadow-sm">
                      {avatar ? (
                        <img
                          src={resolveUploadedFileUrl(avatar)}
                          alt="Xem trước ảnh đại diện nhân viên"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
                          <ImageIcon size={38} />
                          <span className="text-xs font-bold">Chưa chọn ảnh</span>
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-3">
                      <label
                        className={[
                          "flex min-h-[88px] w-full items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-3 transition",
                          uploadingAvatar
                            ? "cursor-wait border-emerald-300 bg-emerald-50"
                            : "cursor-pointer border-slate-300 bg-slate-50 hover:border-emerald-500 hover:bg-emerald-50",
                        ].join(" ")}
                      >
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          disabled={uploadingAvatar}
                          hidden
                          onChange={handleAvatarUpload}
                        />

                        {uploadingAvatar ? (
                          <Loader2
                            size={26}
                            className="shrink-0 animate-spin text-emerald-700"
                          />
                        ) : (
                          <UploadCloud
                            size={28}
                            className="shrink-0 text-emerald-700"
                          />
                        )}

                        <span className="min-w-0">
                          <span className="block text-sm font-black text-slate-800">
                            {uploadingAvatar
                              ? "Đang tải ảnh lên..."
                              : "Chọn ảnh từ máy tính"}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">
                            JPG, PNG, WEBP hoặc GIF · tối đa 5MB
                          </span>
                        </span>
                      </label>

                      <input
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder="Hoặc dán đường dẫn ảnh..."
                        className="w-full h-[50px] px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all shadow-sm"
                      />

                      {errors.avatar && (
                        <p className="text-xs font-bold text-rose-500">
                          {errors.avatar}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">
                      Giới tính
                    </label>

                    <select
                      value={gender}
                      onChange={(e) =>
                        setGender(
                          e.target.value
                        )
                      }
                      className="w-full h-[56px] px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-600 focus:bg-white outline-none transition-all cursor-pointer shadow-sm"
                    >

                      <option value="OTHER">
                        Khác
                      </option>

                      <option value="MALE">
                        Nam
                      </option>

                      <option value="FEMALE">
                        Nữ
                      </option>
                    </select>
                  </div>

                  <div>

                    <label className="text-sm font-bold text-slate-700 mb-2 block ml-1">
                      Ngày sinh
                    </label>

                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) =>
                        setDateOfBirth(
                          e.target.value
                        )
                      }
                      className="w-full h-[56px] px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-600 focus:bg-white outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                {editId && (

                  <div className="pt-2">

                    <label className="flex items-center gap-3">

                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) =>
                          setIsActive(
                            e.target.checked
                          )
                        }
                        className="w-5 h-5 rounded border-slate-300"
                      />

                      <span className="font-semibold text-slate-700">
                        Kích hoạt tài khoản
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* ACTION */}

              <div className="lg:col-span-2 pt-6 mt-4 border-t border-slate-100 flex justify-end gap-4">

                <button
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="px-8 h-[54px] rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold transition-all"
                >
                  Hủy bỏ
                </button>

                <button
                  onClick={handleSave}
                  disabled={loading || uploadingAvatar}
                  className="min-w-[200px] h-[54px] px-8 rounded-xl bg-slate-900 hover:bg-[#2f7d55] text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200 disabled:opacity-50"
                >

                  {(loading || uploadingAvatar) && (
                    <Loader2
                      className="animate-spin"
                      size={18}
                    />
                  )}

                  {editId
                    ? "Lưu thay đổi"
                    : uploadingAvatar
                      ? "Đang tải ảnh..."
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
