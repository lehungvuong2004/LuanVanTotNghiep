/**
 * Chuyển đổi đường dẫn ảnh hoặc object từ API thành URL hợp lệ để hiển thị trên Frontend.
 * - Hỗ trợ cả chuỗi path/url lẫn object có chứa image_url, thumbnail_url, avatar_url.
 * - Nếu đã là URL tuyệt đối (Cloudflare R2, S3, CDN, HTTP/HTTPS, Base64) -> Giữ nguyên.
 * - Nếu là đường dẫn tương đối (uploads/...) -> Nối với Backend Base URL.
 */
export const getImageUrl = (
  imageSource:
    | string
    | {
        image_url?: string;
        thumbnail_url?: string;
        avatar_url?: string;
        image?: string;
        thumbnail?: string;
        avatar?: string;
      }
    | null
    | undefined,
): string => {
  if (!imageSource) return "";

  let pathOrUrl = "";
  if (typeof imageSource === "string") {
    pathOrUrl = imageSource;
  } else if (typeof imageSource === "object") {
    pathOrUrl = imageSource.image_url || imageSource.thumbnail_url || imageSource.avatar_url || imageSource.image || imageSource.thumbnail || imageSource.avatar || "";
  }

  if (!pathOrUrl || typeof pathOrUrl !== "string") return "";

  const trimmed = pathOrUrl.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Handle local frontend assets or files from the public folder
  if (
    trimmed.startsWith("/") &&
    (trimmed.startsWith("/src/") ||
      trimmed.startsWith("/assets/") ||
      trimmed.startsWith("/error404.webp"))
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("src/") || trimmed.startsWith("assets/")) {
    return `/${trimmed}`;
  }

  const cleanPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const baseUrl = apiUrl.replace(/\/api$/, "");
  return `${baseUrl}/${cleanPath}`;
};
