import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import CustomModal from "~/components/CustomModal";
import * as PageService from "~/services/PageService";

const RegisterVolunteer = ({ open, handleClose, campaignId }) => {
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [charsLeft, setCharsLeft] = useState(20);
  const { t } = useTranslation();

  const validateMessage = (value) => {
    if (!value.trim()) {
      return t("Please share a brief message");
    }
    if (value.length > 20) {
      return t("Message cannot exceed 20 characters");
    }
    return null;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    setCharsLeft(20 - value.length);

    // Clear errors as user types
    if (errors.message && value.trim()) {
      setErrors({});
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const messageError = validateMessage(message);
    if (messageError) {
      setErrors({ message: messageError });
      return;
    }

    setIsSubmitting(true);

    try {
      const data = { campaignId, message };
      const res = await PageService.registerVolunteer(data);

      if (res?.code === 200) {
        setTimeout(() => {
          setSubmitSuccess(true);
          setIsSubmitting(false);

          setTimeout(() => {
            setMessage("");
            setCharsLeft(20);
            setSubmitSuccess(false);
            handleClose();
          }, 2000);
        }, 1000);
      } else {
        setIsSubmitting(false);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal isOpen={open} onClose={handleClose}>
      <div className="p-6 max-w-md bg-primary rounded-2xl mx-auto">
        {!submitSuccess ? (
          <>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {t("Join Our Volunteer Team")}
              </h2>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-1 bg-blue-500 rounded"></div>
              </div>
              <p className="text-gray-600">
                {t("Share why you want to volunteer with us")}
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {t("Your Message")} {t("(20 chars max)")}
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={handleChange}
                  maxLength={20}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={2}
                  placeholder={t("I want to help...")}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  <span id="char-count">{charsLeft}</span> {t("chars left")}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {t("Submitting...")}
                    </>
                  ) : (
                    t("Submit")
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {t("Thank you!")}
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {t("Your volunteer application has been received.")}
            </p>
          </div>
        )}
      </div>
    </CustomModal>
  );
};

export default RegisterVolunteer;
