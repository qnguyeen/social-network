import React, { useState, useRef } from "react";
import CustomModal from "~/components/CustomModal";
import { Upload, X, CheckCircle, Users, QrCode } from "lucide-react";
import * as QrService from "~/services/QrService";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setIsRefetchRequestSent } from "~/redux/Slices/userSlice";
import { BlankAvatar } from "~/assets";

const UploadQrCode = ({ open, onClose }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [friendData, setFriendData] = useState(null);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsUploading(true);

      try {
        const res = await QrService.uploadQrImage(file);

        if (res && res.code === 1000) {
          dispatch(setIsRefetchRequestSent(true));
          setFriendData(res.result);
          setIsSuccess(true);
        }
      } finally {
        setIsUploading(false);
      }

      setSelectedFile(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    setIsUploading(false);
    setIsSuccess(false);
    setSelectedFile(null);
    setFriendData(null);
    onClose();
  };

  return (
    <CustomModal isOpen={open} onClose={handleClose}>
      <div className="bg-primary rounded-2xl shadow-xl w-[400px] overflow-hidden">
        {/* Modal header */}
        <div className="p-6 flex justify-between items-center border-b border-borderNewFeed">
          <h2 className="text-xl font-semibold text-ascent-1">
            {isSuccess ? t("Friend Request Sent") : t("Add Friends")}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6">
          {!isSuccess ? (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="bg-black rounded-full p-3 mb-4">
                  <QrCode color="white" size={32} />
                </div>
                <h3 className="text-lg font-medium text-ascent-1 mb-2">
                  {t("Quét hoặc tải lên mã QR")}
                </h3>
                <p className="text-gray-500 text-center">
                  {t("Upload a QR code from your gallery")}
                </p>
              </div>

              {selectedFile ? (
                <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 mb-4">
                  <img
                    src={selectedFile}
                    alt="QR Code Preview"
                    className="w-full h-64 object-contain"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                      <div className="text-black text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-black border-gray-200 mx-auto mb-2"></div>
                        <p>{`${t("Processing QR code")}...`}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center cursor-pointer hover:bg-gray-50 transition-colors mb-4"
                >
                  <div className="bg-black rounded-full p-4 mb-4">
                    <Upload color="white" size={28} />
                  </div>
                  <p className="text-gray-900 font-medium mb-1">
                    {t("Upload QR Code")}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {t("Click to upload or drag and drop")}
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={handleUploadClick}
                  className="flex items-center justify-center px-4 py-3 bg-black rounded-xl text-white font-medium hover:bg-gray-800 transition-colors"
                >
                  <Upload size={20} className="mr-2" />
                  {t("Upload QR")}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-6">
              <div className="bg-black rounded-full p-3 mb-4">
                <CheckCircle color="white" size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {`${t("Friend Request Sent")}!`}
              </h3>
              <p className="text-gray-500 text-center mb-6">
                {t("You've successfully sent a friend request to")}{" "}
                {friendData?.recipientUsername || "the user"}.
              </p>
              <div className="bg-gray-100 w-full rounded-xl p-4 flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <img
                    src={friendData?.imageUrl || BlankAvatar}
                    alt=""
                    className="rounded-full"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {friendData?.recipientUsername || "User"}
                  </h4>
                  <p className="text-gray-500 text-sm">
                    @{friendData?.recipientUsername || "user"}
                  </p>
                </div>
              </div>
              <div className="bg-gray-100 w-full rounded-xl p-4 mb-6">
                <p className="text-gray-900 text-sm font-medium mb-1">
                  {t("Request Status")}
                </p>
                <p className="text-black font-medium">
                  {friendData?.status || "PENDING"}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full flex items-center justify-center px-4 py-3 bg-black rounded-xl text-white font-medium hover:bg-gray-800 transition-colors"
              >
                {t("Done")}
              </button>
            </div>
          )}
        </div>
      </div>
    </CustomModal>
  );
};

export default UploadQrCode;
