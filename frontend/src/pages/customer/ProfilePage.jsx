import { useEffect, useState } from "react";
import {
  Loader2,
  LogOut,
  RefreshCcw,
  Save,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
} from "../../api/userApi";
import { logout, saveAuth } from "../../utils/auth";
import AccountShell from "./AccountShell";
import {
  emptyProfileForm,
  normalizeProfileForm,
} from "./accountShared";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const response = await getCurrentUserProfile();

        if (!mounted) return;

        setProfileForm(normalizeProfileForm(response.data));
      } catch (error) {
        const message = error?.response?.data?.message || "Không thể tải thông tin tài khoản";
        setLoadError(message);
        toast.error(message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [reloadKey]);

  const updateProfileField = (field, value) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        gender: profileForm.gender || "OTHER",
        dateOfBirth: profileForm.dateOfBirth || null,
        address: profileForm.address.trim(),
      };

      const response = await updateCurrentUserProfile(payload);
      const nextProfile = response.data;

      setProfileForm(normalizeProfileForm(nextProfile));
      saveAuth(nextProfile);

      toast.success("Đã cập nhật thông tin tài khoản");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể cập nhật thông tin",
      );
    } finally {
      setSaving(false);
    }
  };

  const actions = (
    <button
      type="button"
      onClick={logout}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-black text-white transition hover:border-rose-300/50 hover:bg-rose-300/10 hover:text-rose-100"
    >
      <LogOut size={18} />
      Đăng xuất
    </button>
  );

  if (loading) {
    return (
      <AccountShell title="Chỉnh sửa thông tin" actions={actions}>
        <div className="flex min-h-[360px] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#7FB77E]" />
        </div>
      </AccountShell>
    );
  }

  if (loadError) {
    return (
      <AccountShell title="Chỉnh sửa thông tin" actions={actions}>
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-300/25 bg-rose-300/[0.07] p-8 text-center" role="alert">
          <ShieldAlert className="mx-auto h-11 w-11 text-rose-200" />
          <h2 className="mt-4 text-xl font-black text-white">Chưa tải được hồ sơ</h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">{loadError}</p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="btn-outline mt-5 text-sm"
          >
            <RefreshCcw size={16} /> Thử tải lại
          </button>
        </div>
      </AccountShell>
    );
  }

  return (
    <AccountShell
      title="Chỉnh sửa thông tin"
      description="Cập nhật hồ sơ cá nhân để hệ thống tự điền nhanh khi đặt tour."
      actions={actions}
    >
      <form
        onSubmit={handleProfileSubmit}
        className="mx-auto max-w-3xl rounded-xl border border-white/10 bg-white/[0.04] p-5 sm:p-6"
      >
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7FB77E]/15 text-[#9de09c]">
            <UserRound size={20} />
          </span>
          <div>
            <h2 className="text-xl font-black text-white">Thông tin cá nhân</h2>
            <p className="text-sm text-slate-400">
              Email và số điện thoại được dùng để xác nhận đơn đặt tour.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-[#d4a878]">
              Họ và tên
            </label>
            <input
              name="fullName"
              autoComplete="name"
              required
              value={profileForm.fullName}
              onChange={(event) =>
                updateProfileField("fullName", event.target.value)
              }
              className="field-input"
              placeholder="Nhập họ tên"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold text-[#d4a878]">
                Email đăng nhập
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={profileForm.email}
                onChange={(event) =>
                  updateProfileField("email", event.target.value)
                }
                className="field-input"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-[#d4a878]">
                Số điện thoại
              </label>
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={profileForm.phone}
                onChange={(event) =>
                  updateProfileField("phone", event.target.value)
                }
                className="field-input"
                placeholder="09xxxxxxxx"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold text-[#d4a878]">
                Giới tính
              </label>
              <select
                name="gender"
                value={profileForm.gender}
                onChange={(event) =>
                  updateProfileField("gender", event.target.value)
                }
                className="field-input"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-[#d4a878]">
                Ngày sinh
              </label>
              <input
                name="dateOfBirth"
                type="date"
                value={profileForm.dateOfBirth}
                onChange={(event) =>
                  updateProfileField("dateOfBirth", event.target.value)
                }
                className="field-input"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-[#d4a878]">
              Địa chỉ
            </label>
            <textarea
              name="address"
              autoComplete="street-address"
              rows={3}
              value={profileForm.address}
              onChange={(event) =>
                updateProfileField("address", event.target.value)
              }
              className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-[#7FB77E] focus:bg-[#7FB77E]/10 focus:ring-4 focus:ring-[#7FB77E]/15"
              placeholder="Địa chỉ liên hệ hoặc điểm đón mặc định"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary mt-2 w-full text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </div>
      </form>
    </AccountShell>
  );
}
