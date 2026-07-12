import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { getNewsDetail, getNewsList } from "../../api/news";
import type { NewsItem } from "../../api/news";
import { getImageUrl } from "../../utils/images";

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
};

export const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: "smooth" });

        const [detail, list] = await Promise.all([
          getNewsDetail(slug),
          getNewsList({ limit: 4, status: "published" }),
        ]);
        setArticle(detail.data);
        setRelatedNews(list.data.data.filter((n) => n.slug !== slug).slice(0, 3));
      } catch {
        setError("Không tìm thấy bài viết này.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="dark:bg-slate-900 min-h-screen pt-24 flex justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="dark:bg-slate-900 min-h-screen pt-24 flex flex-col items-center gap-4 text-slate-600 dark:text-slate-300">
        <Icon icon="material-symbols:error-outline" className="text-6xl text-red-400" />
        <p className="text-lg font-semibold">{error || "Bài viết không tồn tại."}</p>
        <Link to="/tin-tuc" className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors">
          Quay về Tin tức
        </Link>
      </div>
    );
  }

  return (
    <div className="dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-100 pt-16 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8">
        {/* Main Article */}
        <article className="lg:col-span-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500 mb-6">
            <Link to="/" className="hover:text-teal-600 transition-colors">Trang chủ</Link>
            <Icon icon="material-symbols:chevron-right" />
            <Link to="/tin-tuc" className="hover:text-teal-600 transition-colors">Tin tức</Link>
            <Icon icon="material-symbols:chevron-right" />
            <span className="text-slate-600 dark:text-slate-400 line-clamp-1 font-medium">{article.title}</span>
          </div>

          {/* Title & Meta */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight mb-4">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
            <span className="flex items-center gap-1.5">
              <Icon icon="material-symbols:calendar-today-outline" className="text-base" />
              {formatDate(article.created_at)}
            </span>
            {article.creator && (
              <span className="flex items-center gap-1.5">
                <Icon icon="material-symbols:person-outline" className="text-base" />
                {article.creator.full_name}
              </span>
            )}
            <span className="bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-xs font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
              Tin tức
            </span>
          </div>

          {/* Thumbnail */}
          {article.thumbnail && (
            <div className="rounded-2xl overflow-hidden mb-8 shadow-md">
              <img
                src={getImageUrl(article.thumbnail)}
                alt={article.title}
                className="w-full h-80 object-cover"
              />
            </div>
          )}

          {/* Summary */}
          {article.summary && (
            <div className="bg-teal-50 dark:bg-teal-950/30 border-l-4 border-teal-500 rounded-xl p-5 mb-8">
              <p className="text-teal-800 dark:text-teal-200 font-semibold italic leading-relaxed">{article.summary}</p>
            </div>
          )}

          {/* Content — rendered as HTML from backend */}
          <div
            className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-extrabold prose-p:leading-relaxed prose-img:rounded-xl prose-a:text-teal-600 dark:prose-a:text-teal-400 text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Back button */}
          <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-700/50">
            <Link
              to="/tin-tuc"
              className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold hover:underline"
            >
              <Icon icon="material-symbols:arrow-back" />
              Quay về danh sách tin tức
            </Link>
          </div>
        </article>

        {/* Sidebar: Related News */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:h-fit lg:self-start">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-5 text-base">
              <Icon icon="material-symbols:newspaper" className="text-xl text-teal-600" />
              Bài viết liên quan
            </h3>
            {relatedNews.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">Chưa có bài viết liên quan.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {relatedNews.map((item) => (
                  <Link
                    key={item.id}
                    to={`/tin-tuc/${item.slug}`}
                    className="group flex gap-3 items-start pb-4 border-b border-slate-100 dark:border-slate-700/30 last:border-0 last:pb-0"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-900">
                      {item.thumbnail ? (
                        <img src={getImageUrl(item.thumbnail)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                          <Icon icon="material-symbols:newspaper" className="text-xl text-white/70" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </p>
                      <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                        <Icon icon="material-symbols:calendar-today-outline" className="text-xs" />
                        {new Date(item.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default NewsDetail;
