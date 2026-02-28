import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "..";
import { GroupAvatar } from "~/assets";
import { CircularProgress } from "@mui/material";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as GroupService from "~/services/GroupService";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CustomModal from "~/components/CustomModal";
import { BiWorld, BiLock, BiImageAdd } from "react-icons/bi";
import { FiX } from "react-icons/fi";
import { BsEmojiSmile, BsArrowRight } from "react-icons/bs";
import confetti from "canvas-confetti";
import { message } from "antd";
import EmojiPicker from "emoji-picker-react";

// Constants for validation
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_IMAGE_SIZE_MB = 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"];

const CreateGroup = ({ open, handleClose, onSuccess }) => {
  const theme = useSelector((state) => state.theme.theme);
  const [postState, setPostState] = useState("PUBLIC");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formStep, setFormStep] = useState(0);
  const [formErrors, setFormErrors] = useState({
    name: false,
    description: false,
    image: false,
  });
  const [showEmoji, setShowEmoji] = useState(false);

  const [imagePreview, setImagePreview] = useState(GroupAvatar);
  const [imageFile, setImageFile] = useState(null);
  const imageInputRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isDarkMode = theme === "dark";
  const textColor = isDarkMode ? "text-white" : "text-gray-800";
  const placeholderColor = isDarkMode
    ? "placeholder:text-gray-400"
    : "placeholder:text-gray-500";
  const borderColor = isDarkMode ? "border-gray-700" : "border-gray-200";
  const inputBgColor = isDarkMode ? "bg-gray-800/80" : "bg-white/80";
  const cardBgColor = isDarkMode ? "bg-gray-900/90" : "bg-white/90";

  // Input validation functions
  const validateName = (value) => {
    // Check if name is empty
    if (!value || !value.trim()) {
      return { valid: false, message: t("Vui lòng nhập tên nhóm") };
    }

    // Check name length
    if (value.trim().length > MAX_NAME_LENGTH) {
      return {
        valid: false,
        message: t("Tên nhóm không được vượt quá {{length}} ký tự", {
          length: MAX_NAME_LENGTH,
        }),
      };
    }

    // Check for invalid characters - example: disallow special characters
    const invalidCharsRegex = /[<>{}]/g;
    if (invalidCharsRegex.test(value)) {
      return {
        valid: false,
        message: t("Tên nhóm chứa ký tự không hợp lệ"),
      };
    }

    return { valid: true, message: "" };
  };

  const validateDescription = (value) => {
    // Description is optional, but if provided, check length
    if (value && value.trim() && value.length > MAX_DESCRIPTION_LENGTH) {
      return {
        valid: false,
        message: t("Mô tả không được vượt quá {{length}} ký tự", {
          length: MAX_DESCRIPTION_LENGTH,
        }),
      };
    }
    return { valid: true, message: "" };
  };

  const validateImage = (file) => {
    // Image is optional
    if (!file) return { valid: true, message: "" };

    // Check file size (convert MB to bytes)
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      return {
        valid: false,
        message: t("Ảnh không được vượt quá {{size}}MB", {
          size: MAX_IMAGE_SIZE_MB,
        }),
      };
    }

    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        valid: false,
        message: t("Chỉ chấp nhận định dạng JPG, PNG hoặc GIF"),
      };
    }

    return { valid: true, message: "" };
  };

  // Input handlers with validation
  const handleChangeName = (e) => {
    const value = e.target.value;
    setName(value);

    const validation = validateName(value);
    setFormErrors((prev) => ({
      ...prev,
      name: !validation.valid ? validation.message : false,
    }));
  };

  const handleChangeDescription = (e) => {
    const value = e.target.value;
    setDescription(value);

    const validation = validateDescription(value);
    setFormErrors((prev) => ({
      ...prev,
      description: !validation.valid ? validation.message : false,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      setFormErrors((prev) => ({
        ...prev,
        image: validation.message,
      }));
      return;
    }

    // Reset error if valid
    setFormErrors((prev) => ({ ...prev, image: false }));

    // Set file for upload
    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const mutation = useMutationHook((data) =>
    GroupService.createGroup({ data })
  );

  const { data, isPending, isSuccess, isError, error } = mutation;

  useEffect(() => {
    if (isSuccess) {
      if (data && data?.code === 200) {
        // Show success message and trigger confetti
        onSuccess();
        message.destroy();
        message.success({ content: t("Create new group success") });

        // Trigger confetti effect
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        // Handle unexpected success response
        message.destroy();
        message.error({ content: t("Something went wrong") });
      }
    } else if (isPending) {
      handleClose();
      message.loading({ content: t("Create group"), duration: 0 });
    } else if (isError) {
      // Handle error response
      message.destroy();
      const errorMessage =
        error?.response?.data?.message || t("Something went wrong");
      message.error({ content: errorMessage });
    }
  }, [isSuccess, isPending, isError, data, error, navigate]);

  const sanitizeInput = (input) => {
    // Basic sanitization - strip HTML tags
    return input.replace(/<[^>]*>?/gm, "");
  };

  const validateCurrentStep = () => {
    if (formStep === 0) {
      // Validate name
      const nameValidation = validateName(name);

      // Validate image if provided
      const imageValidation = validateImage(imageFile);

      // Update errors
      setFormErrors({
        ...formErrors,
        name: !nameValidation.valid ? nameValidation.message : false,
        image: !imageValidation.valid ? imageValidation.message : false,
      });

      return nameValidation.valid && imageValidation.valid;
    } else if (formStep === 1) {
      // Validate description
      const descriptionValidation = validateDescription(description);

      // Update errors
      setFormErrors({
        ...formErrors,
        description: !descriptionValidation.valid
          ? descriptionValidation.message
          : false,
      });

      return descriptionValidation.valid;
    }
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setFormStep(formStep + 1);
    }
  };

  const prevStep = () => {
    setFormStep(formStep - 1);
  };

  const handleSubmitPost = () => {
    if (!validateCurrentStep()) return;

    // Final validation before submission
    const nameValid = validateName(name).valid;
    const descriptionValid = validateDescription(description).valid;
    const imageValid = validateImage(imageFile).valid;

    if (!nameValid || !descriptionValid || !imageValid) {
      return;
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name.trim());
    const sanitizedDescription = sanitizeInput(description.trim());

    // Create FormData if an image is included
    if (imageFile) {
      const formData = new FormData();
      formData.append("name", sanitizedName);
      formData.append("description", sanitizedDescription);
      formData.append("visibility", postState);
      formData.append("image", imageFile);

      mutation.mutate(formData);
    } else {
      // Regular JSON payload if no image
      const data = {
        name: sanitizedName,
        description: sanitizedDescription,
        visibility: postState,
      };

      mutation.mutate(data);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  const handleEmojiClick = (emojiObject) => {
    const newDescription = description + emojiObject.emoji;

    // Check if adding emoji would exceed the maximum description length
    if (newDescription.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(newDescription);
    }
  };

  const formSteps = [
    // Step 1: Group Name & Image
    <motion.div
      key="step1"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center mb-6"
      >
        <div className="group relative cursor-pointer mb-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white p-[3px] rounded-full"
            onClick={handleImageClick}
          >
            <div
              className={`${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } p-1 rounded-full overflow-hidden relative`}
            >
              <img
                className="w-32 h-32 rounded-full object-cover"
                src={imagePreview}
                alt="Group Avatar"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <BiImageAdd className="w-8 h-8 text-white" />
              </div>
            </div>
          </motion.div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg, image/png, image/gif"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>
        <AnimatePresence>
          {formErrors.image && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-sm text-red-500 text-center"
            >
              {formErrors.image}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="mb-2">
          <label className={`text-sm font-medium ${textColor}`}>
            {t("Tên nhóm")} <span className="text-pink-500">*</span>
          </label>
        </div>
        <motion.input
          whileFocus={{ scale: 1.01 }}
          type="text"
          value={name}
          name="name"
          onChange={handleChangeName}
          placeholder={t("Nhập tên nhóm")}
          className={`w-full px-4 py-3 rounded-2xl border ${borderColor} ${inputBgColor} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${placeholderColor} ${textColor} outline-none transition backdrop-blur-sm`}
          autoFocus
          maxLength={MAX_NAME_LENGTH}
        />
        <div className="flex justify-between">
          <AnimatePresence>
            {formErrors.name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-sm text-red-500 flex items-center"
              >
                {formErrors.name}
              </motion.p>
            )}
          </AnimatePresence>
          <span className={`text-xs ${textColor} mt-2 ml-auto`}>
            {name.length}/{MAX_NAME_LENGTH}
          </span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextStep}
          className="flex items-center px-5 py-3 rounded-xl bg-bgStandard text-ascent-3 font-medium transition-all"
        >
          {t("Tiếp tục")}
          <BsArrowRight className="ml-2" />
        </motion.button>
      </motion.div>
    </motion.div>,

    // Step 2: Description & Privacy
    <motion.div
      key="step2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <div className="mb-2">
          <label className={`text-sm font-medium ${textColor}`}>
            {t("Mô tả")}
          </label>
        </div>
        <div className="relative">
          {showEmoji && (
            <div className={`fixed translate-y-32 translate-x-32 z-[99999]`}>
              <EmojiPicker
                style={{
                  height: "350px",
                  width: "auto",
                }}
                lazyLoadEmojis
                onEmojiClick={handleEmojiClick}
              />
            </div>
          )}
          <motion.textarea
            whileFocus={{ scale: 1.01 }}
            value={description}
            onChange={handleChangeDescription}
            placeholder={`${t("Mô tả về nhóm của bạn")}...`}
            className={`w-full px-4 py-3 rounded-2xl border ${borderColor} ${inputBgColor} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${placeholderColor} ${textColor} outline-none transition min-h-[120px] resize-none backdrop-blur-sm`}
            maxLength={MAX_DESCRIPTION_LENGTH}
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEmoji((prev) => !prev)}
            className="absolute bottom-3 right-3 text-gray-400 hover:text-blue-500"
          >
            <BsEmojiSmile className="text-xl" />
          </motion.button>
        </div>
        <div className="flex justify-between">
          <AnimatePresence>
            {formErrors.description && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 text-sm text-red-500 flex items-center"
              >
                {formErrors.description}
              </motion.p>
            )}
          </AnimatePresence>
          <span className={`text-xs ${textColor} mt-2 ml-auto`}>
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="mb-2">
          <label className={`text-sm font-medium ${textColor}`}>
            {t("Quyền riêng tư")}
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setPostState("PUBLIC")}
            className={`flex items-center p-4 rounded-2xl ${
              postState === "PUBLIC"
                ? "bg-bgStandard border-none text-white"
                : `border ${borderColor} ${inputBgColor} backdrop-blur-sm`
            } transition-all`}
          >
            <BiWorld
              className={`w-6 h-6 mr-3 ${
                postState === "PUBLIC" ? "text-ascent-3" : "text-ascent-1"
              }`}
            />
            <span
              className={`font-medium ${
                postState === "PUBLIC" ? "text-ascent-3" : "text-ascent-1"
              }`}
            >
              {t("Công khai")}
            </span>
          </motion.button>
          <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setPostState("PRIVATE")}
            className={`flex items-center p-4 rounded-2xl ${
              postState === "PRIVATE"
                ? "bg-bgStandard border-none text-white"
                : `border ${borderColor} ${inputBgColor} backdrop-blur-sm`
            } transition-all`}
          >
            <BiLock
              className={`w-6 h-6 mr-3 ${
                postState === "PRIVATE" ? "text-ascent-3" : "text-ascent-1"
              }`}
            />
            <span
              className={`font-medium ${
                postState === "PRIVATE" ? "text-ascent-3" : "text-ascent-1"
              }`}
            >
              {t("Riêng tư")}
            </span>
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex justify-between pt-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevStep}
          className="px-5 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition-all"
        >
          {t("Quay lại")}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={handleSubmitPost}
          disabled={isPending}
          className="px-6 py-3 rounded-xl bg-bgStandard text-ascent-3 font-medium transition-all disabled:opacity-70 relative"
        >
          {isPending ? (
            <CircularProgress size={24} className="text-white" />
          ) : (
            <>{t("Tạo nhóm")}</>
          )}
        </motion.button>
      </motion.div>
    </motion.div>,
  ];

  return (
    <CustomModal
      className={`w-[500px] rounded-3xl border border-blue-500/20 ${cardBgColor} backdrop-blur-lg shadow-2xl`}
      isOpen={open}
      onClose={handleClose}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between px-6 py-4 border-b border-borderNewFeed">
        <motion.button
          onClick={handleClose}
          className="p-2 rounded-full active:scale-95 cursor-pointer hover:opacity-50 transition-colors"
        >
          <FiX className={`w-5 h-5 ${textColor}`} />
        </motion.button>
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-xl font-normal text-center flex-1 -ml-10 text-ascent-1 bg-clip-text"
        >
          {formStep === 0 ? t("Tạo nhóm mới") : t("Hoàn tất thông tin")}
        </motion.h2>
        <div className="w-5" />
      </div>

      {/* Body */}
      <div className="p-6">
        <AnimatePresence mode="wait">{formSteps[formStep]}</AnimatePresence>
      </div>
    </CustomModal>
  );
};

export default CreateGroup;
