import { useEffect, useState, useRef, useCallback } from "react";
import Backdrop from "@mui/material/Backdrop";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoClose,
  IoPause,
  IoPlay,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";
import { Avatar, Tooltip } from "@mui/material";
import useGetDetailUserById from "~/hooks/useGetDetailUserById";
import { BlankAvatar } from "~/assets";
import { useTranslation } from "react-i18next";

export default function PreviewStory({ open, handleClose, story }) {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef(null);
  const { t } = useTranslation();

  const storyData = typeof story === "string" ? JSON.parse(story) : story;
  const { user } = useGetDetailUserById({ id: storyData?.userId });

  const formatDate = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const totalDuration = 10000; // 10 seconds
  const intervalTime = 50; // Smoother progress updates

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = prev + 100 / (totalDuration / intervalTime);
        if (nextProgress >= 100) {
          clearInterval(intervalRef.current);

          // If there are more images, move to the next one
          if (
            storyData?.imageUrls &&
            currentImageIndex < storyData.imageUrls.length - 1
          ) {
            setCurrentImageIndex((prev) => prev + 1);
            setProgress(0);
            startTimer();
            return 0;
          } else {
            // Otherwise close the preview
            handleClose();
            return 100;
          }
        }
        return nextProgress;
      });
    }, intervalTime);
  }, [handleClose, currentImageIndex, storyData?.imageUrls]);

  const pauseTimer = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  const togglePause = useCallback(
    (e) => {
      e.stopPropagation();
      setIsPaused((prev) => {
        const newPauseState = !prev;
        if (newPauseState) {
          pauseTimer();
        } else {
          startTimer();
        }
        return newPauseState;
      });
    },
    [pauseTimer, startTimer]
  );

  const goToNextImage = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      if (
        storyData?.imageUrls &&
        currentImageIndex < storyData.imageUrls.length - 1
      ) {
        setCurrentImageIndex((prev) => prev + 1);
        setProgress(0);
        if (!isPaused) {
          pauseTimer();
          startTimer();
        }
      }
    },
    [currentImageIndex, storyData?.imageUrls, isPaused, pauseTimer, startTimer]
  );

  const goToPrevImage = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      if (storyData?.imageUrls && currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1);
        setProgress(0);
        if (!isPaused) {
          pauseTimer();
          startTimer();
        }
      }
    },
    [currentImageIndex, storyData?.imageUrls, isPaused, pauseTimer, startTimer]
  );

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setIsPaused(false);
      setCurrentImageIndex(0);
      pauseTimer();
      return;
    }

    startTimer();

    return () => pauseTimer();
  }, [open, pauseTimer, startTimer]);

  useEffect(() => {
    // Reset current image index when story changes
    setCurrentImageIndex(0);
    setProgress(0);
  }, [storyData]);

  const handleContentClick = (e) => {
    e.stopPropagation();
    togglePause(e);
  };

  const handleBackdropClick = () => {
    pauseTimer();
    handleClose();
  };

  const hasMedia =
    storyData?.imageUrls &&
    Array.isArray(storyData.imageUrls) &&
    storyData.imageUrls.length > 0;

  return (
    <Backdrop
      sx={(theme) => ({
        color: "#fff",
        zIndex: theme.zIndex.drawer + 1,
        padding: { xs: "20px", sm: "50px" },
        backdropFilter: "blur(10px)",
        backgroundColor: "rgba(0, 0, 0, 0.85)",
      })}
      open={open}
      onClick={handleBackdropClick}
      timeout={300}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative h-full max-h-[90vh] w-full max-w-[370px] rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* User info */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent">
            <Avatar
              src={user?.imageUrl || storyData?.imageUrl || BlankAvatar}
              sx={{ width: 36, height: 36, border: "2px solid white" }}
            />
            <div className="flex-1">
              <p className="text-white font-medium text-sm">
                {user?.username || storyData?.username}
              </p>
              <p className="text-gray-300 text-xs">
                {formatDate(storyData?.postedAt)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  storyData?.visibility === "PUBLIC"
                    ? "bg-green-500/70"
                    : "bg-yellow-500/70"
                }`}
              >
                {t(storyData?.visibility)}
              </span>
              <IconButton
                size="small"
                className="text-white hover:text-gray-200 active:scale-95 transition-transform"
                onClick={handleClose}
                sx={{
                  bgcolor: "rgba(0,0,0,0.3)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
                }}
              >
                <IoClose size={18} />
              </IconButton>
            </div>
          </div>

          {/* Progress bar indicators */}
          <div className="absolute top-65 left-0 right-0 z-10 px-4 flex gap-1">
            {hasMedia &&
              storyData.imageUrls.map((_, index) => (
                <LinearProgress
                  key={index}
                  variant="determinate"
                  value={
                    index < currentImageIndex
                      ? 100
                      : index === currentImageIndex
                      ? progress
                      : 0
                  }
                  color="inherit"
                  sx={{
                    flex: 1,
                    height: "3px",
                    borderRadius: "20px",
                    mt: 2,
                    "& .MuiLinearProgress-bar": {
                      transition:
                        isPaused || index !== currentImageIndex
                          ? "none"
                          : "transform 0.1s linear",
                    },
                  }}
                />
              ))}
          </div>

          {/* Story content */}
          <div
            className="flex flex-col items-center justify-center h-full w-full relative"
            onClick={handleContentClick}
          >
            {hasMedia ? (
              <img
                src={storyData.imageUrls[currentImageIndex]}
                alt={`story image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => {
                  console.error("Image failed to load:", e);
                  e.target.src = BlankAvatar; // Fallback image
                }}
              />
            ) : (
              // Text-only story with gradient background
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-700 to-pink-500 p-6 text-center">
                <p className="text-white text-xl font-medium">
                  {storyData?.content || "No content"}
                </p>
              </div>
            )}

            {/* Story text overlay for media stories */}
            {storyData?.content && hasMedia && (
              <div className="absolute bottom-20 left-0 right-0 px-6">
                <div className="bg-black/50 p-3 rounded-lg">
                  <p className="text-white text-center text-sm">
                    {storyData?.content}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Image navigation arrows (side arrows) */}
          {hasMedia && storyData.imageUrls.length > 1 && (
            <>
              {/* Left navigation button */}
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20">
                {currentImageIndex > 0 && (
                  <IconButton
                    onClick={goToPrevImage}
                    className="text-white"
                    sx={{
                      bgcolor: "rgba(0,0,0,0.3)",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
                    }}
                  >
                    <IoChevronBack size={24} />
                  </IconButton>
                )}
              </div>

              {/* Right navigation button */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20">
                {currentImageIndex < storyData.imageUrls.length - 1 && (
                  <IconButton
                    onClick={goToNextImage}
                    className="text-white"
                    sx={{
                      bgcolor: "rgba(0,0,0,0.3)",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
                    }}
                  >
                    <IoChevronForward size={24} />
                  </IconButton>
                )}
              </div>
            </>
          )}

          {/* Image counter */}
          {hasMedia && storyData.imageUrls.length > 1 && (
            <div className="absolute top-20 right-4 bg-black/50 px-2 py-1 rounded-full z-10">
              <span className="text-xs text-white">
                {currentImageIndex + 1}/{storyData.imageUrls.length}
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="absolute bottom-6 right-6">
            <Tooltip title={isPaused ? "Play" : "Pause"}>
              <IconButton
                onClick={togglePause}
                className="text-white"
                sx={{
                  bgcolor: "rgba(0,0,0,0.3)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.5)" },
                }}
                size="small"
              >
                {isPaused ? <IoPlay size={18} /> : <IoPause size={18} />}
              </IconButton>
            </Tooltip>
          </div>

          {/* Expiry indicator */}
          <div className="absolute bottom-6 left-6">
            <Tooltip title="Expires at">
              <div className="bg-black/30 px-3 py-1 rounded-full text-xs">
                {t("Expires")} {formatDate(storyData?.expiryTime)}
              </div>
            </Tooltip>
          </div>
        </motion.div>
      </AnimatePresence>
    </Backdrop>
  );
}
