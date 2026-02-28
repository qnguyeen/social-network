import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaCircleExclamation } from "react-icons/fa6";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useMediaQuery } from "react-responsive";
import { Button, TextInput } from "~/components";
import CustomModal from "~/components/CustomModal";

const DeleteAccountModal = ({ open, handleClose, onSubmit }) => {
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
        isMobile ? "w-full max-w-sm px-4" : "w-[500px]"
      } rounded-2xl p-10 gap-3 flex items-center flex-col`}
    >
      <span className="font-semibold text-lg text-left w-full">
        {t("Delete account")}
      </span>
      <span className={`font-extralight ${isMobile ? "text-sm" : ""}`}>
        {t(
          "Deleting your account will remove all of your information from our database. This cannot be undone."
        )}
      </span>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-2 w-full"
      >
        <span className="text-ascent-2 text-sm">
          {t("To confirm this, type your password")}
        </span>
        <div
          className={`w-full flex ${
            isMobile ? "flex-col" : "flex-row"
          } gap-2 items-center`}
        >
          <TextInput
            name="password"
            placeholder={t("Password")}
            type={hide === "hide" ? "password" : "text"}
            styles={`w-full text-black h-10 ${
              errors.password ? "border-red-600" : ""
            }`}
            iconRight={
              errors.password ? (
                <FaCircleExclamation color="red" />
              ) : hide === "hide" ? (
                <IoMdEyeOff
                  className="cursor-pointer"
                  onClick={() => setHide("show")}
                />
              ) : (
                <IoMdEye
                  className="cursor-pointer"
                  onClick={() => setHide("hide")}
                />
              )
            }
            autoFocus
            stylesContainer="mt-0"
            toolTip={errors.password ? errors.password.message : ""}
            {...register("password", {
              required: t("Password is required"),
            })}
          />
          <Button
            type="submit"
            title={t("Delete account")}
            className={`inline-flex font-semibold justify-center rounded-md bg-red-600 ${
              isMobile ? "w-full" : "w-full"
            } h-10 text-sm text-white outline-none`}
          />
        </div>
      </form>
    </CustomModal>
  );
};

export default DeleteAccountModal;
