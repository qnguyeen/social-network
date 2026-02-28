import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Clock,
  Calendar,
  Trash2,
  CheckCircle,
  Plus,
  History,
} from "lucide-react";
import CustomModal from "~/components/CustomModal";
import { useQuery } from "@tanstack/react-query";
import * as PageService from "~/services/PageService";
import { useTranslation } from "react-i18next";

export default function VolunteerTimeSelector({ open, handleClose, onSubmit }) {
  const [availableTimes, setAvailableTimes] = useState([]);
  const [day, setDay] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const [showSuccess, setShowSuccess] = useState(false);

  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const timesOfDay = ["Sáng", "Chiều", "Tối"];

  // Fetch previously registered times
  const {
    data: registeredTimes,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["timeSelector"],
    queryFn: async () => {
      const res = await PageService.getFreeTime();
      return res?.result || [];
    },
  });

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setFormError("");
      setShowSuccess(false);
    }
  }, [open]);

  const handleAddTime = () => {
    if (!day || !timeOfDay) {
      setFormError("Vui lòng chọn cả ngày và thời gian");
      return;
    }

    const newTimeSlot = `${timeOfDay} ${day}`;

    if (availableTimes.includes(newTimeSlot)) {
      setFormError("Thời gian này đã được thêm vào");
      return;
    }

    setAvailableTimes([...availableTimes, newTimeSlot]);
    setFormError("");
    // Reset form
    setDay("");
    setTimeOfDay("");
  };

  const handleRemoveTime = (index) => {
    const updatedTimes = [...availableTimes];
    updatedTimes.splice(index, 1);
    setAvailableTimes(updatedTimes);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const res = await PageService.createFreeTime({ data: availableTimes });

      if (res?.code === 2000) {
        refetch();
        setTimeout(() => {
          if (onSubmit) {
            console.log(availableTimes);
          }
          setIsSubmitting(false);
          setShowSuccess(true);

          setTimeout(() => {
            setAvailableTimes([]);
            setShowSuccess(false);
            handleClose();
          }, 2000);
        }, 1000);
      } else {
        setIsSubmitting(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDayLabel = (dayCode) => {
    if (dayCode === "CN") return "Chủ Nhật";
    return `Thứ ${dayCode.charAt(1)}`;
  };

  return (
    <CustomModal isOpen={open} onClose={handleClose}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-xl mx-auto p-6 bg-white rounded-3xl shadow-lg"
      >
        {!showSuccess ? (
          <>
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                className="inline-block mb-3"
              >
                <Heart className="h-12 w-12 text-rose-500 mx-auto" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-800">
                {t("Đăng Ký Thời Gian Tình Nguyện")}
              </h1>
              <p className="text-gray-600 mt-2">
                Mỗi giờ bạn dành tặng là một món quà vô giá cho cộng đồng
              </p>
            </div>

            {/* Previously registered times section */}
            {registeredTimes && registeredTimes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-primary rounded-lg border-1 border-borderNewFeed"
              >
                <h2 className="text-md font-medium mb-3 flex items-center text-ascent-1">
                  <History className="h-5 w-5 mr-2 text-ascent-1" />
                  Thời gian đã đăng ký trước đó:
                </h2>
                <div className="flex flex-wrap gap-2">
                  {registeredTimes.map((time, index) => (
                    <span
                      key={`registered-${index}`}
                      className="px-3 py-1 bg-primary border-1 border-borderNewFeed text-ascent-1 rounded-full text-sm"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-ascent-1" />
                    Ngày
                  </label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors"
                  >
                    <option value="">Chọn ngày</option>
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
                    Thời gian
                  </label>
                  <select
                    value={timeOfDay}
                    onChange={(e) => setTimeOfDay(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2  transition-colors"
                  >
                    <option value="">Chọn thời gian</option>
                    {timesOfDay.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <motion.div
                className="flex justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  onClick={handleAddTime}
                  className="flex items-center px-4 py-2 bg-bgStandard text-ascent-3  rounded-md hover:opacity-50 focus:outline-none focus:ring-2 transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thời gian
                </button>
              </motion.div>

              {formError && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-rose-600 text-sm text-center"
                >
                  {formError}
                </motion.p>
              )}

              <div className="mt-4">
                <h2 className="text-lg font-medium mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-ascent-1" />
                  Thời gian đã chọn:
                </h2>

                {availableTimes.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    className="text-gray-500 italic text-center py-3"
                  >
                    Chưa có thời gian nào được chọn
                  </motion.p>
                ) : (
                  <div className="max-h-60 overflow-y-auto pr-2">
                    <AnimatePresence>
                      {availableTimes.map((time, index) => (
                        <motion.div
                          key={`${time}-${index}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          className="flex justify-between items-center p-3 my-2 bg-primary border-1 border-borderNewFeed rounded-lg"
                        >
                          <span className="text-ascent-1 font-medium">
                            {time}
                          </span>
                          <motion.button
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

              <div className="pt-4">
                <p className="text-sm text-gray-600 text-center mb-4">
                  Mỗi khoảng thời gian tình nguyện của bạn đều có thể thay đổi
                  cuộc sống của ai đó
                </p>

                <motion.div
                  className="flex justify-center"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <button
                    onClick={handleSubmit}
                    disabled={availableTimes.length === 0 || isSubmitting}
                    className={`flex items-center px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                      availableTimes.length === 0 || isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "linear",
                          }}
                          className="h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full"
                        />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Heart className="h-5 w-5 mr-2" />
                        Đăng ký tình nguyện
                      </>
                    )}
                  </button>
                </motion.div>
              </div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-10"
          >
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            >
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">
              Cảm ơn bạn!
            </h2>
            <p className="text-gray-600 mt-2">
              Đăng ký tình nguyện của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ
              với bạn sớm.
            </p>
          </motion.div>
        )}
      </motion.div>
    </CustomModal>
  );
}
