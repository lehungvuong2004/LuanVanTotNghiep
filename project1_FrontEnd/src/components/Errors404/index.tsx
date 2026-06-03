import { Link } from "react-router-dom";

export const Errors404 = () => (
  <div className="flex flex-col items-center justify-center h-screen w-full dark:bg-slate-900 transition-colors duration-300">
    <img src="../../../public/error404.webp" alt="Đường dẫn không tồn tại 404" className="max-w-1/3 h-auto object-contain" loading="lazy" />
    <Link to="/" className="bg-black dark:bg-teal-600 hover:bg-black/80 dark:hover:bg-teal-500 text-white px-4 py-2 rounded-full text-2xl font-medium cursor-pointer transition-colors">
      Trở về trang chủ
    </Link>
  </div>
);
