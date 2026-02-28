import React from "react";
import { Cookie, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageMeta } from "~/components";

const CookiePolicyPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <PageMeta title={t("Chính sách Cookie")} />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => navigate("/settings")}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Quay lại LinkVerse</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-blue-600">LinkVerse</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Cookie className="w-6 h-6 text-gray-600" />
              <span className="text-lg font-medium text-gray-900">
                Chính sách Cookie
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Cookie className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                Chính sách Cookie
              </h2>
            </div>
          </div>
          <div className="px-6 py-6">
            <div className="prose max-w-none">
              <p className="text-sm text-gray-500 mb-6">
                Cập nhật lần cuối: 15 tháng 1 năm 2025
              </p>

              <div className="space-y-8">
                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Cookie là gì?
                  </h3>
                  <p className="text-gray-700">
                    Cookie là các tệp văn bản nhỏ được lưu trên thiết bị của bạn
                    khi bạn truy cập trang web của chúng tôi. Chúng giúp chúng
                    tôi mang lại trải nghiệm tốt hơn bằng cách ghi nhớ tùy chọn
                    của bạn và phân tích cách bạn sử dụng nền tảng.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Các loại cookie chúng tôi sử dụng
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Cookie thiết yếu
                      </h4>
                      <p className="text-gray-700 mb-2">
                        Những cookie này cần thiết để trang web của chúng tôi
                        hoạt động đúng cách. Chúng cho phép các chức năng cốt
                        lõi như bảo mật, quản lý mạng và khả năng truy cập.
                      </p>
                      <p className="text-sm text-gray-600">
                        Ví dụ: Cookie phiên, cookie xác thực, cookie cân bằng
                        tải
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Cookie hiệu suất
                      </h4>
                      <p className="text-gray-700 mb-2">
                        Những cookie này giúp chúng tôi hiểu cách khách truy cập
                        tương tác với trang web bằng cách thu thập và báo cáo
                        thông tin một cách ẩn danh.
                      </p>
                      <p className="text-sm text-gray-600">
                        Ví dụ: Google Analytics, thời gian tải trang, theo dõi
                        lỗi
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Cookie chức năng
                      </h4>
                      <p className="text-gray-700 mb-2">
                        Những cookie này cho phép các chức năng nâng cao và cá
                        nhân hóa như ghi nhớ tùy chọn và cài đặt của bạn.
                      </p>
                      <p className="text-sm text-gray-600">
                        Ví dụ: Tùy chọn ngôn ngữ, cài đặt giao diện, tùy chỉnh
                        giao diện người dùng
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Cookie tiếp thị
                      </h4>
                      <p className="text-gray-700 mb-2">
                        Những cookie này theo dõi thói quen duyệt web của bạn để
                        chúng tôi có thể hiển thị quảng cáo phù hợp với bạn hơn.
                      </p>
                      <p className="text-sm text-gray-600">
                        Ví dụ: Cookie mạng xã hội, cookie mạng quảng cáo, theo
                        dõi hành vi
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Cookie của bên thứ ba
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Chúng tôi có thể cho phép các nhà cung cấp dịch vụ bên thứ
                    ba đặt cookie trên thiết bị của bạn để cung cấp dịch vụ cho
                    chúng tôi. Các bên này có thể bao gồm:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Google Analytics để phân tích trang web</li>
                    <li>Các nền tảng mạng xã hội để chia sẻ</li>
                    <li>Các đối tác quảng cáo để hiển thị quảng cáo phù hợp</li>
                    <li>
                      Các công cụ hỗ trợ khách hàng như trò chuyện trực tuyến
                    </li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Quản lý tùy chọn cookie của bạn
                  </h3>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">
                      Cài đặt trình duyệt
                    </h4>
                    <p className="text-gray-700 mb-4">
                      Hầu hết các trình duyệt web cho phép bạn kiểm soát cookie
                      thông qua phần cài đặt. Bạn có thể tìm các tùy chọn này
                      trong mục "Cài đặt" hoặc "Tùy chọn" của trình duyệt.
                    </p>

                    <h4 className="font-semibold text-gray-900">
                      Trình quản lý chấp thuận cookie
                    </h4>
                    <p className="text-gray-700 mb-4">
                      Khi bạn truy cập LinkVerse lần đầu, bạn sẽ thấy một biểu
                      ngữ xin phép sử dụng cookie cho phép bạn chọn loại cookie
                      muốn chấp nhận. Bạn có thể cập nhật tùy chọn bất kỳ lúc
                      nào bằng cách nhấp vào liên kết "Cài đặt cookie" ở chân
                      trang.
                    </p>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-yellow-800 text-sm">
                        <strong>Quan trọng:</strong> Vô hiệu hóa một số cookie
                        có thể giới hạn chức năng của LinkVerse và ảnh hưởng đến
                        trải nghiệm người dùng của bạn.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Thời gian lưu trữ cookie
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Cookie phiên
                      </h4>
                      <p className="text-gray-700">
                        Đây là cookie tạm thời, sẽ hết hiệu lực khi bạn đóng
                        trình duyệt.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Cookie vĩnh viễn
                      </h4>
                      <p className="text-gray-700">
                        Những cookie này được giữ lại trên thiết bị của bạn
                        trong một khoảng thời gian cố định hoặc cho đến khi bạn
                        xóa chúng. Thời gian lưu trữ có thể từ 30 ngày đến 2 năm
                        tùy vào mục đích sử dụng.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Cập nhật chính sách này
                  </h3>
                  <p className="text-gray-700">
                    Chúng tôi có thể cập nhật Chính sách Cookie này theo thời
                    gian để phản ánh các thay đổi trong hoạt động, pháp lý hoặc
                    quy định. Chúng tôi sẽ thông báo cho bạn nếu có thay đổi
                    quan trọng bằng cách đăng tải phiên bản mới trên trang web.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Liên hệ với chúng tôi
                  </h3>
                  <p className="text-gray-700">
                    Nếu bạn có bất kỳ câu hỏi nào về việc sử dụng cookie của
                    chúng tôi hoặc Chính sách Cookie này, vui lòng liên hệ với
                    chúng tôi tại cookies@linkverse.com hoặc qua Trung tâm hỗ
                    trợ.
                  </p>
                </section>

                <div className="bg-blue-50 p-6 rounded-lg mt-8">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Quản lý tùy chọn cookie của bạn
                  </h4>
                  <p className="text-blue-700 mb-4">
                    Bạn có thể tùy chỉnh các tùy chọn cookie của mình bất kỳ lúc
                    nào.
                  </p>
                  <span className=" text-blue-900 rounded-md  transition-colors">
                    Liên hệ Hỗ trợ: duongdn@gmail.com
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CookiePolicyPage;
