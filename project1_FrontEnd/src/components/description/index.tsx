import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

export default function InformationMarquee() {
  const { t } = useTranslation();

  const renderInfo = () => (
    <div className="w-full py-2 overflow-hidden dark:border-t dark:border-gray-300 bg-[#FFD6A7] dark:bg-slate-800 flex items-center transition-colors duration-300">
      <p className="animate-marquee whitespace-nowrap text-gray-600 dark:text-white font-medium text-sm flex items-center gap-2 shrink-0">
        <Icon icon="lucide:bell" className="text-base shrink-0" />
        {t("Thông báo: Tìm kiếm việc làm tại Việt Nam")}
      </p>
    </div>
  );
  return <>{renderInfo()}</>;
}