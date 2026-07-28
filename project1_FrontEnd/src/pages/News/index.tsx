import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNews } from "./useHook";
import { formatDate } from "../../utils";
import { Pagination } from "../../components/Pagination";
import { getImageUrl } from "../../utils/images";

export const News = () => {
  const { t } = useTranslation();
  const { news, loading, error, currentPage, total, searchQuery, setSearchQuery, fetchNews } = useNews();

  const renderHeader = () => (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-3">
        <Link to="/" className="hover:text-indigo-650 transition-colors">
          {t("Trang chủ")}
        </Link>
        <Icon icon="material-symbols:chevron-right" />
        <span className="text-slate-700 dark:text-slate-300 font-medium">{t("Tin tức & Kinh nghiệm")}</span>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{t("Tin tức & Kinh nghiệm")}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t("Chia sẻ kiến thức hữu ích về dịch vụ gia đình")}</p>
        </div>
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder={t("Tìm kiếm bài viết...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <Icon icon="material-symbols:search" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
        </div>
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">{t("Đang tải tin tức...")}</p>
      </div>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center py-20 gap-4">
      <Icon icon="material-symbols:error-outline" className="text-5xl text-red-400" />
      <p className="text-slate-500 dark:text-slate-400">{error}</p>
      <button onClick={() => fetchNews(1)} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors cursor-pointer">
        {t("Thử lại")}
      </button>
    </div>
  );

  const renderContent = () => {
    if (news.length === 0) {
      return (
        <div className="flex flex-col items-center py-20 gap-3">
          <Icon icon="material-symbols:newspaper" className="text-6xl text-slate-300 dark:text-slate-600" />
          <p className="text-slate-400 dark:text-slate-500 font-medium">{t("Chưa có bài viết nào.")}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {news.map((item, idx) => {
            const isFeatured = idx === 0;

            if (isFeatured) {
               return (
                <Link
                  key={item.id}
                  to={`/tin-tuc/${item.slug}`}
                  className="group grid grid-cols-1 md:grid-cols-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 md:col-span-2 lg:col-span-3 lg:h-96"
                >
                  <div className="lg:col-span-7 h-60 lg:h-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                    {item.thumbnail ? (
                      <img src={getImageUrl(item.thumbnail)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
                        <Icon icon="material-symbols:newspaper" className="text-6xl text-white/70" />
                      </div>
                    )}
                  </div>
                  <div className="lg:col-span-5 p-6 md:p-8 flex flex-col justify-center lg:h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-extrabold px-3 py-1 rounded-md uppercase tracking-wider">{t("Nổi bật")}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Icon icon="material-symbols:calendar-today-outline" className="text-sm" />
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight mb-3 line-clamp-2">
                       {item.title}
                    </h2>
                    {item.summary && <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-3">{item.summary}</p>}
                    <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                      {t("Đọc tiếp")} <Icon icon="material-symbols:arrow-forward" className="text-base" />
                    </div>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.id}
                to={`/tin-tuc/${item.slug}`}
                className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 lg:col-span-1 lg:h-96"
              >
                <div className="aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900">
                  {item.thumbnail ? (
                    <img src={getImageUrl(item.thumbnail)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full min-h-48 bg-linear-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
                      <Icon icon="material-symbols:newspaper" className="text-5xl text-white/70" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex flex-col grow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 text-xs font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">{t("Tin tức")}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Icon icon="material-symbols:calendar-today-outline" className="text-sm" />
                       {formatDate(item.created_at)}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug mb-2 line-clamp-2 text-base">
                    {item.title}
                  </h3>
                  {item.summary && <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 grow line-clamp-2">{item.summary}</p>}
                  <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold mt-auto">
                    {t("Đọc tiếp")} <Icon icon="material-symbols:arrow-forward" className="text-base" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pagination */}
        <Pagination currentPage={currentPage} totalItems={total} itemsPerPage={9} onPageChange={fetchNews} />
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen text-slate-800 dark:text-slate-100 py-8">
      <div className="w-full flex flex-col gap-8">
        {renderHeader()}
        {error && !loading && renderError()}
        {loading && renderLoading()}
        {!loading && !error && renderContent()}
      </div>
    </div>
  );
};

export default News;
