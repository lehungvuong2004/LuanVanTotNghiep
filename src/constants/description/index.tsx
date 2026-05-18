import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";

export default function InformationMarquee() {
  const { t } = useTranslation();

  const renderInfo = () => (
    <div className="w-full overflow-hidden whitespace-nowrap bg-gray-900 py-1.5 flex items-center border-t border-b border-[#026E5F]/10">
      <p className="animate-marquee text-white font-medium text-base flex items-center gap-2">
        <Icon icon="lucide:bell" className="text-2xl" />
        {t("Thông báo: Tìm kiếm việc làm tại Việt Nam")}
      </p>
    </div>
  );

  return <>{renderInfo()}</>;
}