import React, { useEffect, useState, useRef } from "react";
import CustomModal from "~/components/CustomModal";
import { useTranslation } from "react-i18next";
import { Button } from "~/components";
import { useMutationHook } from "~/hooks/useMutationHook";
import * as FundraisingService from "~/services/FundraisingService";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Clock,
  Calendar,
  Trash2,
  Plus,
  X,
  Upload,
  Image,
} from "lucide-react";
import { message } from "antd";

const CreateCampaign = ({ open, handleClose, onSuccessCreateCampaign }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    availableTimes: [],
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [day, setDay] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [timeSelectionError, setTimeSelectionError] = useState("");
  const [showTimeSection, setShowTimeSection] = useState(false);

  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const timesOfDay = ["Sáng", "Chiều", "Tối"];

  const handleClear = () => {
    setFormData({
      title: "",
      description: "",
      targetAmount: "",
      availableTimes: [],
    });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag events for image upload
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatCurrency = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleCurrencyChange = (e) => {
    const { value } = e.target;
    const formattedValue = formatCurrency(value);

    setFormData({
      ...formData,
      targetAmount: formattedValue,
    });

    if (errors.targetAmount) {
      setErrors({
        ...errors,
        targetAmount: "",
      });
    }
  };

  // Time selection functionality
  const handleAddTime = () => {
    if (!day || !timeOfDay) {
      setTimeSelectionError("Vui lòng chọn cả ngày và thời gian");
      return;
    }

    const newTimeSlot = `${timeOfDay} ${day}`;

    if (formData.availableTimes.includes(newTimeSlot)) {
      setTimeSelectionError("Thời gian này đã được thêm vào");
      return;
    }

    setFormData({
      ...formData,
      availableTimes: [...formData.availableTimes, newTimeSlot],
    });

    setTimeSelectionError("");

    if (errors.availableTimes) {
      setErrors({
        ...errors,
        availableTimes: "",
      });
    }

    // Reset form
    setDay("");
    setTimeOfDay("");
  };

  const handleRemoveTime = (index) => {
    const updatedTimes = [...formData.availableTimes];
    updatedTimes.splice(index, 1);
    setFormData({
      ...formData,
      availableTimes: updatedTimes,
    });
  };

  const getDayLabel = (dayCode) => {
    if (dayCode === "CN") return "Chủ Nhật";
    return `Thứ ${dayCode.charAt(1)}`;
  };

  // Handle form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = t("Title is required");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("Description is required");
    }

    if (!formData.targetAmount) {
      newErrors.targetAmount = t("Target amount is required");
    }

    if (!imagePreview) {
      newErrors.image = t("Please upload at least one image");
    }

    // Enhanced validation for time slots if the section is shown
    if (showTimeSection && formData.availableTimes.length === 0) {
      newErrors.availableTimes = t("Please select time slot for volunteering");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutationCreateCampaign = useMutationHook((data) =>
    FundraisingService.createCampaign(data)
  );

  const { data, isPending, isSuccess } = mutationCreateCampaign;

  useEffect(() => {
    if (isSuccess) {
      message.destroy();
      message.success({ content: t("Create campaign success") });
      onSuccessCreateCampaign();
    } else if (isPending) {
      handleClose();
      message.loading({ content: t("Create campaign..."), duration: 0 });
    }
  }, [isSuccess, isPending]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const requestData = {
        title: formData.title,
        description: formData.description,
        targetAmount: parseInt(formData.targetAmount.replace(/,/g, ""), 10),
        timeSlots: formData.availableTimes,
      };

      mutationCreateCampaign.mutate({
        request: requestData,
        files: file,
      });
    }
  };

  const toggleTimeSection = () => {
    setShowTimeSection(!showTimeSection);
  };

  return (
    <CustomModal
      className="bg-primary shadow-lg max-h-[90vh] rounded-3xl border border-borderNewFeed overflow-y-auto"
      isOpen={open}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="divide-y divide-borderNewFeed">
        {/* Form header */}
        <div className="w-full flex items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-500 active:scale-95 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-ascent-1">
            {t("Tạo chiến dịch")}
          </h2>
          <div className="w-5" />
        </div>

        {/* Form content */}
        <div className="p-6 space-y-6">
          {/* Campaign Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-ascent-1 mb-1"
            >
              {t("Campaign Title")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t(
                "Enter a clear, descriptive title for your campaign"
              )}
              className={`w-full px-4 py-3 rounded-lg border-1 border-borderNewFeed bg-primary ${
                errors.title &&
                "border-rose-300 focus:ring-rose-500 focus:border-rose-500"
              } shadow-sm focus:outline-none transition-colors`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-rose-600">{errors.title}</p>
            )}
          </div>

          {/* Campaign Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-ascent-1 mb-1"
            >
              {t("Campaign Description")}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder={t(
                "Describe your campaign goals, purpose, and how the funds will be used"
              )}
              className={`w-full px-4 py-3 rounded-lg border-1 bg-primary border-borderNewFeed ${
                errors.description &&
                "border-rose-300 focus:ring-rose-500 focus:border-rose-500"
              } shadow-sm focus:outline-none focus:ring-2 transition-colors`}
            />
            <div className="mt-1 text-right">
              <p className="text-sm text-gray-500">
                {formData.description.length} {t("characters")}
              </p>
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-rose-600">{errors.description}</p>
            )}
          </div>

          {/* Target Amount */}
          <div>
            <label
              htmlFor="targetAmount"
              className="block text-sm font-medium text-ascent-1 mb-1"
            >
              {t("Target Amount")} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-medium">₫</span>
              </div>
              <input
                type="text"
                id="targetAmount"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleCurrencyChange}
                placeholder="0"
                className={`w-full pl-8 pr-4 py-3 rounded-lg border-1 border-borderNewFeed bg-primary ${
                  errors.targetAmount &&
                  "border-rose-300 focus:ring-rose-500 focus:border-rose-500"
                } shadow-sm focus:outline-none focus:ring-2 transition-colors`}
              />
            </div>
            {errors.targetAmount ? (
              <p className="mt-1 text-sm text-rose-600">
                {errors.targetAmount}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-500">
                {t("Set a realistic funding goal for your campaign")}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-ascent-1 mb-1">
              {t("Campaign Image")} <span className="text-rose-500">*</span>
            </label>

            {!imagePreview ? (
              <div
                className={`border-2 border-dashed rounded-lg ${
                  isDragging
                    ? "border-borderNewFeed bg-indigo-50"
                    : "border-gray-300 hover:border-borderNewFeed"
                } transition-colors cursor-pointer`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <div className="flex flex-col items-center justify-center py-8">
                  <Upload className="h-10 w-10 text-ascent-1 mb-3" />
                  <p className="text-ascent-2 font-medium mb-1">
                    {t("Drag and drop an image here")}
                  </p>
                  <p className="text-ascent-2 text-sm mb-4">
                    {t("or click to browse files")}
                  </p>
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 bg-bgStandard text-ascent-3 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Image className="h-4 w-4 mr-2" /> {t("Browse Image")}
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={imagePreview}
                  alt="Campaign preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
                >
                  <X className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            )}

            {errors.image && (
              <p className="mt-1 text-sm text-rose-600">{errors.image}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {t(
                "Upload a compelling image that represents your campaign (recommended size: 1200x630px)"
              )}
            </p>
          </div>

          {/* Volunteer Time Section Toggle */}
          <div>
            <motion.button
              type="button"
              onClick={toggleTimeSection}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center px-4 py-2 text-ascent-1 bg-primary border-1 border-borderNewFeed rounded-lg hover:opacity-50 transition-colors w-full justify-center"
            >
              <Heart className="h-5 w-5 mr-2" />
              {showTimeSection
                ? t("Hide Volunteer Time Selection")
                : t("Add Volunteer Time Selection")}
            </motion.button>
          </div>

          {/* Volunteer Time Selection Section */}
          <AnimatePresence>
            {showTimeSection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-5 bg-primary border-1 border-borderNewFeed rounded-lg">
                  <div className="text-center mb-4">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      className="inline-block mb-2"
                    >
                      <Heart className="h-8 w-8 text-rose-500 mx-auto" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {t("Volunteer Time Selection")}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {t(
                        "Select times when volunteers can contribute to this campaign"
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Calendar className="h-4 w-4 mr-2 text-ascent-1" />
                        {t("Day")}
                      </label>
                      <select
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      >
                        <option value="">{t("Select day")}</option>
                        {days.map((d) => (
                          <option key={d} value={d}>
                            {getDayLabel(d)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Clock className="h-4 w-4 mr-2 text-ascent-1" />
                        {t("Time")}
                      </label>
                      <select
                        value={timeOfDay}
                        onChange={(e) => setTimeOfDay(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      >
                        <option value="">{t("Select time")}</option>
                        {timesOfDay.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <motion.div
                    className="flex justify-center mb-4"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <button
                      type="button"
                      onClick={handleAddTime}
                      className="flex items-center px-4 py-2 bg-bgStandard text-ascent-3 rounded-md hover:opacity-50 focus:outline-none focus:ring-2 transition-all"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("Add Time Slot")}
                    </button>
                  </motion.div>

                  {timeSelectionError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-rose-600 text-sm text-center mb-4"
                    >
                      {timeSelectionError}
                    </motion.p>
                  )}

                  <div>
                    <h2 className="text-md font-medium mb-2 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-ascent-1" />
                      {t("Selected Time Slots:")}
                    </h2>

                    {formData.availableTimes.length === 0 ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        className="text-gray-500 italic text-center py-2"
                      >
                        {t("No time slots selected yet")}
                      </motion.p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto pr-2">
                        <AnimatePresence>
                          {formData.availableTimes.map((time, index) => (
                            <motion.div
                              key={`${time}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.2 }}
                              className="flex justify-between items-center p-2 my-1 bg-white border border-indigo-100 rounded-lg"
                            >
                              <span className="text-indigo-800 font-medium text-sm">
                                {time}
                              </span>
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleRemoveTime(index)}
                                className="text-rose-600 hover:text-rose-800 p-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </motion.button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  {errors.availableTimes && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-2 text-sm text-rose-600 font-medium"
                    >
                      {errors.availableTimes}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Form actions */}
        <div className="px-6 py-4 bg-primary flex justify-end rounded-b-xl">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg shadow-sm transition-colors"
            >
              {t("Cancel")}
            </button>

            <Button
              isLoading={isPending}
              type="submit"
              title={t("Create campaign")}
              className="px-6 py-2 bg-bgStandard text-ascent-3 font-medium rounded-lg shadow-sm transition-colors"
            />
          </div>
        </div>
      </form>
    </CustomModal>
  );
};

export default CreateCampaign;
