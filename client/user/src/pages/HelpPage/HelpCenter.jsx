import React, { useState } from "react";
import { ChevronDown, ChevronRight, HelpCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageMeta } from "~/components";

const HelpCenter = () => {
  const [expandedSections, setExpandedSections] = useState({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const helpSections = [
    {
      id: "getting-started",
      title: "Bắt đầu",
      items: [
        {
          q: "Làm thế nào để tạo tài khoản LinkVerse?",
          a: "Truy cập trang đăng ký và cung cấp địa chỉ email của bạn, chọn tên người dùng và tạo mật khẩu bảo mật. Xác minh email để kích hoạt tài khoản của bạn.",
        },
        {
          q: "Làm thế nào để hoàn thiện hồ sơ của tôi?",
          a: "Điều hướng đến cài đặt hồ sơ và thêm ảnh đại diện, tiểu sử, địa điểm và thông tin cá nhân khác mà bạn muốn chia sẻ với cộng đồng LinkVerse.",
        },
        {
          q: "Làm thế nào để tìm và kết nối với bạn bè?",
          a: "Sử dụng tính năng tìm kiếm để tìm bạn bè theo tên hoặc tên người dùng. Bạn cũng có thể nhập danh bạ từ email hoặc điện thoại để tìm những người bạn biết.",
        },
      ],
    },
    {
      id: "privacy-security",
      title: "Quyền riêng tư & Bảo mật",
      items: [
        {
          q: "Làm thế nào để kiểm soát ai có thể xem bài đăng của tôi?",
          a: "Sử dụng cài đặt quyền riêng tư để kiểm soát khả năng hiển thị bài đăng. Bạn có thể làm cho bài đăng công khai, chỉ hiển thị với bạn bè hoặc tạo nhóm quyền riêng tư tùy chỉnh.",
        },
        {
          q: "Làm thế nào để chặn hoặc báo cáo ai đó?",
          a: "Truy cập hồ sơ của người dùng và nhấp vào menu ba chấm để tìm các tùy chọn chặn và báo cáo. Chúng tôi xem xét tất cả các báo cáo một cách nghiêm túc và xem xét chúng kịp thời.",
        },
        {
          q: "Làm thế nào để bật xác thực hai yếu tố?",
          a: "Vào Cài đặt Bảo mật và bật 2FA bằng số điện thoại hoặc ứng dụng xác thực để tăng cường bảo mật tài khoản.",
        },
      ],
    },
    {
      id: "posting-sharing",
      title: "Đăng bài & Chia sẻ",
      items: [
        {
          q: "Tôi có thể chia sẻ những loại nội dung nào?",
          a: "Bạn có thể chia sẻ bài đăng văn bản, hình ảnh, video, liên kết và khảo sát. Tất cả nội dung phải tuân thủ Hướng dẫn Cộng đồng của chúng tôi.",
        },
        {
          q: "Làm thế nào để xóa một bài đăng?",
          a: 'Nhấp vào menu ba chấm trên bài đăng của bạn và chọn "Xóa". Lưu ý rằng các bài đăng đã xóa không thể khôi phục.',
        },
        {
          q: "Tôi có thể chỉnh sửa bài đăng sau khi xuất bản không?",
          a: 'Có, bạn có thể chỉnh sửa bài đăng trong vòng 24 giờ sau khi xuất bản. Các bài đăng đã chỉnh sửa sẽ hiển thị chỉ báo "đã chỉnh sửa".',
        },
      ],
    },
    {
      id: "account-issues",
      title: "Vấn đề tài khoản",
      items: [
        {
          q: "Tôi quên mật khẩu. Làm thế nào để đặt lại?",
          a: 'Nhấp "Quên mật khẩu" trên trang đăng nhập và nhập email của bạn. Chúng tôi sẽ gửi cho bạn một liên kết bảo mật để đặt lại mật khẩu.',
        },
        {
          q: "Làm thế nào để xóa tài khoản của tôi?",
          a: "Vào Cài đặt Tài khoản > Xóa Tài khoản. Hành động này là vĩnh viễn và không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa.",
        },
        {
          q: "Tài khoản của tôi bị hack. Tôi nên làm gì?",
          a: "Ngay lập tức thay đổi mật khẩu, bật 2FA và liên hệ với đội ngũ hỗ trợ của chúng tôi. Xem xét hoạt động gần đây và xóa bất kỳ nội dung trái phép nào.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageMeta title={t("Trung tâm Hỗ trợ")} />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/settings")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Quay lại LinkVerse</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-blue-600">LinkVerse</h1>
            </div>
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-6 h-6 text-gray-600" />
              <span className="text-lg font-medium text-gray-900">
                Trung tâm Hỗ trợ
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                Trung tâm Hỗ trợ
              </h2>
            </div>
          </div>
          <div className="px-6 py-6">
            <div className="space-y-6">
              <p className="text-gray-600 text-lg">
                Chào mừng đến với Trung tâm Hỗ trợ LinkVerse. Tìm câu trả lời
                cho các câu hỏi thường gặp và nhận hỗ trợ cho tài khoản của bạn.
              </p>

              <div className="space-y-4">
                {helpSections.map((section) => (
                  <div
                    key={section.id}
                    className="border border-gray-200 rounded-lg"
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                    >
                      <h3 className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </h3>
                      {expandedSections[section.id] ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {expandedSections[section.id] && (
                      <div className="px-6 pb-4 space-y-4">
                        {section.items.map((item, index) => (
                          <div
                            key={index}
                            className="border-l-4 border-blue-200 pl-4"
                          >
                            <h4 className="font-medium text-gray-900 mb-2">
                              {item.q}
                            </h4>
                            <p className="text-gray-600">{item.a}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Vẫn cần trợ giúp?
                </h3>
                <p className="text-blue-700 mb-4">
                  Không thể tìm thấy những gì bạn đang tìm kiếm? Đội ngũ hỗ trợ
                  của chúng tôi sẵn sàng giúp đỡ.
                </p>
                <span className=" text-blue-900 rounded-md  transition-colors">
                  Liên hệ Hỗ trợ: duongdn@gmail.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;
