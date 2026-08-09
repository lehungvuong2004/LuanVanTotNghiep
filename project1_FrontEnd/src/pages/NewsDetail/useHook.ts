import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getNewsDetail, getNewsList } from "../../api/newsApi/news";
import type { NewsItem } from "../../api/newsApi/news";
import { formatDateWithDay } from "../../utils";

export const useNewsDetail = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateStr: string) => {
    const locale = i18n.language === "en" ? "en-US" : "vi-VN";
    return formatDateWithDay(dateStr, locale);
  };

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        setError(null);
        window.scrollTo({ top: 0, behavior: "smooth" });

        const [detail, list] = await Promise.all([getNewsDetail(slug), getNewsList({ limit: 5, status: "published" })]);
        setArticle(detail.data);
        setRelatedNews(list.data.data.filter((n) => n.slug !== slug).slice(0, 4));
      } catch {
        setError(t("Không tìm thấy bài viết này."));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug, t]);

  return {
    t,
    i18n,
    article,
    relatedNews,
    loading,
    error,
    formatDate,
  };
};
