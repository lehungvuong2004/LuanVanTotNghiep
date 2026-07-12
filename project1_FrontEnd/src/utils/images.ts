/**
 * Chuyển đổi đường dẫn ảnh tương đối từ database thành URL tuyệt đối để hiển thị trên frontend.
 * Nếu đã là URL tuyệt đối hoặc base64 thì giữ nguyên.
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return "";
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://") ||
    imagePath.startsWith("/") ||
    imagePath.startsWith("data:")
  ) {
    return imagePath;
  }
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const baseUrl = apiUrl.replace(/\/api$/, "");
  return `${baseUrl}/${imagePath}`;
};
