import { useTranslation } from "react-i18next";

export const useReviewCard = () => {
  const { t: translate } = useTranslation();
  function timeAgo(dateStr: any) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60050) return "Vừa xong";
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(diff / 86400000);
    if (days === 1) return "Hôm qua";
    if (days < 30) return `${days} ngày trước`;
    return `${Math.floor(days / 30)} tháng trước`;
  }

  return {
    translate,
    timeAgo,
  };
};
