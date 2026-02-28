import React from "react";
import { Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageMeta } from "~/components";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageMeta title={t("Chính sách Bảo mật")} />
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
              <Shield className="w-6 h-6 text-gray-600" />
              <span className="text-lg font-medium text-gray-900">
                Chính sách Bảo mật
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                Chính sách Bảo mật
              </h2>
            </div>
          </div>
          <div className="px-6 py-6">
            <div className="prose max-w-none">
              <p className="text-sm text-gray-500 mb-6">
                Cập nhật lần cuối: 15 tháng 1, 2025
              </p>

              <div className="space-y-8">
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Giới thiệu
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Tại LinkVerse, chúng tôi rất coi trọng quyền riêng tư của
                    bạn. Chính sách Bảo mật này giải thích cách chúng tôi thu
                    thập, sử dụng, tiết lộ và bảo vệ thông tin của bạn khi bạn
                    sử dụng nền tảng mạng xã hội của chúng tôi. Vui lòng đọc kỹ
                    chính sách bảo mật này để hiểu các thực hành của chúng tôi
                    liên quan đến dữ liệu cá nhân của bạn.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Thông tin chúng tôi thu thập
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Thông tin cá nhân
                      </h4>
                      <p className="text-gray-700">
                        Chúng tôi thu thập thông tin mà bạn cung cấp trực tiếp
                        cho chúng tôi, như tên, địa chỉ email, số điện thoại,
                        thông tin hồ sơ và bất kỳ nội dung nào bạn đăng hoặc
                        chia sẻ trên LinkVerse.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Thông tin sử dụng
                      </h4>
                      <p className="text-gray-700">
                        Chúng tôi tự động thu thập thông tin về hoạt động của
                        bạn trên nền tảng của chúng tôi, bao gồm các trang đã
                        truy cập, tính năng đã sử dụng, liên kết đã nhấp và thời
                        gian sử dụng dịch vụ.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Thông tin thiết bị
                      </h4>
                      <p className="text-gray-700">
                        Chúng tôi thu thập thông tin về thiết bị bạn sử dụng để
                        truy cập LinkVerse, bao gồm loại thiết bị, hệ điều hành,
                        loại trình duyệt, địa chỉ IP và định danh thiết bị di
                        động.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Cách chúng tôi sử dụng thông tin của bạn
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>
                      Để cung cấp, duy trì và cải thiện dịch vụ của chúng tôi
                    </li>
                    <li>
                      Để cá nhân hóa trải nghiệm và đề xuất nội dung của bạn
                    </li>
                    <li>
                      Để giao tiếp với bạn về tài khoản và dịch vụ của chúng tôi
                    </li>
                    <li>
                      Để đảm bảo an toàn nền tảng và ngăn chặn gian lận hoặc lạm
                      dụng
                    </li>
                    <li>
                      Để phân tích mô hình sử dụng và cải thiện nền tảng của
                      chúng tôi
                    </li>
                    <li>
                      Để tuân thủ nghĩa vụ pháp lý và bảo vệ quyền lợi của chúng
                      tôi
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Chia sẻ thông tin
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Chúng tôi không bán thông tin cá nhân của bạn cho bên thứ
                    ba. Chúng tôi có thể chia sẻ thông tin của bạn trong các
                    trường hợp sau:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Với sự đồng ý hoặc theo chỉ đạo của bạn</li>
                    <li>
                      Với các nhà cung cấp dịch vụ giúp chúng tôi vận hành nền
                      tảng
                    </li>
                    <li>
                      Để tuân thủ các yêu cầu pháp lý hoặc bảo vệ quyền lợi và
                      an toàn
                    </li>
                    <li>
                      Liên quan đến giao dịch kinh doanh (sáp nhập, mua lại,
                      v.v.)
                    </li>
                    <li>
                      Dưới dạng tổng hợp hoặc không xác định danh tính cho mục
                      đích phân tích
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Quyền riêng tư của bạn
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-700">Bạn có quyền:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Truy cập và cập nhật thông tin cá nhân của bạn</li>
                      <li>Xóa tài khoản và dữ liệu liên quan</li>
                      <li>
                        Kiểm soát cài đặt quyền riêng tư và khả năng hiển thị
                        nội dung
                      </li>
                      <li>Từ chối nhận một số thông báo nhất định</li>
                      <li>Yêu cầu một bản sao dữ liệu của bạn</li>
                      <li>Phản đối một số hoạt động xử lý nhất định</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Bảo mật dữ liệu
                  </h3>
                  <p className="text-gray-700">
                    Chúng tôi thực hiện các biện pháp bảo mật kỹ thuật và tổ
                    chức thích hợp để bảo vệ thông tin cá nhân của bạn khỏi việc
                    truy cập, thay đổi, tiết lộ hoặc phá hủy trái phép. Tuy
                    nhiên, không có phương pháp truyền tải nào qua internet là
                    100% an toàn.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Liên hệ với chúng tôi
                  </h3>
                  <p className="text-gray-700">
                    Nếu bạn có câu hỏi về Chính sách Bảo mật này hoặc các thực
                    hành bảo mật của chúng tôi, vui lòng liên hệ với chúng tôi
                    tại duongdn@gmail.com hoặc qua Trung tâm Hỗ trợ của chúng
                    tôi.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
