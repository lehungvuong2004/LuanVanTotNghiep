import { useTranslation } from "react-i18next";
import { formatNumberVI } from "../../utils";

export const usePricing = () => {
  const { t } = useTranslation();

  const pricingCategories = [
    {
      id: "cleaning",
      name: t("Dọn dẹp nhà cửa"),
      icon: "material-symbols:cleaning-services-outline",
      packages: [
        {
          name: t("Dọn dẹp căn hộ nhỏ"),
          description: t("Phù hợp căn hộ 1 phòng ngủ, phòng khách nhỏ, lau sàn, dọn rác và toilet."),
          hours: 3,
          pricePerHour: 120000,
          price: 360000,
          features: [t("Lau nhà, quét bụi"), t("Dọn rác sinh hoạt"), t("Vệ sinh toilet")],
        },
        {
          name: t("Dọn dẹp nhà vừa"),
          description: t("Thích hợp cho căn hộ 2-3 phòng ngủ, vệ sinh sâu bếp, lau bụi đồ đạc."),
          hours: 4,
          pricePerHour: 120000,
          price: 480000,
          features: [t("Lau chùi kệ tủ"), t("Vệ sinh bếp ga/bồn rửa"), t("Thay drap giường")],
        },
        {
          name: t("Dọn dẹp nhà rộng"),
          description: t("Thích hợp cho nhà phố lớn, căn hộ duplex, vệ sinh toàn diện các khu vực."),
          hours: 5,
          pricePerHour: 120000,
          price: 600000,
          features: [t("Vệ sinh ban công"), t("Lau kính cửa sổ"), t("Chà sàn toilet chuyên sâu")],
        },
        {
          name: t("Dọn biệt thự / Nhà phố lớn"),
          description: t("Dọn dẹp kỹ lưỡng cho biệt thự nhiều tầng, sân vườn hoặc nhà phố diện tích rộng."),
          hours: 6,
          pricePerHour: 130000,
          price: 780000,
          features: [t("Hút bụi toàn bộ các tầng"), t("Lau dọn cầu thang, kính"), t("Vệ sinh sân trước/sau")],
        },
        {
          name: t("Tổng vệ sinh căn hộ"),
          description: t("Tổng dọn dẹp làm sạch sâu cho chung cư trước khi nhận bàn giao hoặc đón tết."),
          hours: 4,
          pricePerHour: 150000,
          price: 600000,
          features: [t("Tẩy cặn kính toilet"), t("Vệ sinh dầu mỡ tủ bếp"), t("Lau bụi khe trần thạch cao")],
        },
        {
          name: t("Tổng vệ sinh sâu nhà phố"),
          description: t("Vệ sinh định kỳ làm sạch sâu mọi ngóc ngách, loại bỏ các vết bẩn cứng đầu lâu năm."),
          hours: 6,
          pricePerHour: 150000,
          price: 900000,
          features: [t("Tẩy cặn canxi vách kính"), t("Lau dầu mỡ hút mùi"), t("Hút bụi khe hẹp sâu")],
        },
        {
          name: t("Vệ sinh sau xây dựng"),
          description: t("Tẩy sơn thừa, xi măng bám trên sàn, lau kính công nghiệp và thu gom rác xây dựng nhỏ."),
          hours: 8,
          pricePerHour: 180000,
          price: 1440000,
          features: [t("Hút bụi thạch cao/bụi mịn"), t("Tẩy sơn, xi măng sàn kính"), t("Chà sàn máy chuyên dụng")],
        },
      ],
    },
    {
      id: "care",
      name: t("Chăm sóc gia đình"),
      icon: "material-symbols:health-and-safety-outline",
      packages: [
        {
          name: t("Trông trẻ theo giờ"),
          description: t("Trông coi trẻ nhỏ tại nhà, hỗ trợ ăn uống dặm sữa và chơi trò chơi trí tuệ."),
          hours: 4,
          pricePerHour: 130000,
          price: 520000,
          features: [t("Chơi cùng bé"), t("Cho bé ăn dặm"), t("Giữ khu vực chơi sạch sẽ")],
        },
        {
          name: t("Trông trẻ bán trú"),
          description: t("Chăm sóc bé suốt ngày hành chính, chuẩn bị bữa ăn trưa và đưa đón học thêm nếu cần."),
          hours: 8,
          pricePerHour: 120000,
          price: 960000,
          features: [t("Nấu ăn trưa cho bé"), t("Đưa đón bé đi học"), t("Tắm rửa vệ sinh cho bé")],
        },
        {
          name: t("Chăm sóc người già tại nhà"),
          description: t("Hỗ trợ sinh hoạt cho người cao tuổi, nhắc uống thuốc và nấu cơm nước."),
          hours: 6,
          pricePerHour: 130000,
          price: 780000,
          features: [t("Nhắc uống thuốc đúng giờ"), t("Hỗ trợ đi lại nhẹ nhàng"), t("Trò chuyện tâm sự")],
        },
        {
          name: t("Chăm sóc người già cả ngày"),
          description: t("Đồng hành cùng các cụ già cả ngày, chuẩn bị 3 bữa dinh dưỡng và hỗ trợ tập vật lý trị liệu nhẹ."),
          hours: 8,
          pricePerHour: 125000,
          price: 1000000,
          features: [t("Nấu bữa sáng, trưa, tối"), t("Đo huyết áp hàng ngày"), t("Hỗ trợ đi dạo tập thể dục")],
        },
        {
          name: t("Chăm sóc người già tại bệnh viện"),
          description: t("Túc trực đầu giường bệnh viện chăm sóc, bón cháo, thay tã bỉm giường bệnh."),
          hours: 12,
          pricePerHour: 140000,
          price: 1680000,
          features: [t("Túc trực giường bệnh"), t("Vệ sinh tại giường bệnh"), t("Hỗ trợ ăn uống theo chỉ định")],
        },
        {
          name: t("Chăm sóc bệnh nhân chuyên sâu"),
          description: t("Túc trực ban đêm tại viện hoặc tại nhà hỗ trợ hút đờm, thay băng truyền dịch cho người bệnh nặng."),
          hours: 12,
          pricePerHour: 150000,
          price: 1800000,
          features: [t("Theo dõi chỉ số sinh tồn"), t("Trở mình chống lở loét"), t("Phối hợp y tá bệnh viện")],
        },
      ],
    },
    {
      id: "cooking",
      name: t("Nấu ăn gia đình"),
      icon: "material-symbols:soup-kitchen-outline",
      packages: [
        {
          name: t("Nấu ăn gia đình nhỏ"),
          description: t("Đi chợ, chuẩn bị thực đơn 3 món cơm gia đình hàng ngày."),
          hours: 3,
          pricePerHour: 120000,
          price: 360000,
          features: [t("Hỗ trợ đi chợ hộ"), t("Nấu 3 món chính"), t("Dọn rửa bếp gọn gàng")],
        },
        {
          name: t("Nấu ăn gia đình lớn"),
          description: t("Đi chợ nấu bữa ăn đầy đủ dinh dưỡng, nhiều món phức tạp theo sở thích."),
          hours: 4,
          pricePerHour: 120000,
          price: 480000,
          features: [t("Chọn thực phẩm tươi ngon"), t("Nấu 4 món dinh dưỡng"), t("Rửa sạch bát đũa")],
        },
        {
          name: t("Nấu tiệc liên hoan nhỏ"),
          description: t("Sơ chế và chuẩn bị các món ăn ngon phục vụ liên hoan, sinh nhật nhóm bạn bè tại nhà."),
          hours: 4,
          pricePerHour: 150000,
          price: 600000,
          features: [t("Nấu 5-6 món ăn tiệc"), t("Trình bày bàn ăn đẹp mắt"), t("Vệ sinh bếp sau khi nấu")],
        },
        {
          name: t("Nấu mâm cúng truyền thống"),
          description: t("Chuẩn bị mâm cỗ giỗ chạp đầy đủ nghi lễ, tiệc sinh nhật liên hoan quy mô gia đình."),
          hours: 5,
          pricePerHour: 150000,
          price: 750000,
          features: [t("Sơ chế nguyên liệu tiệc"), t("Nấu mâm cỗ đẹp mắt"), t("Thu dọn xoong nồi sau tiệc")],
        },
        {
          name: t("Nấu tiệc lớn tân gia / tất niên"),
          description: t("Thiết lập thực đơn nhiều bàn tiệc, túc trực bày món và rửa dọn toàn bộ chén đũa quy mô lớn."),
          hours: 6,
          pricePerHour: 160000,
          price: 960000,
          features: [t("Chế biến món ăn tiệc lớn"), t("Bày biện mâm tiệc liên tục"), t("Rửa sạch toàn bộ bát đĩa")],
        },
      ],
    },
    {
      id: "repair",
      name: t("Sửa chữa & Bảo trì"),
      icon: "material-symbols:construction-outline",
      packages: [
        {
          name: t("Sửa chữa điện gia dụng"),
          description: t("Sửa ổ cắm, công tắc, bóng đèn, khắc phục chập cháy đường dây thiết bị."),
          hours: 2,
          pricePerHour: 150000,
          price: 300000,
          features: [t("Kiểm tra rò rỉ điện"), t("Thay thế ổ cắm hỏng"), t("Đảm bảo an toàn sau sửa")],
        },
        {
          name: t("Sửa chữa đường ống nước"),
          description: t("Xử lý rò rỉ nước, thông nghẹt lavabo, bồn rửa chén, thay vòi sen."),
          hours: 2,
          pricePerHour: 150000,
          price: 300000,
          features: [t("Thông nghẹt đường ống"), t("Thay thiết bị vệ sinh"), t("Xử lý rò rỉ triệt để")],
        },
        {
          name: t("Bảo trì vệ sinh máy lạnh"),
          description: t("Vệ sinh dàn nóng/lạnh máy lạnh, đo gas và nạp gas bổ sung."),
          hours: 2,
          pricePerHour: 150000,
          price: 300000,
          features: [t("Xịt rửa bụi bẩn"), t("Kiểm tra áp suất gas"), t("Bảo hành chảy nước 30 ngày")],
        },
      ],
    },
    {
      id: "laundry",
      name: t("Giặt là & Ủi đồ"),
      icon: "material-symbols:local-laundry-service-outline",
      packages: [
        {
          name: t("Giặt sấy quần áo thường"),
          description: t("Phân loại vải màu/trắng, giặt sạch, sấy khô và gấp gọn gàng."),
          hours: 2,
          pricePerHour: 100000,
          price: 200000,
          features: [t("Phân loại vải kỹ lưỡng"), t("Sấy khô thơm tho"), t("Gấp gọn đóng gói")],
        },
        {
          name: t("Ủi đồ phẳng phiu"),
          description: t("Ủi phẳng các loại quần tây, áo sơ mi, váy đầm bằng bàn ủi hơi nước."),
          hours: 3,
          pricePerHour: 120000,
          price: 360000,
          features: [t("Ủi phẳng mọi nếp nhăn"), t("Nước ủi quần áo thơm"), t("Treo móc cẩn thận")],
        },
        {
          name: t("Giặt hấp đồ hiệu / Vest"),
          description: t("Giặt hấp khô chuyên dụng dành cho áo vest, đầm lụa, áo khoác dạ và giày hiệu."),
          hours: 4,
          pricePerHour: 150000,
          price: 600000,
          features: [t("Giặt hấp khô cao cấp"), t("Xử lý vết bẩn cứng đầu"), t("Bảo dưỡng chất liệu vải")],
        },
      ],
    },
    {
      id: "petcare",
      name: t("Chăm sóc thú cưng"),
      icon: "material-symbols:pets-outline",
      packages: [
        {
          name: t("Tắm rửa & Cắt móng thú cưng"),
          description: t("Tắm spa, sấy chải lông, cắt mài móng và vệ sinh tai cho chó mèo tại nhà."),
          hours: 2,
          pricePerHour: 120000,
          price: 240000,
          features: [t("Tắm sấy khử mùi chuyên sâu"), t("Cắt mài móng an toàn"), t("Lau sạch tai thú cưng")],
        },
        {
          name: t("Chăm sóc & Dắt thú cưng đi dạo"),
          description: t("Cho thú cưng ăn uống, dắt đi dạo vận động và vệ sinh khay cát sạch sẽ."),
          hours: 2,
          pricePerHour: 100000,
          price: 200000,
          features: [t("Dắt đi dạo 30 phút"), t("Vệ sinh khay cát/chuồng"), t("Cho ăn uống đúng bữa")],
        },
      ],
    },
  ];

  const formatCurrency = (val: number) => {
    const formatted = formatNumberVI(val);
    return formatted ? `${formatted} ₫` : "";
  };

  const pricingFaqs = [
    {
      question: t("Giá cố định đã bao gồm phí di chuyển của người làm chưa?"),
      answer: t("Có. Toàn bộ đơn giá cố định hiển thị trên bảng giá đã bao gồm chi phí di chuyển của người giúp việc đến nhà bạn. Khách hàng không cần thanh toán thêm bất kỳ phụ phí xăng xe nào."),
    },
    {
      question: t("Làm thế nào để yêu cầu người làm mang theo dụng cụ dọn dẹp?"),
      answer: t(
        "Trong trường hợp gia đình không có sẵn chổi, nước lau sàn hoặc máy hút bụi, bạn có thể lựa chọn dịch vụ kèm dụng cụ (+50.000đ) khi đăng bài đặt lịch. Người làm sẽ chuẩn bị đầy đủ khi đến.",
      ),
    },
    {
      question: t("Tôi có thể đổi hoặc hoàn trả gói dịch vụ đã đặt không?"),
      answer: t(
        "Gia Đình Việt hỗ trợ thay đổi lịch làm việc hoặc hoàn trả miễn phí trước giờ làm việc tối thiểu 4 tiếng. Bạn có thể tự thực hiện thông qua mục Lịch sử đặt lịch hoặc liên hệ Hotline hỗ trợ.",
      ),
    },
  ];

  const pricingCommitments = [
    {
      icon: "material-symbols:verified-user-outline",
      title: t("Người giúp việc xác minh 100%"),
      desc: t("Lý lịch tư pháp rõ ràng, được kiểm tra sức khỏe định kỳ và đào tạo kỹ năng vệ sinh giao tiếp bài bản."),
    },
    {
      icon: "material-symbols:shield-lock-outline",
      title: t("Bảo hiểm đổ vỡ & mất cắp"),
      desc: t("Bảo hiểm bồi thường rủi ro hư hỏng, đổ vỡ tài sản trong quá trình làm việc giúp bảo vệ quyền lợi tối đa."),
    },
    {
      icon: "material-symbols:price-change-outline",
      title: t("Đồng giá ngày lễ (tùy chỉnh)"),
      desc: t("Bảng giá ngày thường cố định, không phát sinh. Báo trước và thống nhất giá ngày lễ rõ ràng."),
    },
  ];

  return {
    t,
    pricingCategories,
    formatCurrency,
    pricingFaqs,
    pricingCommitments,
  };
};
