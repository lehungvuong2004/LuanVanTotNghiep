import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export const useTermsOfService = () => {
  const { t, i18n } = useTranslation();
  const [activeSection, setActiveSection] = useState("intro");

  const contentVi = {
    title: t("Điều khoản Dịch vụ Gia Đình Việt"),
    subtitle: t("Cảm ơn bạn đã sử dụng Gia Đình Việt!"),
    intro: t(
      'Các Điều khoản Dịch vụ ("Điều khoản") chi phối cách bạn truy cập và sử dụng bất kỳ trang web, ứng dụng, dịch vụ, công nghệ, API hoặc bất kỳ sản phẩm hoặc tính năng nào khác do Gia Đình Việt cung cấp ("Dịch vụ"), ngoại trừ trường hợp chúng tôi tuyên bố rõ ràng là có áp dụng các điều khoản riêng biệt. Đối với các Điều khoản này, "chúng tôi" đề cập đến ban quản trị Gia Đình Việt. Vui lòng đọc kỹ các Điều khoản này và liên hệ với chúng tôi nếu bạn có thắc mắc.',
    ),
    guidelineHeader: t(
      "Bạn không được sử dụng Dịch vụ để làm hoặc chia sẻ bất cứ điều gì trái với các Điều khoản này. Cụ thể hơn, các Điều khoản này bao gồm và kết hợp để tham chiếu, các nguyên tắc sau:",
    ),
    guidelines: [
      {
        text: t("Nguyên tắc cộng đồng, giải thích những quy tắc được và không được phép đối với Khách hàng và Người giúp việc trên hệ thống;"),
        icon: "material-symbols:group-outline",
      },
      {
        text: t(
          "Quy trình Đặt lịch (Booking) và Thanh toán, quy định cách thực hiện giao dịch thông qua cổng thanh toán (chẳng hạn như VNPay Sandbox) hoặc tiền mặt, chính sách tự động hủy đơn và hoàn tiền;",
        ),
        icon: "material-symbols:calendar-month-outline",
      },
      {
        text: t("Quy tắc Bảng tin tuyển dụng (Job Board), hướng dẫn cách Khách hàng đăng tin tuyển dụng và Người giúp việc nộp hồ sơ nhận việc trực tiếp;"),
        icon: "material-symbols:work-outline",
      },
      {
        text: t("Các biện pháp thực thi chính sách, bảo vệ an toàn cho các bên, bao gồm cả quyền hạn chế/khóa tài khoản tạm thời hoặc vĩnh viễn khi phát hiện gian lận."),
        icon: "material-symbols:security",
      },
    ],
    agreementText: t(
      "Bằng cách truy cập hoặc sử dụng Gia Đình Việt, bạn đồng ý tuân thủ và bị ràng buộc bởi các Điều khoản này. Nếu không đồng ý với Điều khoản của chúng tôi thì bạn không được truy cập hoặc sử dụng hệ thống.",
    ),
    simplifiedTitle: t("Diễn đạt đơn giản hơn"),
    simplifiedIntro: t("Mỗi nền tảng đều có các quy định riêng. Sau đây là điều khoản hoạt động của chúng tôi, nhằm duy trì môi trường tìm việc làm và đặt người giúp việc an toàn, uy tín."),
    effectiveDate: t("Ngày có hiệu lực: Ngày 28 tháng 7 năm 2026"),
    sections: [
      {
        id: "section-1",
        number: "1",
        title: t("Dịch vụ của chúng tôi"),
        simplified: t(
          "Gia Đình Việt là cầu nối trung gian hỗ trợ Khách hàng tìm kiếm và đặt lịch Người giúp việc cũng như đăng tin tuyển dụng. Chúng tôi sử dụng các thông tin yêu cầu của bạn để gợi ý/kết nối dịch vụ phù hợp nhất.",
        ),
        paragraphs: [
          t(
            "Gia Đình Việt kết nối Khách hàng có nhu cầu sử dụng dịch vụ dọn dẹp, nấu ăn, bảo trì thiết bị gia đình hay chăm sóc sức khỏe với những Người giúp việc/Chuyên gia có kinh nghiệm phù hợp.",
          ),
          t(
            "Để mang đến trải nghiệm chất lượng, chúng tôi cần xác định vị trí quận huyện, thời gian mong muốn và chi tiết công việc của bạn. Thông tin cá nhân của bạn sẽ được bảo mật và truyền tải an toàn theo đúng Chính sách Quyền riêng tư.",
          ),
          t("Mọi tương tác như cập nhật trạng thái đặt lịch, hủy lịch hoặc lưu lịch sử thanh toán đều được thực hiện minh bạch qua hệ thống thông báo thời gian thực."),
        ],
      },
      {
        id: "section-2",
        number: "2",
        title: t("Sử dụng Dịch vụ"),
        simplified: t("Bạn chỉ có thể sử dụng Gia Đình Việt nếu từ 18 tuổi trở lên để có đủ tư cách pháp lý thực hiện các giao dịch đặt lịch và thỏa thuận lao động."),
        paragraphs: [
          t("Khi tạo tài khoản trên Gia Đình Việt, bạn cam kết cung cấp thông tin chính xác, đầy đủ bao gồm họ tên, số điện thoại liên hệ, email và địa chỉ khu vực hoạt động."),
          t("Bất kỳ ai dưới 18 tuổi đều không được phép tự tạo tài khoản hoặc đăng tải thông tin tìm việc trên bảng tin tuyển dụng mà không có sự giám hộ của cha mẹ hoặc người đại diện pháp luật."),
          t("Nghiêm cấm hành vi sử dụng các công cụ tự động hoặc tập lệnh để dò tìm, thu thập dữ liệu trái phép (crawler) bài đăng tuyển dụng hoặc thông tin hồ sơ của Người giúp việc."),
          t("Mọi hành vi giả mạo thông tin lý lịch cá nhân, bằng cấp chuyên môn hay hồ sơ khách hàng sẽ dẫn đến việc đình chỉ tài khoản ngay lập tức."),
        ],
      },
      {
        id: "section-3",
        number: "3",
        title: t("Nội dung người dùng và Bài đăng"),
        simplified: t("Các tin đăng tuyển việc, hồ sơ năng lực, đánh giá và nhận xét đều do chính bạn đăng tải và bạn tự chịu trách nhiệm pháp lý về độ xác thực của các nội dung đó."),
        paragraphs: [
          t(
            "Gia Đình Việt cho phép người dùng đăng tải các tin tuyển dụng (Job Board Request), cập nhật hồ sơ năng lực (Helper Profile), đánh giá sao và gửi nhận xét (Reviews). Bạn cam kết sở hữu đầy đủ quyền hợp pháp đối với các nội dung này.",
          ),
          t("Nội dung do bạn đăng tải không được chứa các thông tin thô tục, phân biệt đối xử, lừa đảo hoặc vi phạm quyền sở hữu trí tuệ của bên thứ ba."),
          t(
            "Gia Đình Việt đóng vai trò là bên trung gian trung lập cung cấp nền tảng và không kiểm duyệt trước toàn bộ nội dung đăng tải. Do đó, chúng tôi không chịu trách nhiệm hay nghĩa vụ pháp lý đối với bất kỳ bài đăng nào do người dùng tải lên hệ thống.",
          ),
        ],
      },
      {
        id: "section-4",
        number: "4",
        title: t("Quyền sở hữu trí tuệ"),
        simplified: t(
          "Gia Đình Việt sở hữu cấu trúc giao diện, logotype, mã nguồn và hệ thống cơ sở dữ liệu. Bạn được cấp quyền sử dụng hệ thống nhưng không được phép sao chép hoặc phân phối trái phép.",
        ),
        paragraphs: [
          t("Toàn bộ tài sản trí tuệ bao gồm thiết kế, mã nguồn, tên thương hiệu Gia Đình Việt và các quy trình công nghệ vận hành thuộc quyền sở hữu độc quyền của chúng tôi."),
          t(
            "Dữ liệu bài đăng của người dùng vẫn thuộc quyền sở hữu của người dùng, tuy nhiên bạn cấp cho Gia Đình Việt quyền lưu trữ, hiển thị công khai và phân phối trên hệ thống để kết nối dịch vụ.",
          ),
          t("Hành vi sao chép thiết kế, dịch ngược mã nguồn hệ thống để tạo các sản phẩm phái sinh mà không có sự đồng ý bằng văn bản của chúng tôi là vi phạm pháp luật."),
        ],
      },
      {
        id: "section-5",
        number: "5",
        title: t("Bảo mật tài khoản"),
        simplified: t("Bảo mật tài khoản của bạn bằng cách giữ kín mật khẩu. Thông báo ngay cho Gia Đình Việt nếu phát hiện tài khoản bị xâm nhập."),
        paragraphs: [
          t(
            "Mặc dù chúng tôi cam kết áp dụng các biện pháp mã hóa tiên tiến để bảo vệ thông tin cá nhân và dữ liệu giao dịch đặt lịch, hệ thống không thể cam kết an toàn tuyệt đối trước các đợt tấn công mạng phức tạp.",
          ),
          t(
            "Bạn chịu trách nhiệm bảo vệ mật khẩu đăng nhập của cá nhân và không được cung cấp mật khẩu cho bên thứ ba. Bạn sẽ phải tự chịu trách nhiệm đối với tất cả các hoạt động phát sinh từ tài khoản của mình.",
          ),
        ],
      },
      {
        id: "section-6",
        number: "6",
        title: t("Liên kết và dịch vụ của Bên thứ ba"),
        simplified: t("Hệ thống tích hợp các cổng thanh toán bên thứ ba (như VNPay Sandbox). Trách nhiệm an toàn giao dịch thuộc về các cổng thanh toán liên kết này."),
        paragraphs: [
          t("Gia Đình Việt có tích hợp các đường dẫn hoặc cổng thanh toán của bên thứ ba, điển hình là cổng thanh toán điện tử VNPay Sandbox nhằm tạo thuận lợi cho việc giao dịch trực tuyến."),
          t(
            "Chúng tôi không kiểm soát và không chịu trách nhiệm pháp lý về tính ổn định kỹ thuật, chính sách hoàn tiền nội bộ hoặc bất kỳ rủi ro mất mát giao dịch xảy ra từ các đối tác thanh toán liên kết này.",
          ),
        ],
      },
      {
        id: "section-7",
        number: "7",
        title: t("Chấm dứt và khóa tài khoản"),
        simplified: t("Chúng tôi có quyền tạm ngừng cung cấp dịch vụ hoặc khóa tài khoản vĩnh viễn nếu bạn gửi báo cáo/đánh giá lừa đảo hoặc vi phạm điều khoản nghiêm trọng."),
        paragraphs: [
          t("Chúng tôi bảo lưu quyền từ chối cung cấp dịch vụ, tạm ngừng hoặc xóa tài khoản của người dùng vi phạm nghiêm trọng hoặc lặp lại các cam kết tại điều khoản này."),
          t("Bạn cũng có quyền yêu cầu xóa tài khoản cá nhân bất kỳ lúc nào thông qua phần Cài đặt Hồ sơ hoặc liên hệ Hỗ trợ khách hàng qua email của chúng tôi."),
        ],
      },
      {
        id: "section-8",
        number: "8",
        title: t("Bồi thường trách nhiệm"),
        simplified: t("Nếu hành vi gian lận hoặc vi phạm của bạn gây tổn hại vật chất hoặc pháp lý cho Gia Đình Việt hay các đối tác liên kết, bạn sẽ chịu trách nhiệm bồi thường chi phí phát sinh."),
        paragraphs: [
          t(
            "Bạn đồng ý bồi thường và giữ cho Gia Đình Việt cùng các thành viên quản trị tránh khỏi mọi khiếu nại, tổn hại, các khoản nợ tài chính (bao gồm cả chi phí kiện tụng hợp lý) xuất phát từ việc bạn vi phạm Điều khoản dịch vụ hoặc các hành vi giao dịch gian lận.",
          ),
        ],
      },
      {
        id: "section-9",
        number: "9",
        title: t("Từ chối bảo đảm"),
        simplified: t("Chúng tôi cung cấp hệ thống kết nối trên nền tảng 'như hiện trạng' (as-is) và không cam kết tuyệt đối dịch vụ hoàn hảo 100% không phát sinh lỗi."),
        paragraphs: [
          t(
            "Để nâng cao chất lượng kết nối, chúng tôi không ngừng cải tiến và cập nhật các tính năng và giao diện hệ thống. Tuy nhiên, dịch vụ được cung cấp trên cơ sở nguyên trạng mà không đi kèm với bất kỳ bảo đảm ngụ ý nào.",
          ),
          t("Gia Đình Việt không đảm bảo rằng hệ thống sẽ luôn hiển thị liên tục, không bị ngắt quãng hoặc tuyệt đối không bị nhiễm mã độc trong mọi tình huống."),
        ],
      },
      {
        id: "section-10",
        number: "10",
        title: t("Giới hạn trách nhiệm pháp lý"),
        simplified: t("Chúng tôi không chịu trách nhiệm pháp lý đối với bất kỳ xung đột ngoài mong muốn nào xảy ra trực tiếp giữa Khách hàng và Người giúp việc trong quá trình làm việc tại nhà."),
        paragraphs: [
          t(
            "Trong phạm vi tối đa được pháp luật quy định, chúng tôi không chịu trách nhiệm cho các thiệt hại gián tiếp, mất mát tài sản cá nhân hay tổn hại sức khỏe phát sinh trong quá trình Người giúp việc thực hiện phần công việc tại nhà của Khách hàng.",
          ),
          t("Mối quan hệ làm việc thực tế cấu thành giữa Khách hàng và Người giúp việc được thiết lập dựa trên thỏa thuận dân sự tự nguyện của hai bên."),
        ],
      },
      {
        id: "section-11",
        number: "11",
        title: t("Tranh chấp và Trọng tài"),
        simplified: t("Mọi tranh chấp giữa các bên trước hết sẽ được ưu tiên giải quyết qua thương lượng hòa giải tại Gia Đình Việt trước khi khởi tố ra tòa án."),
        paragraphs: [
          t("Khi có khiếu nại về chất lượng công việc hoặc phát sinh giao dịch đặt lịch lỗi, Khách hàng hoặc Người giúp việc cần thông báo ngay trong vòng 48 giờ để Ban quản trị tổ chức giải quyết."),
          t("Nếu tranh chấp không thể giải quyết bằng thương lượng sau 60 ngày kể từ khi gửi thông báo, vụ việc sẽ được đệ trình lên cơ quan Trọng tài thương mại hành chính tại Việt Nam để phân xử."),
        ],
      },
      {
        id: "section-12",
        number: "12",
        title: t("Luật áp dụng và Cơ quan xét xử"),
        simplified: t("Điều khoản này hoạt động và chịu sự điều chỉnh hoàn toàn bởi hệ thống luật pháp nước Cộng hòa Xã hội Chủ nghĩa Việt Nam."),
        paragraphs: [t("Mọi tranh chấp không thuộc thẩm quyền giải quyết nội bộ sẽ được đưa ra phân xử tại Tòa án nhân dân có thẩm quyền tại Thành phố Hồ Chí Minh, Việt Nam.")],
      },
      {
        id: "section-13",
        number: "13",
        title: t("Điều khoản chung"),
        simplified: t("Chúng tôi có thể cập nhật các nội dung điều khoản bất kỳ lúc nào để tuân thủ luật pháp và sẽ thông báo công khai tới người dùng."),
        paragraphs: [
          t("Việc thay đổi chính sách bảo mật, thanh toán hoặc tuyển dụng sẽ luôn được cập nhật ở trang web này. Tiếp tục sử dụng Dịch vụ đồng nghĩa bạn chấp thuận các nội dung bổ sung mới nhất."),
          t("Mọi câu hỏi, phản hồi hoặc yêu cầu hỗ trợ tài khoản xin vui lòng liên hệ với ban quản trị của chúng tôi qua hòm thư điện tử chính thức: hungvuong04.dev@gmail.com."),
        ],
      },
    ],
  };

  const contentEn = {
    title: "Gia Dinh Viet Terms of Service",
    subtitle: "Thank you for using Gia Dinh Viet!",
    intro:
      'These Terms of Service ("Terms") govern your access to and use of any website, application, services, technology, API, or any other product or features provided by Gia Dinh Viet ("Services"), except where we explicitly state that separate terms apply. For these Terms, "we" refers to the management board of Gia Dinh Viet. Please read these Terms carefully and contact us if you have any questions.',
    guidelineHeader: "You must not use the Services to do or share anything that violates these Terms. Specifically, these Terms incorporate by reference the following policies:",
    guidelines: [
      {
        text: "Community Guidelines, which explain the rules of what is and isn't allowed for Customers and Helpers on our system;",
        icon: "material-symbols:group-outline",
      },
      {
        text: "Booking & Payment Process, governing the transaction flows via online gateways (e.g. VNPay Sandbox) or cash, automatic cancellation, and refund rules;",
        icon: "material-symbols:calendar-month-outline",
      },
      {
        text: "Job Board Guidelines, covering how Customers post recruitment requests and Helpers submit profiles or apply directly;",
        icon: "material-symbols:work-outline",
      },
      {
        text: "Policy Enforcement Measures, to protect all participants, including the rights to limit or suspend accounts suspected of fraud.",
        icon: "material-symbols:security",
      },
    ],
    agreementText: "By accessing or using Gia Dinh Viet, you agree to comply with and be bound by these Terms. If you do not agree to our Terms, you must not access or use the platform.",
    simplifiedTitle: "Simplified Version",
    simplifiedIntro: "Every platform has its own rules. Here are ours, designed to maintain a safe, reputable job-search and housekeeping booking ecosystem.",
    effectiveDate: "Effective Date: July 28, 2026",
    sections: [
      {
        id: "section-1",
        number: "1",
        title: "Our Services",
        simplified:
          "Gia Dinh Viet connects Customers looking for domestic help with potential Helpers, as well as providing job postings. We use your parameters to match you with appropriate service partners.",
        paragraphs: [
          "Gia Dinh Viet connects Customers seeking housekeeping, cooking, appliance maintenance, or home healthcare services with suitable, experienced Helpers/Experts.",
          "To deliver quality service matching, we require your local district, preferred time, and specific tasks. Your personal data is confidential and securely handled per our Privacy Policy.",
          "All interactions such as booking updates, cancellations, or payment history are recorded transparently and communicated through real-time notifications.",
        ],
      },
      {
        id: "section-2",
        number: "2",
        title: "Using the Service",
        simplified: "You must be at least 18 years old to create an account, request bookings, or accept assignments through Gia Dinh Viet.",
        paragraphs: [
          "When registering on Gia Dinh Viet, you guarantee to provide accurate, complete info including your full name, contact number, email, and service area.",
          "Persons under 18 years old are prohibited from registering or creating job board requests without the direct supervision and consent of a parent or legal guardian.",
          "Unauthorized automated tools or script crawlers for scraping job listings, worker portfolios, or personal contact info are strictly forbidden.",
          "Any falsification of credentials, background history, or client records will result in immediate suspension of account privileges.",
        ],
      },
      {
        id: "section-3",
        number: "3",
        title: "User Content and Postings",
        simplified: "Recruitment listings, credentials, ratings, and feedback are published directly by you, and you bear full legal responsibility for their validity.",
        paragraphs: [
          "Gia Dinh Viet allows users to upload job board requests, worker profile tags, star ratings, and review comments. You warrant that you hold legitimate rights to all assets you post.",
          "Your uploaded files and text must not contain profane, discriminatory, deceptive, or copyrighted content belonging to third parties.",
          "Gia Dinh Viet acts as a neutral venue and does not pre-screen all user content. Consequently, we assume no liability for materials published by platform participants.",
        ],
      },
      {
        id: "section-4",
        number: "4",
        title: "Intellectual Property rights",
        simplified:
          "Gia Dinh Viet owns the user interface design, stylesheets, logotypes, brand name, codebase, and database structures. You are granted usage rights, but you may not duplicate them.",
        paragraphs: [
          "All system intellectual properties, encompassing designs, backend code, trademarks, and workflow assets, belong exclusively to us.",
          "Your custom posts remain your property; however, you grant Gia Dinh Viet a license to host, display, and distribute them to facilitate matching.",
          "Copying templates, reverse-engineering files, or exploiting codebase features without our express permission is illegal.",
        ],
      },
      {
        id: "section-5",
        number: "5",
        title: "Account Security",
        simplified: "Secure your account by keeping your password secret. Notify us immediately if you suspect unauthorized access.",
        paragraphs: [
          "While we use standard encryption to shield your personal details and online transaction histories, we cannot guarantee absolute immunity to cyber-espionage or malicious breaches.",
          "You are fully accountable for safeguarding your passwords and assume responsibility for all actions conducted under your registered account.",
        ],
      },
      {
        id: "section-6",
        number: "6",
        title: "Third-Party Links and Gateways",
        simplified: "Transactions are executed through external payment systems (like VNPay Sandbox). Transaction integrity is governed by their respective policies.",
        paragraphs: [
          "Gia Dinh Viet integrates API links from external service providers, particularly the VNPay Sandbox e-payment gateway, to facilitate online billing.",
          "We do not control and accept no liability for their internal refund processes, technical server failures, or other financial transaction errors from these systems.",
        ],
      },
      {
        id: "section-7",
        number: "7",
        title: "Termination of Access",
        simplified: "We reserve the right to suspend or close your account if you submit fraudulent reports/reviews or breach these rules.",
        paragraphs: [
          "We reserve the right to deny service, deactivate, or delete profiles belonging to users who repeatedly fail to meet these agreed terms.",
          "You may request the deletion of your account at any time via Profile Settings or by notifying Customer Support.",
        ],
      },
      {
        id: "section-8",
        number: "8",
        title: "Indemnity",
        simplified: "If your fraudulent behavior causes legal or financial loss to Gia Dinh Viet or our partners, you agree to cover those costs.",
        paragraphs: [
          "You agree to indemnify and hold Gia Dinh Viet and its administrators harmless against all lawsuits, claims, financial damages (including reasonable legal fees) arising from your violating these terms or committing transaction fraud.",
        ],
      },
      {
        id: "section-9",
        number: "9",
        title: "Disclaimer of Warranties",
        simplified: "We provide matching utilities on an 'as-is' basis, and do not promise a 100% bug-free platform.",
        paragraphs: [
          "To enhance matching efficiencies, we periodically refine core features and layouts. However, services are offered without additional express or implied warranties.",
          "Gia Dinh Viet does not promise steady, error-free system access, or complete shield against malware in all conditions.",
        ],
      },
      {
        id: "section-10",
        number: "10",
        title: "Limitation of Liability",
        simplified: "We are not liable for direct or indirect physical conflicts that occur between helper and customer during the domestic service work.",
        paragraphs: [
          "To the maximum limit under the law, we assume no liability for personal property damages, health crises, or bodily harm occurring during the Helper's execution of tasks at the Customer's home.",
          "The actual work relationship is a voluntary civil agreement established specifically between the Customer and the Helper.",
        ],
      },
      {
        id: "section-11",
        number: "11",
        title: "Dispute Arbitration",
        simplified: "In case of helper-customer disputes or platform billing issues, parties will try to negotiate with support first before taking legal action.",
        paragraphs: [
          "When tasks go wrong or booking errors happen, Customers or Helpers should report the issue within 48 hours for administrator-led mediation.",
          "If consensus isn't reached through negotiation within 60 days of notify, the case will be referred to Vietnamese Commercial Arbitration centers for resolution.",
        ],
      },
      {
        id: "section-12",
        number: "12",
        title: "Governing Law and Jurisdiction",
        simplified: "These Terms are governed and interpreted under the laws of the Socialist Republic of Vietnam.",
        paragraphs: ["Any dispute outside our internal resolution capabilities will be submitted for settlement to the competent people's court in Ho Chi Minh City, Vietnam."],
      },
      {
        id: "section-13",
        number: "13",
        title: "General Provisions",
        simplified: "We may update these terms at any time to comply with changes in the law, and will post notices of revisions.",
        paragraphs: [
          "Updates regarding privacy, booking, or recruitment policies will always be updated on this page. Continuing to use the Portal binds you to the newest revisions.",
          "For any account inquiries or technical complaints, contact us at: hungvuong04.dev@gmail.com.",
        ],
      },
    ],
  };

  const activeContent = i18n.language === "en" ? contentEn : contentVi;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      const introElement = document.getElementById("intro");
      if (introElement && scrollPosition >= introElement.offsetTop && scrollPosition < introElement.offsetTop + introElement.offsetHeight) {
        setActiveSection("intro");
        return;
      }

      for (const sec of activeContent.sections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeContent.sections]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({
        top: topOffset,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return {
    t,
    activeSection,
    activeContent,
    scrollToSection,
  };
};
