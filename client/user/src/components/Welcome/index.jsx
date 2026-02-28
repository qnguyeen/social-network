import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CustomModal from "~/components/CustomModal";

const Welcome = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClose = () => {
    setShow(false);
  };

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("token");
    if (!isLoggedIn) {
      setShow(true);
    }
  }, []);

  return (
    <CustomModal
      className="w-[95%] sm:w-11/12 max-w-xs sm:max-w-md md:max-w-2xl bg-primary border-1 border-borderNewFeed px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-14 text-center gap-y-3 sm:gap-y-4 md:gap-y-7 flex-col rounded-xl sm:rounded-2xl flex items-center justify-center mx-4 sm:mx-auto"
      isOpen={show}
      onClose={handleClose}
    >
      {/* Header Section */}
      <div className="px-2 sm:px-3 space-y-1 sm:space-y-2">
        <h1 className="text-ascent-1 tracking-tight text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold leading-tight">
          {t("Chào mừng đến với LinkVerse")}
        </h1>
        <h1 className="text-ascent-1 tracking-tight text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold leading-tight">
          {t("Vũ trụ xã hội đang chờ đón bạn")}
        </h1>
      </div>

      {/* Description Section */}
      <div className="flex flex-col px-2 sm:px-4 md:px-6 space-y-1 sm:space-y-2">
        <p className="text-center text-ascent-2 text-sm sm:text-base leading-relaxed">
          {t("Tham gia LinkVerse để kết nối, chia sẻ và khám phá vô tận")}
        </p>
        <span className="text-ascent-2 text-xs sm:text-sm leading-relaxed">
          {t("khả năng giao lưu với bạn bè và cộng đồng")}
        </span>
        <span className="text-ascent-2 text-xs sm:text-sm leading-relaxed">
          {t("Đăng nhập ngay và tham gia cuộc trò chuyện")}
        </span>
      </div>

      {/* Button Section */}
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="text-ascent-3 bg-bgStandard  hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2557D6] focus:ring-opacity-50 font-medium rounded-lg text-sm sm:text-base gap-x-2 px-4 sm:px-5 py-2.5 sm:py-3 text-center inline-flex items-center justify-center mt-2 sm:mt-3 md:mt-4 w-full sm:w-auto min-w-[200px] shadow-lg"
      >
        <span className="truncate">{t("Tiếp tục với LinkVerse")}</span>
      </button>
    </CustomModal>
  );
};

export default Welcome;
