import { useEffect, useState } from "react";
import {
  Camera,
  Loader2,
  LogOut,
  Save,
  Upload,
  UserRound,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getCurrentUserProfile,
  resolveUploadedFileUrl,
  updateCurrentUserAvatar,
  updateCurrentUserProfile,
} from "../../api/userApi";
import { logout, saveAuth } from "../../utils/auth";
import AccountShell from "./AccountShell";
import {
  emptyProfileForm,
  getInitials,
  normalizeProfileForm,
} from "./accountShared";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfileForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await getCurrentUserProfile();

        if (!mounted) return;

        setProfile(response.data);
        setProfileForm(normalizeProfileForm(response.data));
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Không thể tải thông tin tài khoản",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const updateProfileField = (field, value) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const avatarDisplayUrl =
    avatarPreview || resolveUploadedFileUrl(profile?.avatar || profileForm.avatar);

  const handleAvatarSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh avatar không được vượt quá 5MB");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast.error("Vui lòng chọn ảnh avatar");
      return;
    }

    try {
      setUploadingAvatar(true);

      const response = await updateCurrentUserAvatar(avatarFile);
      const nextProfile = response.data;

      setProfile(nextProfile);
      setProfileForm(normalizeProfileForm(nextProfile));
      setAvatarFile(null);
      setAvatarPreview("");
      saveAuth(nextProfile);

      toast.success("Đã cập nhật avatar");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể cập nhật avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        avatar: profileForm.avatar.trim(),
        gender: profileForm.gender || "OTHER",
        dateOfBirth: profileForm.dateOfBirth || null,
        address: profileForm.address.trim(),
      };

      const response = await updateCurrentUserProfile(payload);
      const nextProfile = response.data;

      setProfile(nextProfile);
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
              Email và số điện thoại dùng để xác nhận booking.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-[#d4a878]">
              Họ và tên
            </label>
            <input
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
                type="email"
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
                value={profileForm.gender}
                onChange={(event) =>
                  updateProfileField("gender", event.target.value)
                }
                className="h-12 w-full rounded-xl border border-white/10 bg-white px-4 text-slate-950 outline-none transition focus:border-[#7FB77E] focus:ring-4 focus:ring-[#7FB77E]/15"
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
                type="date"
                value={profileForm.dateOfBirth}
                onChange={(event) =>
                  updateProfileField("dateOfBirth", event.target.value)
                }
                className="field-input"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <label className="mb-3 block text-xs font-bold text-[#d4a878]">
              Avatar
            </label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#7FB77E]/30 bg-[#7FB77E]/15 text-xl font-black text-[#d9f5d8]">
                {avatarDisplayUrl ? (
                  <img
                    src={avatarDisplayUrl}
                    alt={profile?.fullName || "Avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : profile?.fullName ? (
                  getInitials(profile.fullName)
                ) : (
                  <Camera size={26} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <input
                  id="customer-avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
                <label
                  htmlFor="customer-avatar-file"
                  className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-black text-white transition hover:border-[#7FB77E]/40 hover:bg-[#7FB77E]/10"
                >
                  <Camera size={17} />
                  Chọn ảnh
                </label>
                {avatarFile && (
                  <button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="ml-3 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#7FB77E] px-4 text-sm font-black text-[#020617] transition hover:bg-[#9de09c] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploadingAvatar ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Upload size={17} />
                    )}
                    {uploadingAvatar ? "Đang tải..." : "Cập nhật avatar"}
                  </button>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  Hỗ trợ JPG, PNG, WEBP. Dung lượng tối đa 5MB.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-[#d4a878]">
              Địa chỉ
            </label>
            <textarea
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
