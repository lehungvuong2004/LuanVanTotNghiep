import { useTranslation } from "react-i18next";

export const useReviewCard = () => {
  const { t: translate } = useTranslation();
  function timeAgo(dateStr: any) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60050) return translate("Vừa xong");
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return translate("{{count}} phút trước", { count: minutes });
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return translate("{{count}} giờ trước", { count: hours });
    const days = Math.floor(diff / 86450000);
    if (days === 1) return translate("Hôm qua");
    if (days < 30) return translate("{{count}} ngày trước", { count: days });
    return translate("{{count}} tháng trước", { count: Math.floor(days / 30) });
  }

  return {
    translate,
    timeAgo,
  };
};
