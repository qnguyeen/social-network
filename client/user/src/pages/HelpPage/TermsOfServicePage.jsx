import React from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PageMeta } from "~/components";

const TermsOfServicePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50">
      <PageMeta title={t("Điều khoản dịch vụ")} />
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
              <FileText className="w-6 h-6 text-gray-600" />
              <span className="text-lg font-medium text-gray-900">
                Điều khoản dịch vụ
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                Điều khoản dịch vụ
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
                    Chấp nhận Điều khoản
                  </h3>
                  <p className="text-gray-700">
                    Khi truy cập hoặc sử dụng LinkVerse, bạn đồng ý bị ràng buộc
                    bởi các Điều khoản dịch vụ này và tất cả các luật và quy
                    định hiện hành. Nếu bạn không đồng ý với bất kỳ điều khoản
                    nào, bạn không được sử dụng dịch vụ này.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Mô tả Dịch vụ
                  </h3>
                  <p className="text-gray-700">
                    LinkVerse là nền tảng mạng xã hội cho phép người dùng kết
                    nối, chia sẻ nội dung và giao tiếp với nhau. Chúng tôi cung
                    cấp nhiều tính năng như tạo hồ sơ cá nhân, chia sẻ nội dung,
                    nhắn tin và các công cụ tương tác cộng đồng.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Tài khoản người dùng
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Để sử dụng một số tính năng của LinkVerse, bạn cần tạo tài
                      khoản. Bạn đồng ý:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Cung cấp thông tin chính xác, hiện tại và đầy đủ</li>
                      <li>Duy trì và cập nhật thông tin tài khoản</li>
                      <li>Giữ bảo mật mật khẩu</li>
                      <li>
                        Chịu trách nhiệm cho mọi hoạt động trong tài khoản của
                        bạn
                      </li>
                      <li>
                        Thông báo ngay cho chúng tôi nếu có hoạt động trái phép
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Nội dung và Hành vi
                  </h3>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">
                      Nội dung bị cấm
                    </h4>
                    <p className="text-gray-700">
                      Bạn không được đăng, chia sẻ hoặc truyền tải nội dung:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Vi phạm pháp luật, gây hại, đe dọa hoặc lạm dụng</li>
                      <li>Quấy rối, bắt nạt hoặc đe dọa người khác</li>
                      <li>Chứa ngôn từ thù ghét hoặc phân biệt đối xử</li>
                      <li>Xâm phạm quyền sở hữu trí tuệ</li>
                      <li>
                        Chứa thư rác, phần mềm độc hại hoặc nội dung gây hiểu
                        lầm
                      </li>
                      <li>
                        Xâm phạm quyền riêng tư hoặc an toàn của người khác
                      </li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Sở hữu trí tuệ
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Bạn giữ quyền sở hữu đối với nội dung bạn đăng trên
                    LinkVerse. Tuy nhiên, bằng việc đăng tải nội dung, bạn đồng
                    ý cấp cho LinkVerse quyền sử dụng không độc quyền, miễn phí
                    bản quyền, trên toàn cầu để sử dụng, hiển thị, sao chép và
                    phân phối nội dung của bạn liên quan đến dịch vụ của chúng
                    tôi.
                  </p>
                  <p className="text-gray-700">
                    LinkVerse và các nội dung, tính năng, chức năng gốc của nền
                    tảng thuộc sở hữu của LinkVerse và được bảo vệ bởi luật bản
                    quyền, thương hiệu và các luật sở hữu trí tuệ quốc tế khác.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Quyền riêng tư
                  </h3>
                  <p className="text-gray-700">
                    Quyền riêng tư của bạn rất quan trọng với chúng tôi. Vui
                    lòng xem Chính sách quyền riêng tư của chúng tôi để hiểu rõ
                    cách chúng tôi thu thập và sử dụng thông tin của bạn.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Chấm dứt
                  </h3>
                  <p className="text-gray-700">
                    Chúng tôi có thể chấm dứt hoặc tạm ngưng tài khoản và quyền
                    truy cập của bạn vào LinkVerse ngay lập tức, không cần thông
                    báo trước, nếu bạn vi phạm các Điều khoản dịch vụ này. Bạn
                    cũng có thể xóa tài khoản bất kỳ lúc nào thông qua cài đặt
                    tài khoản.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Miễn trừ và Giới hạn Trách nhiệm
                  </h3>
                  <p className="text-gray-700">
                    LinkVerse được cung cấp “nguyên trạng” và không có bất kỳ
                    đảm bảo nào. Chúng tôi không đảm bảo rằng dịch vụ sẽ luôn
                    hoạt động liên tục, an toàn hoặc không có lỗi. Trách nhiệm
                    pháp lý của chúng tôi bị giới hạn tối đa theo quy định của
                    pháp luật.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Thay đổi Điều khoản
                  </h3>
                  <p className="text-gray-700">
                    Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc
                    nào. Chúng tôi sẽ thông báo cho người dùng về các thay đổi
                    quan trọng qua email hoặc trên nền tảng. Việc bạn tiếp tục
                    sử dụng LinkVerse sau khi điều khoản được cập nhật đồng
                    nghĩa với việc bạn chấp nhận các điều khoản mới.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Thông tin Liên hệ
                  </h3>
                  <p className="text-gray-700">
                    Mọi thắc mắc về Điều khoản dịch vụ vui lòng gửi email đến:
                    duongdn@gmail.com
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

export default TermsOfServicePage;
