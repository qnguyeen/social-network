import { useState } from "react";
import { Button } from "..";
import { IoIosArrowForward } from "react-icons/io";
import * as UserService from "~/services/UserService";
import { useDispatch } from "react-redux";
import { resetUser } from "~/redux/Slices/userSlice";
import { useTranslation } from "react-i18next";
import CustomModal from "~/components/CustomModal";
import ConfirmDialog from "~/components/ConfirmDialog";
import { useMediaQuery } from "react-responsive";
import ActivateAccount from "~/components/DeleteAccount/ActivateAccount";
import DeleteAccountModal from "~/components/DeleteAccount/DeleteAccountModal";
import { message } from "antd";

function DeleteAccount({
  setting,
  isOpenDisableAccount,
  handleCloseDisableAccount,
  setIsOpenDisableAccount,
}) {
  const [openMain, setOpenMain] = useState(false);
  const [openActivateAccount, setOpenActivateAccount] = useState(false);
  const handleCloseActivateAccount = (reset) => {
    reset();
    setOpenActivateAccount(false);
  };
  const [openDeleteAccount, setOpenDeleteAccount] = useState(false);
  const handleCloseDeleteAccount = (reset) => {
    reset();
    setOpenDeleteAccount(false);
  };
  const { t } = useTranslation();
  const [isOpenConfirmActivateAccount, setIsOpenConfirmActivateAccount] =
    useState(false);
  const [isOpenConfirmDeleteAccount, setIsOpenConfirmDeleteAccount] =
    useState(false);
  const [dataDisableAccount, setDataDisableAccount] = useState(null);
  const [dataDeleteAccount, setDataDeleteAccount] = useState(null);
  const handleCloseConfirmActivateAccount = () =>
    setIsOpenConfirmActivateAccount(false);
  const handleCloseConfirmDeleteAccount = () =>
    setIsOpenConfirmDeleteAccount(false);
  const dispatch = useDispatch();
  const [loadingDisable, setLoadingDisable] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Detect mobile screen
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const handleCloseMain = () => setOpenMain(false);

  //disable account
  const handleDisableAccount = async () => {
    if (!dataDisableAccount?.password) return;

    setLoadingDisable(true);
    try {
      const res = await UserService.disableAccount({
        password: dataDisableAccount.password,
      });

      if (res) {
        message.success(`${t("Disable account successfully")}!`);
        dispatch(resetUser());
        setOpenConfirm(false);
        setData(null);
      }
    } catch (error) {
      if (error.response?.data?.code === 1006) {
        setIsOpenConfirmActivateAccount(false);
        setIsOpenDisableAccount(true);
        setOpenActivateAccount(true);
      }
    } finally {
      setLoadingDisable(false);
    }
  };

  //delete account
  const handleDeleteAccount = async () => {
    if (!dataDeleteAccount?.password) return;

    setLoadingDelete(true);
    try {
      const res = await UserService.deleteAccount({
        password: dataDeleteAccount?.password,
      });
      if (res) {
        message.success(`${t("Delete account successfully")}!`);
        dispatch(resetUser());
      }
    } catch (error) {
      if (error.response?.data?.code === 1006) {
        setIsOpenConfirmDeleteAccount(false);
        setIsOpenDisableAccount(true);
        setOpenDeleteAccount(true);
      }
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleOpenDeleteAccount = () => {
    setOpenDeleteAccount(true);
  };

  const handleOpenActivateAccount = () => {
    setOpenActivateAccount(true);
  };

  const handleOpenConfirmActivateAccount = (data) => {
    handleCloseDisableAccount();
    setOpenActivateAccount(false);
    setDataDisableAccount(data);
    setIsOpenConfirmActivateAccount(true);
  };

  const handleOpenConfirmDeleteAccount = (data) => {
    handleCloseDisableAccount();
    setOpenDeleteAccount(false);
    setDataDeleteAccount(data);
    setIsOpenConfirmDeleteAccount(true);
  };

  return (
    <div>
      <ConfirmDialog
        open={isOpenConfirmActivateAccount}
        onClose={handleCloseConfirmActivateAccount}
        title={t("Vô hiệu hóa tài khoản")}
        description={t(
          "Bạn có chắc chắn muốn vô hiệu hóa tài khoản này? Sau khi xác nhận, bạn sẽ bị đăng xuất khỏi hệ thống"
        )}
        loading={loadingDisable}
        onConfirm={handleDisableAccount}
        confirmText={t("Vô hiệu hóa")}
        className={`${isMobile ? "w-full max-w-xs" : "w-[330px]"}`}
        variant="danger"
      />

      <ConfirmDialog
        open={isOpenConfirmDeleteAccount}
        onClose={handleCloseConfirmDeleteAccount}
        title={t("Xóa tài khoản")}
        description={t("Sau khi xác nhận, bạn sẽ bị đăng xuất khỏi hệ thống")}
        loading={loadingDelete}
        onConfirm={handleDeleteAccount}
        confirmText="Delete"
        className={`${isMobile ? "w-full max-w-xs" : "w-[330px]"}`}
        variant="danger"
      />
      {setting && (
        <IoIosArrowForward
          size={20}
          className="cursor-pointer text-bgStandard"
        />
      )}
      {/* main */}
      <CustomModal
        className={`${
          isMobile ? "w-full max-w-sm px-4" : "w-[550px]"
        } bg-primary p-8 rounded-2xl shadow-lg`}
        isOpen={isOpenDisableAccount || openMain}
        onClose={handleCloseDisableAccount || handleCloseMain}
      >
        <div className="w-full flex font-semibold items-center justify-center text-lg mb-4">
          {t("Vô hiệu hóa hoặc xóa tài khoản")}
        </div>

        <div className="h-full flex flex-col w-full pb-6">
          {/* Deactivation Section */}
          <div className="w-full flex py-4 flex-col gap-2 border-b border-borderNewFeed">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </span>
              <span
                className={`font-semibold ${
                  isMobile ? "text-sm" : "text-base"
                }`}
              >
                {t("Vô hiệu hóa trang cá nhân chỉ mang tính tạm thời")}
              </span>
            </div>
            <p
              className={`${
                isMobile ? "text-xs" : "text-sm"
              } text-ascent-2 ml-7`}
            >
              {t(
                "Trang cá nhân, nội dung, lượt thích và người theo dõi trên LinkVerse của bạn sẽ không hiển thị với bất kỳ ai cho đến khi bạn đăng nhập lại để kích hoạt trang cá nhân"
              )}
            </p>
            <p
              className={`${
                isMobile ? "text-xs" : "text-sm"
              } text-ascent-2 ml-7 mt-1`}
            >
              {t(
                "Bạn có thể kích hoạt lại tài khoản bất cứ lúc nào bằng cách đăng nhập vào LinkVerse"
              )}
            </p>
          </div>

          {/* Deletion Section */}
          <div className="w-full flex py-4 flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </span>
              <h2
                className={`font-semibold ${
                  isMobile ? "text-sm" : "text-base"
                }`}
              >
                {t("Xóa trang cá nhân là mang tính vĩnh viễn")}
              </h2>
            </div>
            <p
              className={`${
                isMobile ? "text-xs" : "text-sm"
              } text-ascent-2 ml-7`}
            >
              {t(
                "Trước khi bị gỡ vĩnh viễn, trang cá nhân, nội dung, lượt thích và người theo dõi trên LinkVerse của bạn sẽ ẩn trong 30 ngày."
              )}
            </p>
            <p
              className={`${
                isMobile ? "text-xs" : "text-sm"
              } text-ascent-2 ml-7 mt-1`}
            >
              {t(
                "Sau 30 ngày, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục."
              )}
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-y-3 items-center justify-between mt-2">
          <Button
            onClick={handleOpenActivateAccount}
            title={t("Vô hiệu hóa tài khoản")}
            className="w-full text-ascent-3 bg-bgStandard flex items-center border-1 border-borderNewFeed justify-center py-3 rounded-xl "
          />
          <Button
            title={t("Xóa tài khoản")}
            className="border-1 border-borderNewFeed py-3 rounded-xl text-white bg-red-600 w-full flex items-center justify-center hover:bg-red-700"
            onClick={handleOpenDeleteAccount}
          />
          <Button
            title={t("Hủy")}
            className="w-full text-ascent-1 border-1 border-borderNewFeed bg-transparent flex items-center justify-center py-3 rounded-xl hover:bg-gray-50"
            onClick={handleCloseDisableAccount}
          />
        </div>
      </CustomModal>
      {/* 0 */}
      <ActivateAccount
        open={openActivateAccount}
        onSubmit={handleOpenConfirmActivateAccount}
        handleClose={handleCloseActivateAccount}
      />

      {/* 1 */}
      <DeleteAccountModal
        open={openDeleteAccount}
        onSubmit={handleOpenConfirmDeleteAccount}
        handleClose={handleCloseDeleteAccount}
      />
    </div>
  );
}

export default DeleteAccount;
