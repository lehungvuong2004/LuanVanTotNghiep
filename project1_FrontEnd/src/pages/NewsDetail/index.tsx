import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useNewsDetail } from "./useHook";
import { getImageUrl } from "../../utils/images";

export const NewsDetail = () => {
  const { t, i18n, article, relatedNews, loading, error, formatDate } = useNewsDetail();

  if (loading) {
    return (
      <div className="dark:bg-slate-900 min-h-screen pt-24 flex justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">{t("Đang tải bài viết...")}</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="dark:bg-slate-900 min-h-screen pt-24 flex flex-col items-center gap-4 text-slate-600 dark:text-slate-300">
        <Icon icon="material-symbols:error-outline" className="text-6xl text-red-400" />
        <p className="text-lg font-semibold">{error || t("Bài viết không tồn tại.")}</p>
        <Link to="/tin-tuc" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          {t("Quay về Tin tức")}
        </Link>
      </div>
    );
  }

  // --- Sub-render Functions ---
  const renderBreadcrumb = () => (
    <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500 mb-6">
      <Link to="/" className="hover:text-indigo-650 transition-colors whitespace-nowrap">
        {t("Trang chủ")}
      </Link>
      <Icon icon="material-symbols:chevron-right" className="shrink-0" />
      <Link to="/tin-tuc" className="hover:text-indigo-650 transition-colors whitespace-nowrap">
        {t("Tin tức")}
      </Link>
      <Icon icon="material-symbols:chevron-right" className="shrink-0" />
      <span className="text-slate-600 dark:text-slate-400 truncate max-w-30 xs:max-w-[220px] sm:max-w-md md:max-w-lg font-medium">{article.title}</span>
    </div>
  );

  const renderHeader = () => (
    <div className="mb-6">
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight mb-4">{article.title}</h1>
      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <Icon icon="material-symbols:calendar-today-outline" className="text-base" />
          {formatDate(article.created_at)}
        </span>
        <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 text-xs font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
          {t("Tin tức")}
        </span>
      </div>
    </div>
  );

  const renderThumbnail = () => {
    if (!article.thumbnail) return null;
    return (
      <div className="rounded-2xl overflow-hidden mb-8 shadow-md">
        <img src={getImageUrl(article.thumbnail)} alt={article.title} className="w-full h-80 object-cover" />
      </div>
    );
  };

  const renderSummary = () => {
    if (!article.summary) return null;
    return (
      <div className="bg-slate-50 dark:bg-slate-800/40 border-l-4 border-slate-350 dark:border-slate-600 rounded-xl p-5 mb-8">
        <p className="text-slate-700 dark:text-slate-300 font-medium italic leading-relaxed">{article.summary}</p>
      </div>
    );
  };

  const renderContent = () => (
    <div>
      <div
        className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-extrabold prose-p:leading-relaxed prose-img:rounded-xl prose-a:text-indigo-600 dark:prose-a:text-indigo-400 text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-700/50">
        <Link to="/tin-tuc" className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
          <Icon icon="material-symbols:arrow-back" />
          {t("Quay về danh sách tin tức")}
        </Link>
      </div>
    </div>
  );

  const renderRelatedNews = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 shadow-sm">
      <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-5 text-base">
        <Icon icon="material-symbols:newspaper" className="text-xl text-indigo-600" />
        {t("Bài viết liên quan")}
      </h3>
      {relatedNews.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">{t("Chưa có bài viết liên quan.")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {relatedNews.map((item) => (
            <Link key={item.id} to={`/tin-tuc/${item.slug}`} className="group flex gap-3 items-start pb-4 border-b border-slate-100 dark:border-slate-700/30 last:border-0 last:pb-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900">
                {item.thumbnail ? (
                  <img src={getImageUrl(item.thumbnail)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
                    <Icon icon="material-symbols:newspaper" className="text-xl text-white/70" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug line-clamp-2">
                  {item.title}
                </p>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                  <Icon icon="material-symbols:calendar-today-outline" className="text-xs" />
                  {new Date(item.created_at).toLocaleDateString(i18n.language === "en" ? "en-US" : "vi-VN")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 pt-16 pb-16">
      <div className="grid grid-cols-12 gap-10 mt-6">
        <article className="col-span-12 lg:col-span-8 flex flex-col">
          {renderBreadcrumb()}
          {renderHeader()}
          {renderThumbnail()}
          {renderSummary()}
          {renderContent()}
        </article>

        <aside className="col-span-12 lg:col-span-4 lg:sticky lg:top-24 lg:h-fit lg:self-start">{renderRelatedNews()}</aside>
      </div>
    </div>
  );
};

export default NewsDetail;
