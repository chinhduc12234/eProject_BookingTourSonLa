import {
  useState,
} from "react";

import toast from "react-hot-toast";

import {
  ImagePlus,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  Loader2,
  Upload,
} from "lucide-react";
import { uploadTourImage } from "../api/tourApi";
import { resolveUploadedFileUrl } from "../api/userApi";

export default function TourImagesStep({
  data = [],
  onChange,
}) {

  const [uploadingIndex, setUploadingIndex] = useState(null);

  const images = Array.isArray(data)
    ? data
    : [];

  // ================= SET =================

  const setImages = (newImages) => {
    onChange(newImages);
  };

  // ================= ADD =================

  const addImage = () => {

    setImages([
      ...images,
      {
        imageUrl: "",
        isThumbnail: images.length === 0,
        sortOrder: images.length,
        sourceMode: "url",
      },
    ]);
  };

  // ================= UPDATE =================

  const updateImage = (
    index,
    field,
    value
  ) => {

    const updated = [...images];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setImages(updated);
  };

  // ================= UPLOAD =================

  const handleImageUpload = async (
    index,
    event
  ) => {

    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type?.startsWith("image/")) {
      toast.error("Vui lòng chọn đúng tệp ảnh");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ảnh không được vượt quá 10MB");
      return;
    }

    try {

      setUploadingIndex(index);

      const response = await uploadTourImage(file);
      const uploadedUrl =
        response?.data?.url ||
        response?.data?.data?.url ||
        response?.data;

      if (
        typeof uploadedUrl !== "string" ||
        !uploadedUrl.trim()
      ) {
        throw new Error("Upload không trả về đường dẫn ảnh");
      }

      const updated = [...images];

      if (!updated[index]) {
        return;
      }

      updated[index] = {
        ...updated[index],
        imageUrl: uploadedUrl.trim(),
        sourceMode: "upload",
      };

      setImages(updated);

      toast.success("Đã tải ảnh lên");

    } catch (err) {

      console.error("TOUR IMAGE UPLOAD ERROR:", err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Không tải được ảnh lên",
      );

    } finally {

      setUploadingIndex(null);
    }
  };

  // ================= REMOVE =================

  const removeImage = (index) => {

    let updated = images.filter(
      (_, i) => i !== index
    );

    updated = updated.map((img, i) => ({
      ...img,
      sortOrder: i,
    }));

    // đảm bảo luôn có thumbnail
    if (
      updated.length > 0 &&
      !updated.some(
        (i) => i.isThumbnail
      )
    ) {
      updated[0].isThumbnail = true;
    }

    setImages(updated);
  };

  // ================= THUMBNAIL =================

  const setThumbnail = (index) => {

    const updated = images.map(
      (img, i) => ({
        ...img,
        isThumbnail: i === index,
      })
    );

    setImages(updated);
  };

  // ================= MOVE =================

  const move = (from, to) => {

    if (
      to < 0 ||
      to >= images.length
    ) {
      return;
    }

    const updated = [...images];

    const item =
      updated.splice(from, 1)[0];

    updated.splice(to, 0, item);

    const normalized = updated.map(
      (img, i) => ({
        ...img,
        sortOrder: i,
      })
    );

    setImages(normalized);
  };

  return (
    <div className="space-y-8">

      <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">

          <div>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <ImagePlus size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Hình ảnh tour
              </h2>
            </div>

            <p className="text-slate-600 mt-1 font-medium">
              Quản lý gallery ảnh
            </p>

          </div>

          <button
            type="button"
            onClick={addImage}
            className="
              h-12
              px-5
              rounded-2xl
              bg-gradient-to-r
              from-amber-500
              to-amber-600
              hover:from-amber-600
              hover:to-amber-700
              text-white
              font-bold
              flex
              items-center
              gap-2
              transition-all
              duration-300
              hover:shadow-lg
              hover:shadow-amber-200
              active:scale-95
            "
          >

            <ImagePlus size={18} />

            Thêm ảnh

          </button>

        </div>

        {/* EMPTY */}

        {images.length === 0 && (

          <div
            className="
              border
              border-dashed
              border-slate-200
              rounded-[32px]
              py-20
              text-center
              bg-slate-50
            "
          >

            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <ImagePlus size={32} />
            </div>

            <h3 className="font-bold text-lg text-slate-700">
              Chưa có hình ảnh
            </h3>

            <p className="text-slate-500 mt-2">
              Bấm "Thêm ảnh" để bắt đầu
            </p>

          </div>
        )}

        {/* LIST */}

        <div className="space-y-5">

          {images.map((img, index) => (

            <div
              key={index}
              className="
                border
                border-slate-100
                rounded-[32px]
                p-5
                bg-white
                transition-all
                duration-300
              "
            >

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

                {/* PREVIEW */}

                <div className="xl:col-span-4">

                  <div
                    className={`
                      relative
                      overflow-hidden
                      rounded-[32px]
                      border
                      bg-white
                      h-64
                      group
                      transition-all
                      duration-300
                      ${img.isThumbnail
                        ? "border-amber-300 ring-2 ring-amber-100"
                        : "border-slate-100"
                      }
                    `}
                  >

                    {img.imageUrl ? (

                      <img
                        src={resolveUploadedFileUrl(img.imageUrl)}
                        alt=""
                        className="
                          w-full
                          h-full
                          object-cover
                          group-hover:scale-110
                          transition-transform
                          duration-500
                        "
                      />

                    ) : (

                      <div
                        className="
                          w-full
                          h-full
                          flex
                          items-center
                          justify-center
                          text-slate-200
                          bg-slate-50
                        "
                      >

                        <ImagePlus size={50} />

                      </div>
                    )}

                    {img.isThumbnail && (

                      <div
                        className="
                          absolute
                          top-4
                          left-4
                          px-4
                          h-10
                          rounded-full
                          bg-amber-600
                          text-white
                          font-bold
                          flex
                          items-center
                          gap-2
                          shadow-sm
                        "
                      >

                        <Star size={16} />

                        Thumbnail

                      </div>
                    )}

                  </div>

                </div>

                {/* FORM */}

                <div className="xl:col-span-8 space-y-5">

                  <div>

                    <label className="font-semibold text-sm block mb-2 text-slate-700">
                      Đường dẫn hình ảnh
                    </label>

                    <input
                      value={img.imageUrl || ""}
                      onChange={(e) =>
                        updateImage(
                          index,
                          "imageUrl",
                          e.target.value
                        )
                      }
                      placeholder="https://..."
                      className="
                        w-full
                        h-12
                        px-4
                        rounded-2xl
                        border
                        border-slate-100
                        focus:border-amber-500
                        focus:ring-2
                        focus:ring-amber-100
                        transition-all
                        duration-300
                        bg-white
                      "
                    />

                    <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            Hoặc tải tệp ảnh
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            PNG, JPG, WEBP - tối đa 10MB
                          </p>
                        </div>

                        <label
                          aria-disabled={uploadingIndex === index}
                          className={`
                            inline-flex
                            h-11
                            cursor-pointer
                            items-center
                            justify-center
                            gap-2
                            rounded-2xl
                            px-5
                            text-sm
                            font-bold
                            text-white
                            transition-all
                            duration-300
                            active:scale-95
                            ${uploadingIndex === index
                              ? "bg-slate-400"
                              : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                            }
                          `}
                        >
                          {uploadingIndex === index ? (
                            <Loader2 size={17} className="animate-spin" />
                          ) : (
                            <Upload size={17} />
                          )}

                          {uploadingIndex === index ? "Đang tải" : "Chọn tệp"}

                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            disabled={uploadingIndex === index}
                            onChange={(event) =>
                              handleImageUpload(index, event)
                            }
                            className="sr-only"
                          />
                        </label>
                      </div>

                      {img.imageUrl && (
                        <p className="mt-3 truncate text-xs font-semibold text-slate-500">
                          Đường dẫn hiện tại: {img.imageUrl}
                        </p>
                      )}
                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex flex-wrap gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setThumbnail(index)
                      }
                      className={`
                        h-11
                        px-5
                        rounded-2xl
                        font-bold
                        flex
                        items-center
                        gap-2
                        transition-all
                        duration-300
                        active:scale-95
                        ${img.isThumbnail
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }
                      `}
                    >

                      <Star size={16} />

                      Ảnh đại diện

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        move(
                          index,
                          index - 1
                        )
                      }
                      className="
                        h-11
                        px-4
                        rounded-2xl
                        bg-white
                        border
                        border-slate-200
                        text-slate-700
                        font-bold
                        hover:bg-slate-50
                        transition-all
                        duration-300
                        active:scale-95
                      "
                    >

                      <ArrowUp size={16} />

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        move(
                          index,
                          index + 1
                        )
                      }
                      className="
                        h-11
                        px-4
                        rounded-2xl
                        bg-white
                        border
                        border-slate-200
                        text-slate-700
                        font-bold
                        hover:bg-slate-50
                        transition-all
                        duration-300
                        active:scale-95
                      "
                    >

                      <ArrowDown size={16} />

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(index)
                      }
                      className="
                        h-11
                        px-5
                        rounded-2xl
                        bg-rose-500
                        hover:bg-rose-600
                        text-white
                        font-bold
                        flex
                        items-center
                        gap-2
                        transition-all
                        duration-300
                        active:scale-95
                      "
                    >

                      <Trash2 size={16} />

                      Xóa

                    </button>

                  </div>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}
