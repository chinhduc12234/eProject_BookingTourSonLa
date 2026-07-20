import { useEffect, useState } from "react";

import {
    getTours,
    createTour,
    updateTour,
    deleteTour,
    uploadTourThumbnail,
} from "../../api/tourApi";
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
    ChevronLeft,
    ChevronRight,
    Loader2,
    Image as ImageIcon,
    MapPinned,
    Clock3,
    Users,
    BadgeDollarSign,
    Upload,
    Link2,
    AlertTriangle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

function normalizeMoneyInput(value) {
    return value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
}

export default function TourPage() {

    const [data, setData] = useState([]);
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);

    const [loading, setLoading] =
        useState(false);

    const [tableLoading, setTableLoading] =
        useState(false);

    const [uploadingImage, setUploadingImage] =
        useState(false);

    const [errors, setErrors] =
        useState({});

    const [editId, setEditId] =
        useState(null);

    const [page, setPage] = useState(0);

    const [totalPages, setTotalPages] =
        useState(0);

    const [totalElements, setTotalElements] =
        useState(0);

    const [search, setSearch] =
        useState("");

    const [debouncedSearch, setDebouncedSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("");

    const [loadError, setLoadError] =
        useState(false);

    // ================= IMAGE =================

    const [imageMode, setImageMode] =
        useState("url");

    // ================= FORM =================

    const [title, setTitle] =
        useState("");

    const [slug, setSlug] =
        useState("");

    const [thumbnail, setThumbnail] =
        useState("");

    const [
        shortDescription,
        setShortDescription,
    ] = useState("");

    const [durationDays, setDurationDays] =
        useState("");

    const [
        durationNights,
        setDurationNights,
    ] = useState("");

    const [
        departureLocation,
        setDepartureLocation,
    ] = useState("");

    const [maxPeople, setMaxPeople] =
        useState("");

    const [price, setPrice] =
        useState("");

    const [status, setStatus] =
        useState("DRAFT");

    const pageSize = 8;

    // ================= LOAD DATA =================

    const loadData = async () => {

        try {

            setTableLoading(true);

            setLoadError(false);

            const res = await getTours({
                page,
                size: pageSize,
                keyword: debouncedSearch,
                status: statusFilter,
            });

            setData(res.data.content);

            setTotalPages(res.data.totalPages);

            setTotalElements(
                res.data.totalElements
            );

        } catch (err) {

            setLoadError(true);

            toast.error(
                "Không thể tải danh sách tour"
            );

        } finally {

            setTableLoading(false);
        }
    };

    // ================= EFFECT =================

    useEffect(() => {

        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);

        return () => clearTimeout(timer);

    }, [search]);

    useEffect(() => {

        loadData();

    }, [page, debouncedSearch, statusFilter]);

    useEffect(() => {

        setPage(0);

    }, [debouncedSearch, statusFilter]);

    // ================= RESET FORM =================

    const resetForm = () => {

        setEditId(null);

        setTitle("");

        setSlug("");

        setThumbnail("");

        setShortDescription("");

        setDurationDays("");

        setDurationNights("");

        setDepartureLocation("");

        setMaxPeople("");

        setPrice("");

        setStatus("DRAFT");

        setImageMode("url");

        setErrors({});
    };

    // ================= AUTO SLUG =================

    useEffect(() => {

        if (!editId) {

            const generated = title
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/[^a-z0-9\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-");

            setSlug(generated);
        }

    }, [title]);

    // ================= UPLOAD IMAGE =================

    const handleImageUpload = async (e) => {

        const file = e.target.files?.[0];
        e.target.value = "";

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file ảnh");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Ảnh tour không được vượt quá 10MB");
            return;
        }

        try {

            setUploadingImage(true);

            const response =
                await uploadTourThumbnail(file);

            setThumbnail(response.data.url);

            toast.success(
                "Đã tải ảnh tour"
            );

        } catch (err) {

            toast.error(
                err?.response?.data?.message ||
                "Không thể tải ảnh tour"
            );

        } finally {

            setUploadingImage(false);
        }
    };

    // ================= SAVE =================

    const handleSave = async () => {

        const newErrors = {};
        const normalizedThumbnail = thumbnail.trim();
        const normalizedTitle = title.trim();
        const normalizedSlug = slug.trim();
        const normalizedDurationDays = Number(durationDays);
        const normalizedDurationNights =
            durationNights === "" ? 0 : Number(durationNights);
        const normalizedMaxPeople = Number(maxPeople);
        const normalizedPriceText = String(price).trim();
        const normalizedPrice = Number(normalizedPriceText);

        if (!normalizedTitle) {

            newErrors.title =
                "Tên tour không được để trống";
        }

        if (!normalizedSlug) {

            newErrors.slug =
                "Slug không được để trống";
        }

        if (
            durationDays === "" ||
            Number.isNaN(normalizedDurationDays) ||
            normalizedDurationDays < 1
        ) {

            newErrors.durationDays =
                "Số ngày phải lớn hơn hoặc bằng 1";
        }

        if (
            Number.isNaN(normalizedDurationNights) ||
            normalizedDurationNights < 0
        ) {

            newErrors.durationNights =
                "Số đêm không được âm";
        }

        if (
            maxPeople === "" ||
            Number.isNaN(normalizedMaxPeople) ||
            normalizedMaxPeople < 1
        ) {

            newErrors.maxPeople =
                "Số lượng người phải lớn hơn hoặc bằng 1";
        }

        if (
            price === "" ||
            Number.isNaN(normalizedPrice) ||
            normalizedPrice <= 0
        ) {

            newErrors.price =
                "Giá tour phải lớn hơn 0";
        }

        if (normalizedThumbnail.startsWith("data:")) {

            newErrors.thumbnail =
                "Không thể lưu ảnh base64. Hãy dùng Upload ảnh để tải file lên server.";
        }

        if (normalizedThumbnail.length > 4000) {

            newErrors.thumbnail =
                "URL ảnh tour không được vượt quá 4000 ký tự. Hãy dùng Upload ảnh hoặc URL ngắn hơn.";
        }

        setErrors(newErrors);

        if (
            Object.keys(newErrors).length > 0
        ) {
            toast.error(
                Object.values(newErrors)[0]
            );
            return;
        }

        try {

            setLoading(true);

            const payload = {
                title: normalizedTitle,
                slug: normalizedSlug,
                thumbnail:
                    normalizedThumbnail || null,
                shortDescription: shortDescription.trim(),
                durationDays:
                    normalizedDurationDays,
                durationNights:
                    normalizedDurationNights,
                departureLocation:
                    departureLocation.trim(),
                maxPeople:
                    normalizedMaxPeople,
                price: normalizedPriceText,
                status,
            };

            if (editId) {

                await updateTour(
                    editId,
                    payload
                );

                toast.success(
                    "Cập nhật tour thành công"
                );

            } else {

                await createTour(payload);

                toast.success(
                    "Tạo tour thành công"
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
            title: "Xóa tour?",
            text: "Tour sẽ được chuyển vào kho lưu trữ",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
            confirmButtonColor: "#ef4444",
            customClass: {
                popup: "rounded-3xl",
                confirmButton: "rounded-xl px-6 py-2",
                cancelButton: "rounded-xl px-6 py-2",
            },
        });

        if (result.isConfirmed) {

            try {

                await deleteTour(id);

                toast.success(
                    "Đã xóa tour"
                );

                loadData();

            } catch {

                toast.error(
                    "Không thể xóa tour"
                );
            }
        }
    };

    // ================= STATUS UI =================

    const getStatusClass = (status) => {

        switch (status) {

            case "OPEN":
                return "bg-emerald-50 text-emerald-600";

            case "CLOSED":
                return "bg-rose-50 text-rose-600";

            default:
                return "bg-amber-50 text-amber-600";
        }
    };

    const getStatusLabel = (status) => {

        switch (status) {

            case "OPEN":
                return "Đang mở";

            case "CLOSED":
                return "Đã đóng";

            default:
                return "Bản nháp";
        }
    };

    const ErrorMessage = ({ children }) =>
        children ? (
            <p className="mt-2 text-xs font-bold text-rose-600">
                {children}
            </p>
        ) : null;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 text-slate-900 md:p-8">

            <div className="max-w-7xl mx-auto">

                {/* HEADER */}

                <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">

                    <div className="flex items-center gap-4">

                        <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-white shadow-lg">

                            <MapPinned size={30} />

                        </div>

                        <div>

                            <h2 className="text-3xl font-black text-slate-800">
                                Quản lý tour
                            </h2>

                            <p className="text-slate-500 mt-1">
                                CRUD tour du lịch
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            resetForm();
                            setOpen(true);
                        }}
                        className="h-14 px-6 rounded-2xl bg-slate-900 hover:bg-amber-500 text-white font-bold flex items-center gap-2 transition-all"
                    >

                        <Plus size={20} />

                        Thêm Tour
                    </button>
                </div>

                {/* FILTER */}

                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-8">

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

                        <div className="relative md:col-span-5">

                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                size={18}
                            />

                            <input
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                placeholder="Tìm kiếm tour..."
                                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none"
                            />
                        </div>

                        <div className="md:col-span-3">

                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value
                                    )
                                }
                                className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none"
                            >

                                <option value="">
                                    Tất cả trạng thái
                                </option>

                                <option value="DRAFT">
                                    Bản nháp
                                </option>

                                <option value="OPEN">
                                    Đang mở
                                </option>

                                <option value="CLOSED">
                                    Đã đóng
                                </option>
                            </select>
                        </div>

                        <div className="md:col-span-2">

                            <div className="h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-bold text-slate-700">

                                {totalElements} tour
                            </div>
                        </div>

                        <div className="md:col-span-2">

                            <button
                                onClick={() => {

                                    setSearch("");

                                    setStatusFilter("");
                                }}
                                className="w-full h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                            >

                                <RefreshCcw size={18} />

                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* CARDS */}

                {tableLoading ? (

                    <div className="py-32 flex justify-center">

                        <Loader2 className="animate-spin text-amber-500 w-12 h-12" />
                    </div>

                ) : loadError ? (

                    <div className="bg-white rounded-3xl py-20 text-center border border-slate-100">

                        <AlertTriangle className="mx-auto mb-4 text-rose-500" size={40} />

                        <p className="text-[#16231b] font-semibold">
                            Không tải được dữ liệu. Vui lòng thử lại.
                        </p>

                        <button
                            onClick={loadData}
                            className="mt-5 inline-flex items-center gap-2 h-11 px-6 rounded-2xl bg-[#2f7d55] hover:bg-[#26643f] text-white font-bold transition-all"
                        >
                            <RefreshCcw size={16} />
                            Thử lại
                        </button>
                    </div>

                ) : data.length === 0 ? (

                    <div className="bg-white rounded-3xl py-24 text-center text-slate-400 border border-slate-100">

                        Không có tour nào
                    </div>

                ) : (

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                        {data.map((tour) => (

                            <div
                                key={tour.id}
                                className="bg-white rounded-[28px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                            >

                                <div className="relative h-56 bg-slate-100">

                                    {tour.thumbnail ? (

                                        <img
                                            src={resolveUploadedFileUrl(tour.thumbnail)}
                                            alt={tour.title}
                                            className="w-full h-full object-cover"
                                        />

                                    ) : (

                                        <div className="w-full h-full flex items-center justify-center text-slate-400">

                                            <ImageIcon size={42} />
                                        </div>
                                    )}

                                    <div
                                        className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${getStatusClass(
                                            tour.status
                                        )}`}
                                    >

                                        {getStatusLabel(tour.status)}
                                    </div>
                                </div>

                                <div className="p-5">

                                    <h3 className="font-black text-lg text-slate-800 line-clamp-2">
                                        {tour.title}
                                    </h3>

                                    <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] mt-3">
                                        {tour.shortDescription ||
                                            "Chưa có mô tả"}
                                    </p>

                                    <div className="space-y-3 mt-5">

                                        <div className="flex items-center justify-between text-sm">

                                            <span className="flex items-center gap-2 text-slate-500">

                                                <Clock3 size={16} />

                                                Thời gian
                                            </span>

                                            <span className="font-bold">
                                                {tour.durationDays}N {tour.durationNights}Đ
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">

                                            <span className="flex items-center gap-2 text-slate-500">

                                                <Users size={16} />

                                                Số khách
                                            </span>

                                            <span className="font-bold">
                                                {tour.maxPeople}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">

                                            <span className="flex items-center gap-2 text-slate-500">

                                                <BadgeDollarSign size={16} />

                                                Giá
                                            </span>

                                            <span className="font-black text-amber-600">
                                                {Number(
                                                    tour.price
                                                ).toLocaleString(
                                                    "vi-VN"
                                                )} đ
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-6">
                                        <button
                                            onClick={() => navigate(`/admin/tours/${tour.id}`)}
                                            aria-label={`Chi tiết tour ${tour.title}`}
                                            title="Chi tiết tour"
                                            className="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            Chi tiết
                                        </button>

                                        <button
                                            onClick={() => {
                                                setEditId(tour.id);
                                                setTitle(tour.title);
                                                setSlug(tour.slug);
                                                setThumbnail(tour.thumbnail || "");
                                                setShortDescription(tour.shortDescription || "");
                                                setDurationDays(tour.durationDays);
                                                setDurationNights(tour.durationNights);
                                                setDepartureLocation(tour.departureLocation || "");
                                                setMaxPeople(tour.maxPeople);
                                                setPrice(tour.price);
                                                setStatus(tour.status);
                                                setImageMode("url");
                                                setOpen(true);
                                            }}
                                            aria-label={`Sửa tour ${tour.title}`}
                                            title="Sửa tour"
                                            className="h-11 px-4 rounded-xl bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-600 font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <Edit3 size={17} />
                                        </button>

                                        <button
                                            onClick={() => handleDelete(tour.id)}
                                            aria-label={`Xóa tour ${tour.title}`}
                                            title="Xóa tour"
                                            className="w-11 h-11 rounded-xl bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-600 flex items-center justify-center transition-all"
                                        >
                                            <Trash2 size={17} />
                                        </button>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* PAGINATION */}

                <div className="flex justify-end items-center gap-3 mt-10">

                    <button
                        disabled={page === 0}
                        onClick={() =>
                            setPage(page - 1)
                        }
                        className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center disabled:opacity-30"
                    >

                        <ChevronLeft size={20} />
                    </button>

                    <div className="font-bold text-slate-700">

                        {page + 1} / {totalPages || 1}
                    </div>

                    <button
                        disabled={
                            page + 1 >= totalPages
                        }
                        onClick={() =>
                            setPage(page + 1)
                        }
                        className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center disabled:opacity-30"
                    >

                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* MODAL */}

                <Modal
                    open={open}
                    onClose={() => {
                        setOpen(false);
                        resetForm();
                    }}
                    className="
            max-w-5xl
            max-h-[92vh]
            overflow-hidden
          "
                >

                    <div className="flex flex-col h-full max-h-[92vh]">

                        {/* HEADER */}

                        <div className="
              sticky
              top-0
              z-20
              bg-white
              pb-5
              border-b
              border-slate-100
            ">

                            <h3 className="text-3xl font-black text-slate-800">
                                {editId
                                    ? "Cập nhật tour"
                                    : "Tạo tour mới"}
                            </h3>

                        </div>

                        {/* BODY */}

                        <div className="
              flex-1
              overflow-y-auto
              py-6
              pr-2
            ">

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                <div>
                                    <label className="font-bold text-sm block mb-2">
                                        Tên tour
                                    </label>

                                    <input
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500"
                                    />
                                    <ErrorMessage>{errors.title}</ErrorMessage>
                                </div>

                                <div>
                                    <label className="font-bold text-sm block mb-2">
                                        Slug
                                    </label>

                                    <input
                                        value={slug}
                                        onChange={(e) =>
                                            setSlug(
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500"
                                    />
                                    <ErrorMessage>{errors.slug}</ErrorMessage>
                                </div>

                                {/* IMAGE */}

                                <div className="lg:col-span-2">

                                    <label className="font-bold text-sm block mb-4">
                                        Ảnh tour
                                    </label>

                                    <div className="flex gap-3 mb-4">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setImageMode("url")
                                            }
                                            className={`flex items-center gap-2 px-5 h-12 rounded-2xl font-bold transition-all ${imageMode === "url"
                                                ? "bg-slate-900 text-white"
                                                : "bg-slate-100 text-slate-600"
                                                }`}
                                        >

                                            <Link2 size={18} />

                                            Link ảnh
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setImageMode("upload")
                                            }
                                            className={`flex items-center gap-2 px-5 h-12 rounded-2xl font-bold transition-all ${imageMode === "upload"
                                                ? "bg-slate-900 text-white"
                                                : "bg-slate-100 text-slate-600"
                                                }`}
                                        >

                                            <Upload size={18} />

                                            Upload ảnh
                                        </button>
                                    </div>

                                    {imageMode === "url" ? (

                                        <input
                                            value={thumbnail}
                                            onChange={(e) =>
                                                setThumbnail(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full h-14 px-5 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500"
                                        />

                                    ) : (

                                        <label className="
                      w-full
                      min-h-[180px]
                      rounded-3xl
                      border-2
                      border-dashed
                      border-slate-300
                      bg-slate-50
                      hover:border-amber-400
                      transition-all
                      flex
                      flex-col
                      items-center
                      justify-center
                      cursor-pointer
                      p-6
                    ">

                                            <input
                                                type="file"
                                                accept="image/*"
                                                disabled={uploadingImage}
                                                hidden
                                                onChange={
                                                    handleImageUpload
                                                }
                                            />

                                            {uploadingImage ? (
                                                <Loader2
                                                    size={42}
                                                    className="mb-3 animate-spin text-amber-500"
                                                />
                                            ) : (
                                                <Upload
                                                    size={42}
                                                    className="text-slate-400 mb-3"
                                                />
                                            )}

                                            <p className="font-bold text-slate-700">
                                                {uploadingImage
                                                    ? "Đang tải ảnh..."
                                                    : "Chọn ảnh từ máy tính"}
                                            </p>

                                            <p className="text-sm text-slate-400 mt-1">
                                                PNG, JPG, WEBP...
                                            </p>

                                        </label>
                                    )}

                                    <ErrorMessage>{errors.thumbnail}</ErrorMessage>

                                    {/* PREVIEW */}

                                    {thumbnail && (

                                        <div className="mt-5">

                                            <div className="relative w-full h-64 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200">

                                                <img
                                                    src={resolveUploadedFileUrl(thumbnail)}
                                                    alt="preview"
                                                    className="w-full h-full object-cover"
                                                />

                                            </div>

                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="font-bold text-sm block mb-2">
                                        Số ngày
                                    </label>

                                    <input
                                        type="number"
                                        value={durationDays}
                                        onChange={(e) =>
                                            setDurationDays(
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500"
                                    />
                                    <ErrorMessage>{errors.durationDays}</ErrorMessage>
                                </div>

                                <div>
                                    <label className="font-bold text-sm block mb-2">
                                        Số đêm
                                    </label>

                                    <input
                                        type="number"
                                        value={durationNights}
                                        onChange={(e) =>
                                            setDurationNights(
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500"
                                    />
                                    <ErrorMessage>{errors.durationNights}</ErrorMessage>
                                </div>

                                <div>
                                    <label className="font-bold text-sm block mb-2">
                                        Điểm khởi hành
                                    </label>

                                    <input
                                        value={departureLocation}
                                        onChange={(e) =>
                                            setDepartureLocation(
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500"
                                    />
                                </div>

                                <div>
                                    <label className="font-bold text-sm block mb-2">
                                        Số người tối đa
                                    </label>

                                    <input
                                        type="number"
                                        value={maxPeople}
                                        onChange={(e) =>
                                            setMaxPeople(
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500"
                                    />
                                    <ErrorMessage>{errors.maxPeople}</ErrorMessage>
                                </div>

                                <div>
                                    <label className="font-bold text-sm block mb-2">
                                        Giá tour
                                    </label>

                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={price}
                                        onChange={(e) =>
                                            setPrice(
                                                normalizeMoneyInput(e.target.value)
                                            )
                                        }
                                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500"
                                    />
                                    <ErrorMessage>{errors.price}</ErrorMessage>
                                </div>

                                <div>
                                    <label className="font-bold text-sm block mb-2">
                                        Trạng thái
                                    </label>

                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500"
                                    >

                                        <option value="DRAFT">
                                            Bản nháp
                                        </option>

                                        <option value="OPEN">
                                            Đang mở
                                        </option>

                                        <option value="CLOSED">
                                            Đã đóng
                                        </option>
                                    </select>
                                </div>

                                <div className="lg:col-span-2">

                                    <label className="font-bold text-sm block mb-2">
                                        Mô tả ngắn
                                    </label>

                                    <textarea
                                        rows={5}
                                        value={shortDescription}
                                        onChange={(e) =>
                                            setShortDescription(
                                                e.target.value
                                            )
                                        }
                                        className="w-full px-5 py-4 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500 resize-none"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* FOOTER */}

                        <div className="
              sticky
              bottom-0
              bg-white
              pt-5
              border-t
              border-slate-100
              flex
              justify-end
              gap-4
            ">

                            <button
                                onClick={() => {
                                    setOpen(false);
                                    resetForm();
                                }}
                                className="h-14 px-8 rounded-2xl bg-slate-100 hover:bg-slate-200 font-bold"
                            >

                                Hủy
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={loading || uploadingImage}
                                className="min-w-[180px] h-14 px-8 rounded-2xl bg-slate-900 hover:bg-amber-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                            >

                                {(loading || uploadingImage) && (
                                    <Loader2
                                        className="animate-spin"
                                        size={18}
                                    />
                                )}

                                {editId
                                    ? "Lưu thay đổi"
                                    : "Tạo tour"}
                            </button>
                        </div>

                    </div>
                </Modal>
            </div>
        </div>
    );
}
