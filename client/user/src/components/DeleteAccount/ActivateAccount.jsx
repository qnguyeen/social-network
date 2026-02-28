import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";
import { FaCircleExclamation } from "react-icons/fa6";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useMediaQuery } from "react-responsive";
import { Button, TextInput } from "~/components";
import CustomModal from "~/components/CustomModal";

const ActivateAccount = ({ open, handleClose, onSubmit }) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [hide, setHide] = useState("hide");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });

  return (
    <CustomModal
      isOpen={open}
      onClose={() => handleClose(reset)}
      className={`bg-primary ${
        isMobile ? "w-full max-w-sm px-4" : "w-[450px]"
      } rounded-2xl p-8 gap-3 flex flex-col`}
    >
      <span className="font-semibold text-lg text-left w-full">
        {t("Vô hiệu hóa tài khoản")}
      </span>
      <span className={`text-ascent-2 ${isMobile ? "text-sm" : ""}`}>
        {t(
          "Việc vô hiệu hóa tài khoản của bạn chỉ là tạm thời. Nếu bạn đăng nhập lại vào tài khoản trong vòng 30 ngày, tài khoản sẽ tự động được kích hoạt lại."
        )}
      </span>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 w-full"
      >
        <span className="text-ascent-2 text-sm">
          {t("Để xác nhận, hãy nhập mật khẩu của bạn")}
        </span>
        <div
          className={`w-full flex ${
            isMobile ? "flex-col" : "flex-row"
          } gap-2 items-center`}
        >
          <TextInput
            name="password"
            placeholder={t("Mật khẩu")}
            type={hide === "hide" ? "password" : "text"}
            styles={`w-full text-black h-10 ${
              errors.password ? "border-red-600" : ""
            }`}
            autoFocus
            iconRight={
              errors.password ? (
                <FaCircleExclamation color="red" />
              ) : hide === "hide" ? (
                <IoMdEyeOff
                  className="cursor-pointer text-black"
                  onClick={() => setHide("show")}
                />
              ) : (
                <IoMdEye
                  className="cursor-pointer text-black"
                  onClick={() => setHide("hide")}
                />
              )
            }
            stylesContainer="mt-0"
            toolTip={errors.password ? errors.password.message : ""}
            {...register("password", {
              required: t("Mật khẩu là bắt buộc!"),
            })}
          />
          <Button
            type="submit"
            title={t("Vô hiệu hóa")}
            className={`inline-flex justify-center rounded-md bg-red-600 ${
              isMobile ? "w-full" : "w-full"
            } h-10 text-sm font-medium text-white outline-none`}
          />
        </div>
      </form>
    </CustomModal>
  );
};

export default ActivateAccount;
