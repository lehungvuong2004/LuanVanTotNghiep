import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { getNewsList } from "../../api/newsApi/news";
import type { NewsItem } from "../../api/newsApi/news";

export const useNews = () => {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNews = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getNewsList({ page, limit: 9, status: "published" });
      setNews(res.data.data);
      setCurrentPage(res.data.current_page);
      setTotalPages(res.data.last_page);
      setTotal(res.data.total);
    } catch {
      setError(t("Không thể tải tin tức. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNews(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchNews]);

  const filteredNews = news.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  return {
    news: filteredNews,
    loading,
    error,
    currentPage,
    totalPages,
    total,
    searchQuery,
    setSearchQuery,
    fetchNews };
};
