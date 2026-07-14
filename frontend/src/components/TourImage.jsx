import { useEffect, useState } from "react";
import { ImageOff, Mountain } from "lucide-react";

export default function TourImage({
  src,
  alt,
  className = "",
  placeholderClassName = "",
  loading = "lazy",
  ...imageProps
}) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={`Chưa có ảnh cho ${alt || "tour"}`}
        className={[
          "tour-image-placeholder flex h-full w-full flex-col items-center justify-center gap-3 text-center",
          placeholderClassName,
        ].join(" ")}
      >
        <span className="tour-image-placeholder__icon">
          <Mountain size={26} aria-hidden="true" />
          <ImageOff size={13} aria-hidden="true" />
        </span>
        <span className="max-w-[15rem] px-4 text-xs font-bold leading-5">
          Ảnh tour đang được cập nhật
        </span>
      </div>
    );
  }

  return (
    <img
      {...imageProps}
      src={src}
      alt={alt || "Ảnh tour"}
      loading={loading}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
