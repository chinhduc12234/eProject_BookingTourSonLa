import { useEffect, useState } from "react";
import {
  getProvinces,
  createProvince,
  updateProvince,
  deleteProvince,
} from "../../api/provinceApi";
import Modal from "../../components/Modal";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { 
  Plus, Search, RefreshCcw, Edit3, Trash2, 
  MapPin, ChevronLeft, ChevronRight, Loader2 
} from "lucide-react";

export default function ProvincePage() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const loadData = async () => {
    try {
      setTableLoading(true);
      const res = await getProvinces({
        page,
        size: pageSize,
        keyword: search,
        direction: sortOrder,
      });
      setData(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      toast.error("Không thể tải danh sách tỉnh thành", {
        style: { borderRadius: '12px', background: '#333', color: '#fff' }
      });
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search, sortOrder]);

  useEffect(() => {
    setPage(0);
  }, [search, sortOrder]);

  useEffect(() => {
    let temp = [...data];
    if (search.trim()) {
      temp = temp.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    temp.sort((a, b) => {
      return sortOrder === "asc" 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    });
    setFilteredData(temp);
  }, [data, search, sortOrder]);

  const handleResetFilter = () => {
    setSearch("");
    setSortOrder("asc");
    setPage(0);
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Tên tỉnh không được để trống";
    else if (name.trim().length < 2) newErrors.name = "Tên tỉnh phải có ít nhất 2 ký tự";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      if (editId) {
        await updateProvince(editId, { name });
        toast.success("Cập nhật thành công!", { icon: '⛰️' });
      } else {
        await createProvince({ name });
        toast.success("Thêm tỉnh mới thành công!", { icon: '🍀' });
      }
      setName("");
      setEditId(null);
      setOpen(false);
      loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Dữ liệu này sẽ được lưu trữ vào kho lưu trữ",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy bỏ",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      border: "none",
      customClass: {
        popup: 'rounded-[24px]',
        confirmButton: 'rounded-xl px-6 py-2',
        cancelButton: 'rounded-xl px-6 py-2'
      }
    });

    if (result.isConfirmed) {
      try {
        await deleteProvince(id);
        toast.success("Đã xóa tỉnh thành");
        loadData();
      } catch (err) {
        toast.error("Xóa thất bại");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600 rounded-2xl shadow-lg shadow-amber-200">
              <MapPin className="text-white w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Tỉnh thành
              </h2>
              <p className="text-slate-500 font-medium italic">Hệ thống quản lý địa lý vùng cao</p>
            </div>
          </div>

          <button
            onClick={() => { setOpen(true); setEditId(null); setName(""); setErrors({}); }}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-amber-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl shadow-slate-200"
          >
            <Plus size={20} />
            <span className="font-bold">Thêm Tỉnh Mới</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng số</p>
              <h3 className="text-2xl font-black text-slate-800">{totalElements}</h3>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white p-2 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm bản sắc quê hương..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 focus:bg-white outline-none border-2 border-transparent focus:border-amber-500 transition-all text-sm"
              />
            </div>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full md:w-40 px-4 py-3 rounded-2xl bg-slate-50 outline-none border-2 border-transparent focus:border-amber-500 font-medium text-sm cursor-pointer"
            >
              <option value="asc">Sắp xếp: A-Z</option>
              <option value="desc">Sắp xếp: Z-A</option>
            </select>

            <button
              onClick={handleResetFilter}
              className="p-3 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
              title="Làm mới bộ lọc"
            >
              <RefreshCcw size={20} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-responsive-table w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[13px] font-bold text-slate-400 uppercase tracking-widest">STT</th>
                  <th className="px-8 py-5 text-[13px] font-bold text-slate-400 uppercase tracking-widest">Tên tỉnh thành</th>
                  <th className="px-8 py-5 text-right text-[13px] font-bold text-slate-400 uppercase tracking-widest">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tableLoading ? (
                  <tr>
                    <td colSpan={3} className="py-20 text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" />
                      <p className="mt-4 text-slate-400 font-medium">Đang tải dữ liệu vùng cao...</p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-20 text-center text-slate-400 font-medium italic">
                      Không tìm thấy dữ liệu phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredData.map((p, index) => (
                    <tr key={p.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                      <td data-label="Số thứ tự" className="px-8 py-5 font-bold text-slate-400 text-sm">
                        #{(page * pageSize + index + 1).toString().padStart(2, '0')}
                      </td>
                      <td data-label="Tỉnh thành" className="px-8 py-5">
                        <span className="font-semibold text-slate-700 group-hover:text-amber-600 transition-colors">
                          {p.name}
                        </span>
                      </td>
                      <td data-label="Thao tác" className="px-8 py-5">
                        <div className="flex justify-end gap-2 transition-opacity duration-300">
                          <button
                            onClick={() => { setEditId(p.id); setName(p.name); setOpen(true); }}
                            aria-label={`Chỉnh sửa ${p.name}`}
                            title="Chỉnh sửa tỉnh thành"
                            className="p-2.5 bg-white text-amber-500 hover:bg-amber-500 hover:text-white rounded-xl shadow-sm border border-slate-100 transition-all"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            aria-label={`Xóa ${p.name}`}
                            title="Xóa tỉnh thành"
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

        <div className="flex justify-between items-center mt-8 px-2">
          <p className="text-sm text-slate-500 font-medium">
            Trang <span className="text-slate-900 font-bold">{page + 1}</span> trên {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="p-2 bg-white rounded-xl border border-slate-200 disabled:opacity-30 hover:border-amber-500 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-2 bg-white rounded-xl border border-slate-200 disabled:opacity-30 hover:border-amber-500 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <Modal open={open} onClose={() => { setOpen(false); setErrors({}); }}>
          <div className="p-2">
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              {editId ? "Cập nhật thông tin" : "Thêm mới tỉnh thành"}
            </h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">
              Vui lòng điền thông tin chính xác để đồng bộ hệ thống.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Tên tỉnh thành</label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  placeholder="Ví dụ: Lào Cai, Yên Bái..."
                  className={`w-full px-5 py-4 rounded-[20px] bg-slate-50 outline-none border-2 transition-all ${
                    errors.name ? "border-rose-400 bg-rose-50" : "border-transparent focus:border-amber-500 focus:bg-white"
                  }`}
                />
                {errors.name && <p className="text-rose-500 text-xs mt-2 font-bold ml-2 italic">{errors.name}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-[2] px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-amber-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
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
