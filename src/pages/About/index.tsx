import { Icon } from "@iconify/react";
import donDepImg from "../../assets/images/dondep_us.png";
export const AboutPage = () => {
  const renderBanner = () => (
    <div
      className="relative min-h-[50vh] md:min-h-[80vh] w-full flex items-center bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(2, 110, 95, 0.95) 0%, rgba(2, 110, 95, 0.8) 45%, rgba(2, 110, 95, 0) 100%), url('/src/assets/images/about_us.png')`,
      }}
    >
      <div className="container-layout w-full">
        <div className="w-full md:w-2/3 lg:w-1/2 py-12 md:py-16 text-white flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
            Kết nối dịch vụ gia đình uy tín,
            <br /> nhanh chóng và an toàn
          </h1>
          <p className="text-sm md:text-base lg:text-lg mb-8 text-gray-100 leading-relaxed max-w-[95%]">
            Gia Đình Việt là nền tảng tin cậy mang đến các giải pháp chăm sóc tổ ấm chuyên nghiệp, giúp bạn tận hưởng thời gian quý báu bên những người thân yêu.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-[#008080] hover:bg-[#006666] text-white font-semibold py-2.5 px-6 md:py-3 md:px-8 rounded-lg transition-colors cursor-pointer">Bắt đầu ngay</button>
            <button className="bg-white/10 hover:bg-white/20 border border-white/40 text-white font-semibold py-2.5 px-6 md:py-3 md:px-8 rounded-lg transition-colors backdrop-blur-sm cursor-pointer">
              Tìm hiểu thêm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  const renderSatifaction = () => (
    <div className="md:col-span-12 w-full px-4 md:px-12 relative z-20 -mt-12 md:-mt-24 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform duration-300 border border-gray-50">
          <span className="text-4xl md:text-5xl font-extrabold text-teal-700 mb-2">1000+</span>
          <span className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest text-center">Khách hàng</span>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform duration-300 border border-gray-50">
          <span className="text-4xl md:text-5xl font-extrabold text-teal-700 mb-2">500+</span>
          <span className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest text-center">Cộng tác viên</span>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform duration-300 border border-gray-50">
          <span className="text-4xl md:text-5xl font-extrabold text-teal-700 mb-2">20+</span>
          <span className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest text-center">Dịch vụ</span>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform duration-300 border border-gray-50">
          <span className="text-4xl md:text-5xl font-extrabold text-teal-700 mb-2">95%</span>
          <span className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest text-center">Hài lòng</span>
        </div>
      </div>
    </div>
  );
  const renderIntroduce = () => (
    <div className="md:col-span-12 flex flex-col gap-12 mt-8 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-4xl p-8 md:p-12 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow duration-300">
          <div className="bg-[#094b43] w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
            <Icon icon="mdi:account-group" className="text-3xl text-white" />
          </div>
          <h3 className="text-xl md:text-3xl font-bold text-[#094b43] mb-6">Dành cho Khách hàng</h3>
          <ul className="flex-1 space-y-5 mb-10">
            <li className="flex items-start gap-3">
              <Icon icon="mdi:check-circle-outline" className="text-2xl text-[#008080] mt-0.5 shrink-0" />
              <span className="text-gray-600 text-lg">Tiết kiệm thời gian chăm sóc nhà cửa</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon="mdi:check-circle-outline" className="text-2xl text-[#008080] mt-0.5 shrink-0" />
              <span className="text-gray-600 text-lg">Chất lượng dịch vụ được cam kết</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon="mdi:check-circle-outline" className="text-2xl text-[#008080] mt-0.5 shrink-0" />
              <span className="text-gray-600 text-lg">Giá cả minh bạch, không phát sinh</span>
            </li>
          </ul>
          <button className="w-full bg-[#094b43] hover:bg-[#06332d] text-white font-semibold py-4 rounded-xl transition-colors duration-300">Tìm người giúp việc ngay</button>
        </div>

        {/* Thẻ Trở thành Đối tác */}
        <div className="bg-[#094b43] rounded-4xl p-8 md:p-12 shadow-lg flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
          <div className="bg-[#126c60] w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
            <Icon icon="mdi:briefcase-outline" className="text-3xl text-white" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Trở thành Đối tác</h3>
          <ul className="flex-1 space-y-5 mb-10">
            <li className="flex items-start gap-3">
              <Icon icon="mdi:check-circle-outline" className="text-2xl text-[#4ade80] mt-0.5 shrink-0" />
              <span className="text-gray-100 text-lg">Thu nhập hấp dẫn và ổn định hàng tháng</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon="mdi:check-circle-outline" className="text-2xl text-[#4ade80] mt-0.5 shrink-0" />
              <span className="text-gray-100 text-lg">Chủ động thời gian và địa điểm làm việc</span>
            </li>
            <li className="flex items-start gap-3">
              <Icon icon="mdi:check-circle-outline" className="text-2xl text-[#4ade80] mt-0.5 shrink-0" />
              <span className="text-gray-100 text-lg">Được đào tạo kỹ năng chuyên nghiệp miễn phí</span>
            </li>
          </ul>
          <button className="w-full bg-[#126c60] hover:bg-[#0e5249] text-white font-semibold py-4 rounded-xl transition-colors duration-300">Đăng ký làm đối tác</button>
        </div>
      </div>
      <div className="bg-[#094b43] rounded-4xl p-10 md:p-20 text-center flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        <div className="relative z-10 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">Sẵn sàng để gắn kết yêu thương?</h2>
          <p className="text-[#a7cec6] md:text-lg mb-10 leading-relaxed">Hãy để Gia Đình Việt cùng bạn chăm sóc tổ ấm mỗi ngày một cách trọn vẹn và nhẹ nhàng nhất.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-white hover:bg-gray-100 text-[#094b43] font-bold py-3.5 px-8 rounded-full transition-colors duration-300 shadow-lg">Bắt đầu ngay</button>
            <button className="bg-transparent hover:bg-white/10 border border-white/50 text-white font-bold py-3.5 px-8 rounded-full transition-colors duration-300">Liên hệ tư vấn</button>
          </div>
        </div>
      </div>
    </div>
  );
  const renderPipeline = () => (
    <div className="md:col-span-12 flex flex-col items-center py-16  rounded-2xl my-4 border border-gray-50">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0f2830] mb-4">Quy trình đặt dịch vụ đơn giản</h2>
        <p className="text-gray-500 text-base md:text-lg">Chỉ với vài thao tác, bạn đã có thể tận hưởng không gian sống lý tưởng.</p>
      </div>

      <div className="relative w-full px-4 md:px-12 max-w-6xl mx-auto">
        <div className="hidden md:block absolute top-10 h-1 left-[15%] right-[15%]  bg-gray-200 z-0"></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
          {/* Bước 1 */}
          <div className="flex flex-col items-center text-center group cursor-pointer">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border-[3px] border-transparent group-hover:border-[#008080] transition-colors duration-300">
              <Icon icon="mdi:view-list-outline" className="text-3xl text-[#008080]" />
            </div>
            <h3 className="font-bold text-[#0f2830] text-lg mb-2">1. Chọn dịch vụ</h3>
            <p className="text-gray-500 text-sm px-2">Lựa chọn từ 20+ dịch vụ đa dạng từ vệ sinh đến sửa chữa.</p>
          </div>

          {/* Bước 2 */}
          <div className="flex flex-col items-center text-center group cursor-pointer">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border-2 border-transparent group-hover:border-[#008080] transition-colors duration-300">
              <Icon icon="mdi:calendar-month-outline" className="text-3xl text-[#008080]" />
            </div>
            <h3 className="font-bold text-[#0f2830] text-lg mb-2">2. Đặt lịch</h3>
            <p className="text-gray-500 text-sm px-2">Chọn thời gian và địa điểm phù hợp nhất với kế hoạch của bạn.</p>
          </div>

          {/* Bước 3 */}
          <div className="flex flex-col items-center text-center group cursor-pointer">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border-2 border-transparent group-hover:border-[#008080] transition-colors duration-300">
              <Icon icon="mdi:handshake-outline" className="text-3xl text-[#008080]" />
            </div>
            <h3 className="font-bold text-[#0f2830] text-lg mb-2">3. Kết nối</h3>
            <p className="text-gray-500 text-sm px-2">Hệ thống tự động kết nối bạn với chuyên gia phù hợp nhất.</p>
          </div>

          {/* Bước 4 */}
          <div className="flex flex-col items-center text-center group cursor-pointer">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border-2 border-transparent group-hover:border-[#008080] transition-colors duration-300">
              <Icon icon="mdi:star-outline" className="text-3xl text-[#008080]" />
            </div>
            <h3 className="font-bold text-[#0f2830] text-lg mb-2">4. Hoàn tất & Đánh giá</h3>
            <p className="text-gray-500 text-sm px-2">Kiểm tra kết quả, thanh toán và để lại phản hồi cho chúng tôi.</p>
          </div>
        </div>
      </div>
    </div>
  );
  const renderReview = () => (
    <div className="md:col-span-12 grid md:grid-cols-2 grid-cols-1 gap-12 items-center px-4 md:px-8 lg:px-12 py-16 rounded-2xl  mt-4">
      <div className="relative group">
        <div className="rounded-3xl overflow-hidden shadow-2xl relative z-10">
          <img src={donDepImg} alt="Dọn dẹp" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="absolute -bottom-6 -left-6 w-full h-full rounded-3xl border-4 border-[#008080]/20 z-0"></div>
      </div>
      <div className="flex flex-col justify-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
          Vì sao khách hàng tin tưởng <br className="hidden md:block" />
          <span className="text-[#008080]">Gia Đình Việt?</span>
        </h2>
        <p className="text-gray-600 mb-10 text-lg leading-relaxed">
          Chúng tôi mang đến những giải pháp làm sạch chuyên nghiệp và tận tâm nhất, giúp bạn có thêm thời gian quý báu tận hưởng cuộc sống.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
          {/* Icon 1 */}
          <div className="flex items-start gap-4 group cursor-pointer">
            <div className="w-14 h-14 shrink-0 bg-[#008080]/10 group-hover:bg-[#008080] group-hover:text-white rounded-2xl flex items-center justify-center text-[#008080] transition-colors duration-300">
              <Icon icon="material-symbols-light:security" className="text-4xl" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-[#008080] transition-colors">Đảm bảo an toàn</h3>
              <p className="text-gray-500 text-sm">Nhân viên được xác minh lý lịch rõ ràng, đáng tin cậy.</p>
            </div>
          </div>

          {/* Icon 2 */}
          <div className="flex items-start gap-4 group cursor-pointer">
            <div className="w-14 h-14 shrink-0 bg-[#008080]/10 group-hover:bg-[#008080] group-hover:text-white rounded-2xl flex items-center justify-center text-[#008080] transition-colors duration-300">
              <Icon icon="mdi:heart" className="text-4xl" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-[#008080] transition-colors">Phục vụ tận tâm</h3>
              <p className="text-gray-500 text-sm">Luôn đặt sự hài lòng của khách hàng lên trên hết.</p>
            </div>
          </div>

          {/* Icon 3 */}
          <div className="flex items-start gap-4 group cursor-pointer">
            <div className="w-14 h-14 shrink-0 bg-[#008080]/10 group-hover:bg-[#008080] group-hover:text-white rounded-2xl flex items-center justify-center text-[#008080] transition-colors duration-300">
              <Icon icon="mdi:cash" className="text-4xl" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-[#008080] transition-colors">Chi phí hợp lý</h3>
              <p className="text-gray-500 text-sm">Bảng giá minh bạch, không phát sinh chi phí ẩn.</p>
            </div>
          </div>

          {/* Icon 4 */}
          <div className="flex items-start gap-4 group cursor-pointer">
            <div className="w-14 h-14 shrink-0 bg-[#008080]/10 group-hover:bg-[#008080] group-hover:text-white rounded-2xl flex items-center justify-center text-[#008080] transition-colors duration-300">
              <Icon icon="mdi:run-fast" className="text-4xl" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-[#008080] transition-colors">Nhanh chóng</h3>
              <p className="text-gray-500 text-sm">Có mặt đúng giờ và xử lý công việc nhanh gọn.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return (
    <div className="w-full pb-12">
      {renderBanner()}
      <div className="container-layout">
        <div className="grid md:grid-cols-12 grid-cols-1 gap-8">
          {renderSatifaction()}
          {renderPipeline()}
          {renderReview()}
          {renderIntroduce()}
        </div>
      </div>
    </div>
  );
};
