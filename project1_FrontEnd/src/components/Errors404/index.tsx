import { Link } from "react-router-dom";

export const Errors404 = () => (
  <div className="flex flex-col items-center justify-center h-screen w-full">
    <img src="/error404.png" alt="Đường dẫn không tồn tại 404" className="w-[42.8rem] h-auto max-w-full object-contain" />
    <Link to="/" className="bg-black hover:bg-black/80 text-white px-4 py-2 rounded-full text-2xl font-medium cursor-pointer">
      Trở về trang chủ
    </Link>
  </div>
);
