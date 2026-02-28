import React, { useEffect, useState } from "react";
import { Button } from "..";
import { useDispatch, useSelector } from "react-redux";
import { useMutationHook } from "~/hooks/useMutationHook";
import { useTranslation } from "react-i18next";
import * as UserService from "~/services/UserService";
import { ColorPicker, Input, message } from "antd";
import { updateUser } from "~/redux/Slices/userSlice";
import { ImUserPlus } from "react-icons/im";
import TextArea from "antd/es/input/TextArea";
import { FiPlus } from "react-icons/fi";
import DialogCustom from "~/components/DialogCustom";
import { PiNotePencil } from "react-icons/pi";

const UpdateUser = ({ profile, profileCard, coverImage }) => {
  const user = useSelector((state) => state?.user);
  const { t } = useTranslation();
  const theme = useSelector((state) => state?.theme?.theme);
  const [show, setShow] = useState("");
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [company, setCompany] = useState("");
  const [quote, setQuote] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isValidImageUrl, setIsValidImageUrl] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [city, setCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneNumberError, setPhoneNumberError] = useState("");
  const [themeColor, setThemeColor] = useState("");
  const handleDialog = () => setShow((prev) => !prev);
  const onChangeFirstName = (e) => setFirstName(e.target.value);
  const onChangeLastName = (e) => setLastName(e.target.value);
  const onChangeBio = (e) => setBio(e.target.value);
  const onChangeCity = (e) => setCity(e.target.value);
  const onChangeCompany = (e) => setCompany(e.target.value);
  const onChangeThemeColor = (color) => setThemeColor(color.toCssString());
  const onChangeQuote = (e) => setQuote(e.target.value);
  const onChangeJobTitle = (e) => setJobTitle(e.target.value);

  const onChangeCoverImageUrl = (e) => {
    const value = e.target.value;
    setCoverImageUrl(value);

    // Reset validation state when input changes
    if (value === "") {
      setIsValidImageUrl(true);
      setImageLoading(false);
      return;
    }

    // Start loading state
    setImageLoading(true);
    setIsValidImageUrl(false);

    // Create a new image object to test the URL
    const img = new Image();
    img.onload = () => {
      setIsValidImageUrl(true);
      setImageLoading(false);
    };
    img.onerror = () => {
      setIsValidImageUrl(false);
      setImageLoading(false);
    };
    img.src = value;
  };

  const onChangePhoneNumber = (e) => {
    const value = e.target.value;
    // Only allow digits
    if (value === "" || /^\d+$/.test(value)) {
      setPhoneNumber(value);

      // Validate phone number format
      if (value && value.length > 0) {
        if (value.length !== 10) {
          setPhoneNumberError(t("Số điện thoại phải có 10 chữ số"));
        } else {
          setPhoneNumberError("");
        }
      } else {
        setPhoneNumberError("");
      }
    }
  };

  useEffect(() => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setPhoneNumber(user?.phoneNumber || "");
    setCity(user?.city || "");
    setBio(user?.bio || "");
    setCompany(user?.company || "");
    setJobTitle(user?.jobTitle || "");
    setQuote(user?.quote || "");
    setThemeColor(user?.themeColor || "");
    setCoverImageUrl(user?.coverImageUrl || "");

    // Validate initial cover image URL if present
    if (user?.coverImageUrl) {
      const img = new Image();
      img.onload = () => setIsValidImageUrl(true);
      img.onerror = () => setIsValidImageUrl(false);
      img.src = user.coverImageUrl;
    }
  }, [user]);

  const mutation = useMutationHook(({ data }) =>
    UserService.updateProfile({ data })
  );
  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      dispatch(updateUser({ ...data?.result, token: user?.token }));
      message.destroy();
      message.open({
        type: "success",
        content: t("Chỉnh sửa thông tin người dùng thành công"),
      });
    } else if (isPending) {
      setShow(false);
      message.loading({
        content: t("Cập nhật thông tin người dùng..."),
        duration: 0,
      });
    }
  }, [isSuccess, isPending]);

  const mutationUpdateAvatar = useMutationHook((data) =>
    UserService.setAvatar({ data })
  );
  const {
    data: dataUpdateAvatar,
    isPending: isPendingAvatar,
    isSuccess: isSuccessUpdateAvatar,
  } = mutationUpdateAvatar;

  useEffect(() => {
    if (isPendingAvatar) {
      message.loading({ content: t("Cập nhật ảnh đại diện..."), duration: 0 });
    } else if (isSuccessUpdateAvatar) {
      message.destroy();
      message.success({ content: dataUpdateAvatar });
    }
  }, [isSuccessUpdateAvatar, isPendingAvatar]);

  const handleChangeAvatar = (e) => {
    const file = e.target.files[0];
    const request = {
      content: user?.username + " " + t("vừa cập nhật ảnh đại diện"),
      visibility: "PRIVATE",
    };
    const data = { request, file };
    mutationUpdateAvatar.mutate(data);
  };

  const onSubmit = () => {
    if (phoneNumberError) {
      message.error(phoneNumberError);
      return;
    }

    if (coverImageUrl && !isValidImageUrl) {
      message.error(t("URL ảnh bìa không hợp lệ"));
      return;
    }

    const data = {
      firstName,
      lastName,
      bio,
      phoneNumber,
      city,
      company,
      jobTitle,
      quote,
      coverImageUrl,
      themeColor,
    };
    mutation.mutate({ data });
  };

  return (
    <>
      {profile && (
        <Button
          onClick={handleDialog}
          title={t("Edit profile")}
          className="w-full sm:w-[150px] py-2 hover:scale-105 active:scale-95 transition-transform rounded-3xl bg-bgStandard text-ascent-3"
        />
      )}

      {coverImage && (
        <div onClick={handleDialog}>
          <PiNotePencil
            size={10}
            className={`text-gray-700 hover:scale-105 active:scale-95 transition-transform ${
              show && "opacity-50"
            }`}
          />
        </div>
      )}

      {profileCard && (
        <div onClick={handleDialog}>
          <PiNotePencil
            size={12}
            className={`text-gray-700 ${show && "opacity-50"}`}
          />
        </div>
      )}

      <DialogCustom
        isOpen={show}
        theme={theme}
        width={"min(90vw, 550px)"}
        style={{ overflow: "visible" }}
        handleCloseDiaLogAdd={handleDialog}
      >
        <div className="w-full max-w-[550px] border-1 border-borderNewFeed rounded-2xl mx-auto shadow-newFeed bg-primary">
          <form className="flex w-full flex-col px-4 sm:px-8 py-3">
            {/* First Name and Avatar Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 gap-4">
              <div className="flex flex-col w-full sm:flex-1">
                <span className="text-ascent-1 text-left text-sm mb-1">
                  {t("Họ")}
                </span>
                <Input
                  count={{
                    show: true,
                    max: 30,
                  }}
                  className="bg-primary hover:bg-primary border-1 border-borderNewFeed outline-none text-ascent-1"
                  value={firstName}
                  onChange={onChangeFirstName}
                  minLength={1}
                  maxLength={30}
                  name="firstName"
                  placeholder="Add first name"
                />
              </div>
              
              {/* Avatar Section */}
              <div className="flex-shrink-0 self-center sm:self-auto">
                {user?.imageUrl ? (
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-bgSearch relative">
                    <img
                      src={user?.imageUrl}
                      alt="avatar"
                      className="w-12 h-12 object-cover rounded-full"
                    />

                    <input
                      type="file"
                      onChange={handleChangeAvatar}
                      className="hidden"
                      id="imgUpload"
                      data-max-size="5120"
                      accept=".jpg, .png, .jpeg"
                    />

                    <div
                      className="absolute hover:scale-105 active:scale-95 transition-transform bottom-0 right-0 bg-primary rounded-full flex items-center justify-center cursor-pointer border border-white shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById("imgUpload")?.click();
                      }}
                    >
                      <FiPlus className="text-ascent-1" size={12} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-bgSearch">
                    <label
                      htmlFor="imgUpload"
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <input
                        type="file"
                        onChange={handleChangeAvatar}
                        className="hidden"
                        id="imgUpload"
                        data-max-size="5120"
                        accept=".jpg, .png, .jpeg"
                      />
                      <ImUserPlus />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full border-t border-borderNewFeed"></div>

            {/* Last Name */}
            <div className="flex items-center justify-between py-3">
              <div className="flex flex-col w-full">
                <span className="text-ascent-1 text-left text-sm mb-1">
                  {t("Tên")}
                </span>
                <Input
                  className="bg-primary hover:bg-primary border-1 border-borderNewFeed outline-none text-ascent-1"
                  count={{
                    show: true,
                    max: 30,
                  }}
                  value={lastName}
                  onChange={onChangeLastName}
                  minLength={1}
                  maxLength={30}
                  name="lastName"
                  placeholder="Add last name"
                />
              </div>
            </div>

            <div className="w-full border-t border-borderNewFeed"></div>

            {/* Bio */}
            <div className="flex items-center w-full justify-between py-3">
              <div className="flex w-full flex-col">
                <span className="text-ascent-1 text-left text-sm mb-1">
                  {t("Tiểu sử")}
                </span>
                <TextArea
                  showCount
                  rows={4}
                  name="bio"
                  className="bg-primary hover:bg-primary border-1 border-borderNewFeed outline-none text-ascent-1"
                  value={bio}
                  onChange={onChangeBio}
                  maxLength={300}
                  placeholder={t("Thêm tiểu sử")}
                />
              </div>
            </div>

            <div className="w-full border-t border-borderNewFeed mt-2 sm:mt-4"></div>

            {/* Phone Number */}
            <div className="flex items-center w-full justify-between py-3">
              <div className="flex w-full flex-col">
                <span className="text-ascent-1 text-left text-sm mb-1">
                  {t("Số điện thoại")}
                </span>
                <Input
                  count={{
                    show: true,
                    max: 10,
                  }}
                  className="bg-primary hover:bg-primary border-1 border-borderNewFeed outline-none text-ascent-1"
                  value={phoneNumber}
                  onChange={onChangePhoneNumber}
                  maxLength={10}
                  name="phoneNumber"
                  placeholder={t("Thêm số điện thoại")}
                  status={phoneNumberError ? "error" : ""}
                />
                {phoneNumberError && (
                  <span className="text-red-500 text-xs mt-1">
                    {phoneNumberError}
                  </span>
                )}
              </div>
            </div>

            <div className="w-full border-t border-borderNewFeed"></div>

            {/* Quote */}
            <div className="flex items-center w-full justify-between py-3">
              <div className="flex w-full flex-col">
                <span className="text-ascent-1 text-left text-sm mb-1">
                  {t("Trích dẫn")}
                </span>
                <TextArea
                  count={{
                    show: true,
                    max: 100,
                  }}
                  rows={2}
                  className="bg-primary hover:bg-primary border-1 border-borderNewFeed outline-none text-ascent-1"
                  value={quote}
                  onChange={onChangeQuote}
                  maxLength={100}
                  name="quote"
                  placeholder={t("Thêm trích dẫn")}
                />
              </div>
            </div>

            <div className="w-full border-t border-borderNewFeed mt-2 sm:mt-4"></div>

            {/* Job Title */}
            <div className="flex items-center w-full justify-between py-3">
              <div className="flex w-full flex-col">
                <span className="text-ascent-1 text-left text-sm mb-1">
                  {t("Chức danh công việc")}
                </span>
                <Input
                  count={{
                    show: true,
                    max: 30,
                  }}
                  className="bg-primary hover:bg-primary border-1 border-borderNewFeed outline-none text-ascent-1"
                  value={jobTitle}
                  onChange={onChangeJobTitle}
                  maxLength={30}
                  name="jobTitle"
                  placeholder={t("Thêm chức danh công việc")}
                />
              </div>
            </div>

            <div className="w-full border-t border-borderNewFeed"></div>

            {/* Company */}
            <div className="flex items-center w-full justify-between py-3">
              <div className="flex w-full flex-col">
                <span className="text-ascent-1 text-left text-sm mb-1">
                  {t("Công ty")}
                </span>
                <Input
                  count={{
                    show: true,
                    max: 30,
                  }}
                  className="bg-primary hover:bg-primary border-1 border-borderNewFeed outline-none text-ascent-1"
                  value={company}
                  onChange={onChangeCompany}
                  maxLength={30}
                  name="company"
                  placeholder={t("Thêm công ty")}
                />
              </div>
            </div>

            <div className="w-full border-t border-borderNewFeed"></div>

            {/* Cover Image URL */}
            <div className="flex items-center w-full justify-between py-3">
              <div className="flex w-full flex-col">
                <span className="text-ascent-1 text-left text-sm mb-1">
                  {t("URL ảnh bìa")}
                </span>
                <Input
                  className={`bg-primary hover:bg-primary border-1 border-borderNewFeed outline-none text-ascent-1 ${
                    !isValidImageUrl && coverImageUrl ? "border-red-500" : ""
                  }`}
                  value={coverImageUrl}
                  onChange={onChangeCoverImageUrl}
                  name="coverImageUrl"
                  placeholder={t("Thêm URL ảnh bìa")}
                  status={!isValidImageUrl && coverImageUrl ? "error" : ""}
                />
                {!isValidImageUrl && coverImageUrl && !imageLoading && (
                  <span className="text-red-500 text-xs mt-1">
                    {t("URL ảnh không hợp lệ")}
                  </span>
                )}
                {imageLoading && (
                  <span className="text-blue-500 text-xs mt-1">
                    {t("Đang kiểm tra URL...")}
                  </span>
                )}

                {/* Image Preview */}
                {isValidImageUrl && coverImageUrl && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-borderNewFeed">
                    <img
                      src={coverImageUrl}
                      alt="Cover Preview"
                      className="w-full h-24 sm:h-32 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4 mb-2">
              <Button
                onClick={onSubmit}
                title={t("Cập nhật")}
                disable={
                  isPending ||
                  phoneNumberError !== "" ||
                  (coverImageUrl && !isValidImageUrl) ||
                  imageLoading
                }
                isLoading={isPending}
                className="w-full bg-bgStandard flex items-center justify-center py-3 hover:scale-105 hover:opacity-50 active:scale-95 transition-transform border-1 border-borderNewFeed rounded-xl font-medium text-primary"
              />
            </div>
          </form>
        </div>
      </DialogCustom>
    </>
  );
};

export default UpdateUser;