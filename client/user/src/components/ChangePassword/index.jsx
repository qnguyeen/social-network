import { useEffect, useState } from "react";
import { Button, TextInput } from "~/components";
import { useTranslation } from "react-i18next";
import { IoIosArrowForward, IoMdEye, IoMdEyeOff } from "react-icons/io";
import { useForm } from "react-hook-form";
import { FaArrowLeft } from "react-icons/fa";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as UserService from "~/services/UserService";
import { FaCircleExclamation } from "react-icons/fa6";
import { GoLock } from "react-icons/go";
import { message } from "antd";
import CustomModal from "~/components/CustomModal";
import ConfirmDialog from "~/components/ConfirmDialog";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { resetUser } from "~/redux/Slices/userSlice";

const ChangePassword = ({
  setting,
  isOpenChangePassword,
  handleCloseChangePassword,
}) => {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Password visibility states
  const [passwordVisibility, setPasswordVisibility] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const mutation = useMutationHook((data) => UserService.changePassword(data));
  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      if (data?.code === 1044) {
        setOpenConfirm(false);
        message.open({
          type: "error",
          content: t(data?.message) || t("Mật khẩu không đúng"),
        });
      } else {
        dispatch(resetUser());
        navigate("/login");
        message.open({
          type: "success",
          content:
            t(data?.message) ||
            t("Đã thay đổi mật khẩu thành công. Vui lòng đăng nhập lại"),
        });
      }
    }
  }, [isSuccess, data, t, dispatch, navigate]);

  const onSubmit = (data) => {
    handleCloseChangePassword();
    setFormData(data);
    setOpenConfirm(true);
  };

  const handleConfirm = () => {
    mutation.mutate({ data: formData });
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleOpenChangePassword = () => {
    if (setting && typeof handleCloseChangePassword === "function") {
      handleCloseChangePassword(true);
    }
  };

  const handleClose = () => {
    handleCloseChangePassword();
  };

  // Password validation rules
  const passwordValidation = {
    required: t("Mật khẩu là bắt buộc"),
    validate: {
      noSpaces: (value) =>
        !/\s/.test(value) || t("Mật khẩu không được chứa khoảng trắng"),
    },
    minLength: {
      value: 8,
      message: t("Mật khẩu phải chứa ít nhất 8 ký tự"),
    },
    maxLength: {
      value: 64,
      message: t("Mật khẩu không được quá 64 ký tự"),
    },
    pattern: {
      value:
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/,
      message: t(
        "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
      ),
    },
  };

  return (
    <div>
      {setting && (
        <IoIosArrowForward
          onClick={handleOpenChangePassword}
          size={20}
          className="cursor-pointer text-bgStandard"
        />
      )}

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirm}
        loading={isPending}
        title={t("Bạn có chắc không")}
        description={t(
          "Bạn có chắc chắn muốn đổi mật khẩu? Sau khi đổi mật khẩu thành công, bạn sẽ bị đăng xuất khỏi tất cả thiết bị để bảo mật tài khoản. Vui lòng đăng nhập lại bằng mật khẩu mới."
        )}
        confirmText={t("Xác nhận")}
        variant="danger"
        className="w-[300px]"
      />

      <CustomModal
        className="bg-primary w-full md:w-[500px] max-w-[95vw] p-4 md:p-6 shadow-newFeed rounded-2xl border-1 border-borderNewFeed"
        isOpen={isOpenChangePassword}
        onClose={handleClose}
      >
        <p className="text-ascent-1 text-base md:text-xl pb-2 font-semibold">
          {t("Thay đổi mật khẩu")}
        </p>
        <span className="text-xs md:text-sm leading-normal text-ascent-2">
          {t(
            "Để thay đổi mật khẩu, vui lòng điền vào các trường bên dưới. Mật khẩu của bạn phải chứa ít nhất 8 ký tự, mật khẩu cũng phải bao gồm ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt."
          )}
        </span>

        <form onSubmit={handleSubmit(onSubmit)} className="py-2 flex flex-col">
          <div className="w-full flex flex-col gap-2">
            <TextInput
              name="oldPassword"
              placeholder={t("Mật khẩu hiện tại")}
              label={t("Mật khẩu hiện tại")}
              type={passwordVisibility.oldPassword ? "text" : "password"}
              register={register("oldPassword", passwordValidation)}
              iconRight={
                errors.oldPassword ? (
                  <FaCircleExclamation color="red" />
                ) : !passwordVisibility.oldPassword ? (
                  <IoMdEyeOff
                    className="cursor-pointer"
                    onClick={() => togglePasswordVisibility("oldPassword")}
                  />
                ) : (
                  <IoMdEye
                    className="cursor-pointer"
                    onClick={() => togglePasswordVisibility("oldPassword")}
                  />
                )
              }
              iconLeft={<GoLock className="text-ascent-1" />}
              iconRightStyles="right-3 md:right-5"
              styles={`w-full border-1 border-borderNewFeed bg-primary text-ascent-1 rounded-xl text-sm md:text-base ${
                errors.oldPassword ? "border-red-600" : ""
              }`}
              toolTip={errors.oldPassword ? errors.oldPassword?.message : ""}
              labelStyles="ml-2 text-sm md:text-base"
            />

            <TextInput
              name="newPassword"
              placeholder={t("Mật khẩu mới")}
              label={t("Mật khẩu mới")}
              type={passwordVisibility.newPassword ? "text" : "password"}
              register={register("newPassword", {
                ...passwordValidation,
                validate: {
                  ...passwordValidation.validate,
                  notSameAsOld: (value) =>
                    value !== getValues("oldPassword") ||
                    t("Mật khẩu mới không được trùng với mật khẩu cũ"),
                },
              })}
              iconRight={
                errors.newPassword ? (
                  <FaCircleExclamation color="red" />
                ) : !passwordVisibility.newPassword ? (
                  <IoMdEyeOff
                    className="cursor-pointer"
                    onClick={() => togglePasswordVisibility("newPassword")}
                  />
                ) : (
                  <IoMdEye
                    className="cursor-pointer"
                    onClick={() => togglePasswordVisibility("newPassword")}
                  />
                )
              }
              iconLeft={<GoLock className="text-ascent-1" />}
              iconRightStyles="right-3 md:right-5"
              styles={`w-full border-1 border-borderNewFeed bg-primary text-ascent-1 rounded-xl text-sm md:text-base ${
                errors.newPassword ? "border-red-600" : ""
              }`}
              toolTip={errors.newPassword ? errors.newPassword?.message : ""}
              labelStyles="ml-2 text-sm md:text-base"
            />

            <TextInput
              name="confirmPassword"
              placeholder={t("Xác nhận mật khẩu mới")}
              label={t("Xác nhận mật khẩu mới")}
              type={passwordVisibility.confirmPassword ? "text" : "password"}
              register={register("confirmPassword", {
                required: t("Xác nhận mật khẩu là bắt buộc"),
                validate: (value) => {
                  const { newPassword } = getValues();
                  return newPassword === value || t("Mật khẩu không khớp");
                },
              })}
              iconRight={
                errors.confirmPassword ? (
                  <FaCircleExclamation color="red" />
                ) : !passwordVisibility.confirmPassword ? (
                  <IoMdEyeOff
                    className="cursor-pointer"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  />
                ) : (
                  <IoMdEye
                    className="cursor-pointer"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                  />
                )
              }
              iconLeft={<GoLock className="text-ascent-1" />}
              iconRightStyles="right-3 md:right-5"
              styles={`w-full border-1 border-borderNewFeed text-ascent-1 bg-primary rounded-xl text-sm md:text-base ${
                errors.confirmPassword ? "border-red-600" : ""
              }`}
              toolTip={
                errors.confirmPassword ? errors.confirmPassword?.message : ""
              }
              labelStyles="ml-2 text-sm md:text-base"
            />
          </div>

          <div className="relative">
            <Button
              type="submit"
              className="inline-flex hover:opacity-90 w-full justify-center rounded-md bg-bgStandard px-4 md:px-8 py-2 md:py-3 text-xs md:text-sm text-primary font-medium outline-none mt-3"
              title={t("Xác nhận")}
            />
          </div>
        </form>
      </CustomModal>
    </div>
  );
};

export default ChangePassword;
