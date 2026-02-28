import { useCallback, useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { Button } from "..";
import { BlankAvatar } from "~/assets";
import {
  FormControl,
  MenuItem,
  Select,
  TextField,
  Fade,
  Tooltip,
} from "@mui/material";
import { IoCloseCircle } from "react-icons/io5";
import { BsEmojiSmile, BsImages } from "react-icons/bs";
import { FaPhotoVideo } from "react-icons/fa";
import { PiGifThin } from "react-icons/pi";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as StoryService from "~/services/StoryService";
import useDragAndDrop from "~/hooks/useDragAndDrop";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import EmojiPicker from "emoji-picker-react";
import CustomModal from "~/components/CustomModal";
import { motion } from "framer-motion";

const CreateStory = ({ handleClose, open, onSuccess }) => {
  const user = useSelector((state) => state.user);
  const theme = useSelector((state) => state.theme.theme);
  const [status, setStatus] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(""); // "image" or "video"
  const [postState, setPostState] = useState("PUBLIC");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [uploadStep, setUploadStep] = useState("edit");
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [validationError, setValidationError] = useState("");
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const { t } = useTranslation();

  // Constants for validation
  const MAX_STATUS_LENGTH = 39;
  const MAX_VIDEO_SIZE_MB = 10; // Maximum video size in MB

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleChangeStatus = useCallback(
    (e) => {
      const newStatus = e.target.value;
      if (newStatus.length <= MAX_STATUS_LENGTH) {
        setStatus(newStatus);
        setValidationError("");
      } else {
        setStatus(newStatus.substring(0, MAX_STATUS_LENGTH));
        setValidationError(t("Văn bản không được quá 39 ký tự"));
      }
    },
    [t]
  );

  const handleEmojiClick = useCallback(
    (emojiObject) => {
      setStatus((prevMessage) => {
        const newStatus = prevMessage + emojiObject.emoji;
        if (newStatus.length <= MAX_STATUS_LENGTH) {
          setValidationError("");
          return newStatus;
        } else {
          setValidationError(t("Văn bản không được quá 39 ký tự"));
          return prevMessage;
        }
      });
    },
    [t]
  );

  const toggleEmoji = useCallback(() => {
    setShowEmoji((prev) => !prev);
  }, []);

  const validateFile = (file, type) => {
    if (type === "image") {
      return file.type.includes("image/");
    } else if (type === "video") {
      if (!file.type.includes("video/")) {
        return false;
      }

      // Check video size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > MAX_VIDEO_SIZE_MB) {
        setValidationError(t(`Video phải nhỏ hơn ${MAX_VIDEO_SIZE_MB}MB`));
        return false;
      }

      return true;
    }
    return false;
  };

  const handleImageUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile, "image")) {
      setMediaFile(selectedFile);
      setMediaType("image");
      setUploadStep("preview");
      setValidationError("");
    } else if (selectedFile) {
      setValidationError(t("Chỉ hỗ trợ tải lên hình ảnh (JPG, PNG, GIF)"));
    }
  };

  const handleVideoUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile, "video")) {
      setMediaFile(selectedFile);
      setMediaType("video");
      setUploadStep("preview");
      setValidationError("");
    } else if (selectedFile && !selectedFile.type.includes("video/")) {
      setValidationError(t("Chỉ hỗ trợ tải lên video (MP4, MOV, AVI)"));
    }
  };

  const handleDeleteFile = () => {
    setMediaFile(null);
    setMediaType("");
    setUploadStep("edit");
  };

  const onDrop = (files) => {
    if (files.length === 0) return;

    const file = files[0]; // Take only the first file

    if (file.type.includes("image/")) {
      if (validateFile(file, "image")) {
        setMediaFile(file);
        setMediaType("image");
        setUploadStep("preview");
        setValidationError("");
      }
    } else if (file.type.includes("video/")) {
      if (validateFile(file, "video")) {
        setMediaFile(file);
        setMediaType("video");
        setUploadStep("preview");
        setValidationError("");
      }
    } else {
      setValidationError(t("Chỉ hỗ trợ tải lên hình ảnh hoặc video"));
    }
  };

  const { isDragging, handleDragOver, handleDragLeave, handleDrop } =
    useDragAndDrop(onDrop);

  const handleImageClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleVideoClick = () => {
    if (videoInputRef.current) {
      videoInputRef.current.click();
    }
  };

  const handleCloseModal = () => {
    setStatus("");
    setMediaFile(null);
    setMediaType("");
    setUploadStep("edit");
    setShowEmoji(false);
    setValidationError("");
    handleClose();
  };

  // Submit post
  const mutation = useMutationHook((data) => StoryService.createStory(data));
  const { data, isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      if (data?.code === 200) {
        message.destroy();
        message.success(t("Tạo story thành công"));
        onSuccess();
        handleCloseModal();
      } else if (data?.code === 400) {
        message.destroy();
        message.success(data?.message);
        handleCloseModal();
      }
    } else if (isPending) {
      handleClose();
      message.loading({
        content: t("Create story..."),
        key: "storyCreation",
        duration: 0,
      });
    }
  }, [isSuccess, isPending]);

  const validateForm = () => {
    if (!mediaFile) {
      setValidationError(t("Bạn phải đăng hình ảnh hoặc video"));
      return false;
    }

    if (status.length > MAX_STATUS_LENGTH) {
      setValidationError(t("Văn bản không được quá 39 ký tự"));
      return false;
    }

    return true;
  };

  const handleSubmitPost = () => {
    if (!validateForm()) return;

    const request = {
      content: status,
      visibility: postState,
    };

    const files = mediaFile ? [mediaFile] : [];
    const data = { request, files };
    mutation.mutate(data);
  };

  const isFormValid =
    (status.trim() !== "" || mediaFile !== null) && !validationError;

  return (
    <CustomModal
      isOpen={open}
      onClose={handleCloseModal}
      closeOnClickOutside={!isSelectOpen && !showEmoji}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className={`shadow-xl border-1 border-borderNewFeed w-[500px] mx-auto ${
          theme === "dark" ? "bg-[#1F1F23]" : "bg-primary"
        } rounded-3xl overflow-hidden flex flex-col max-h-[90vh]`}
      >
        <div className="w-full flex items-center justify-between px-5 py-4 border-b border-borderNewFeed sticky top-0 z-10 bg-inherit">
          <button
            onClick={handleCloseModal}
            className="text-base hover:opacity-50 font-medium text-ascent-1 transition duration-300"
          >
            {t("Hủy")}
          </button>
          <span className="text-lg font-semibold text-ascent-1">
            {t("Tạo story")}
          </span>
          <div className="w-10" /> {/* Spacer for balanced header */}
        </div>

        <div className="w-full flex-1 overflow-y-auto custom-scrollbar px-5 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex w-full gap-3 items-start">
              <div className="relative">
                <img
                  src={user?.imageUrl ?? BlankAvatar}
                  alt="User"
                  className="w-12 h-12 rounded-full border-2 border-borderNewFeed object-cover shadow-md"
                />
                <div className="absolute -bottom-1 -right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-ascent-1 mb-1">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "No name"}
                </div>
                <div className="font-medium text-ascent-2 text-sm">
                  {user?.username || "User"}
                </div>
                <div className=" hidden items-center gap-2">
                  <FormControl
                    variant="outlined"
                    size="small"
                    className="min-w-[100px]"
                  >
                    <Select
                      value={postState}
                      onChange={(e) => setPostState(e.target.value)}
                      onOpen={() => setIsSelectOpen(true)}
                      onClose={() => setIsSelectOpen(false)}
                      className="h-7 rounded-full text-xs"
                      MenuProps={{
                        disableScrollLock: true,
                        anchorOrigin: {
                          vertical: "bottom",
                          horizontal: "left",
                        },
                        transformOrigin: {
                          vertical: "top",
                          horizontal: "left",
                        },
                        slotProps: {
                          backdrop: {
                            onClick: (e) => e.stopPropagation(),
                          },
                        },
                      }}
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.12)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0, 0, 0, 0.24)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#4B5563",
                        },
                        "& .MuiSelect-select": {
                          paddingTop: "2px",
                          paddingBottom: "2px",
                        },
                      }}
                    >
                      <MenuItem value="PUBLIC" dense>
                        <span className="text-xs">🌎 {t("Công khai")}</span>
                      </MenuItem>
                      <MenuItem value="PRIVATE" dense>
                        <span className="text-xs">🔒 {t("Riêng tư")}</span>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </div>
              </div>
            </div>

            {/* Text input */}
            <div className="flex flex-col w-full">
              <TextField
                placeholder={t("Bạn đang nghĩ gì? Chia sẻ với mọi người...")}
                multiline
                rows={3}
                variant="outlined"
                value={status}
                onChange={handleChangeStatus}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor:
                        validationError && status.length > 0
                          ? "rgba(239, 68, 68, 0.5)"
                          : "rgba(0, 0, 0, 0.12)",
                      borderRadius: "12px",
                    },
                    "&:hover fieldset": {
                      borderColor:
                        validationError && status.length > 0
                          ? "rgba(239, 68, 68, 0.7)"
                          : "rgba(0, 0, 0, 0.24)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor:
                        validationError && status.length > 0
                          ? "rgb(239, 68, 68)"
                          : "#4B5563",
                    },
                  },
                }}
              />
              <div className="flex justify-between mt-1 px-2">
                {validationError ? (
                  <p className="text-xs text-red-500">{validationError}</p>
                ) : (
                  <div className="h-4"></div> // Empty space to maintain layout
                )}
                <p className="text-xs text-gray-500">
                  {status.length}/{MAX_STATUS_LENGTH}
                </p>
              </div>
            </div>

            {/* Media tools */}
            <div className="flex items-center justify-between px-2 py-2 bg-bgSearch rounded-lg">
              <div className="text-sm font-medium text-ascent-2">
                {t("Thêm vào story của bạn")}
              </div>
              <div className="flex items-center gap-4">
                <Tooltip title={t("Thêm ảnh")} arrow placement="top">
                  <button
                    onClick={handleImageClick}
                    className={`w-9 h-9 ${
                      mediaFile && "opacity-50"
                    } flex items-center justify-center rounded-full hover:bg-gray-200 transition duration-200`}
                    disabled={!!mediaFile}
                  >
                    <BsImages size={20} className="text-blue" />
                  </button>
                </Tooltip>

                <Tooltip title={t("Thêm emoji")} arrow placement="top">
                  <button
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 transition duration-200"
                    onClick={toggleEmoji}
                  >
                    <BsEmojiSmile size={20} className="text-yellow-500" />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Emoji picker */}
            {showEmoji && (
              <Fade in={showEmoji}>
                <div
                  className="absolute z-50 right-1/4"
                  style={{ top: "calc(50% - 1px)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    lazyLoadEmojis
                    searchDisabled={isMobile}
                    width={isMobile ? 280 : 320}
                    height={isMobile ? 320 : 400}
                  />
                </div>
              </Fade>
            )}

            {/* Upload area - only show when no files are selected */}
            {uploadStep === "edit" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full ${
                  isDragging ? "bg-blue" : "bg-bgSearch"
                } h-[200px] transition-colors duration-300 border-2 flex flex-col items-center justify-center border-dashed ${
                  isDragging ? "border-blue" : "border-borderNewFeed"
                } rounded-xl cursor-pointer hover:bg-gray-100`}
              >
                <div className="w-16 h-16 mb-3 flex items-center justify-center rounded-full bg-gray-100">
                  <FaPhotoVideo size={28} className="text-gray-500" />
                </div>
                <p className="text-center text-ascent-1 font-medium">
                  {isDragging
                    ? t("Thả tập tin của bạn ở đây")
                    : t("Kéo và thả hình ảnh hoặc video ở đây")}
                </p>
                <p className="text-center text-ascent-2 text-sm mt-2">
                  {t("Hoặc nhấn vào nút tải lên ở trên")}
                </p>

                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  disabled={!!mediaFile}
                  accept="image/jpeg, image/jpg, image/png, image/gif"
                />

                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoUpload}
                  style={{ display: "none" }}
                  disabled={!!mediaFile}
                  accept="video/mp4, video/mov, video/avi, video/quicktime"
                />
              </motion.div>
            )}

            {/* File preview - only show when a file is selected */}
            {uploadStep === "preview" && mediaFile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="relative rounded-xl overflow-hidden shadow-md group">
                  {mediaType === "image" ? (
                    <img
                      src={URL.createObjectURL(mediaFile)}
                      alt="Upload preview"
                      className="w-full h-full object-cover rounded-xl border border-borderNewFeed"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(mediaFile)}
                      controls
                      className="w-full h-full object-cover rounded-xl border border-borderNewFeed"
                    />
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile();
                    }}
                    className="absolute top-2 right-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition duration-200 p-1"
                  >
                    <IoCloseCircle className="w-6 h-6 text-white" />
                  </button>
                </div>
                {mediaType === "video" && (
                  <p className="text-xs text-gray-500 mt-2">
                    {(mediaFile.size / (1024 * 1024)).toFixed(2)} MB /{" "}
                    {MAX_VIDEO_SIZE_MB} MB
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer - fixed at bottom */}
        <div className="w-full flex justify-end px-5 py-4 border-t border-borderNewFeed sticky bottom-0 z-10 bg-inherit">
          <Button
            type="submit"
            title="Đăng story"
            onClick={handleSubmitPost}
            className={`relative bg-primary hover:scale-105 active:scale-95 border-1 border-borderNewFeed text-ascent-1 px-6 py-3 rounded-xl font-medium text-sm transition duration-300 shadow-md hover:shadow-lg ${
              !isFormValid || isPending || !mediaFile
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            disable={!isFormValid || isPending || !mediaFile}
          />
        </div>
      </motion.div>
    </CustomModal>
  );
};

export default CreateStory;
