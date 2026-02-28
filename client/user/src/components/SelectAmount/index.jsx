import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import CustomModal from "~/components/CustomModal";

const SelectAmount = ({ campaign, isOpen, onClose, onDonate }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationError, setValidationError] = useState("");

  const predefinedAmounts = [100000, 200000, 500000, 1000000, 2000000];

  // Calculate remaining amount needed to reach target
  const remainingAmount = campaign?.target_amount - campaign?.current_amount;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const validateAmount = (value) => {
    const numericAmount = parseInt(value, 10);

    if (!numericAmount || numericAmount <= 0) {
      return t("Please enter a valid amount");
    }

    if (numericAmount > remainingAmount) {
      return t(
        "Donation amount cannot exceed the remaining target amount of {{amount}}",
        {
          amount: formatCurrency(remainingAmount),
        }
      );
    }

    return "";
  };

  const handleAmountSelect = (value) => {
    setAmount(value);
    setIsCustom(false);
    setValidationError(validateAmount(value));
  };

  const handleCustomAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setCustomAmount(value);
    setAmount(value);
    setIsCustom(true);
    setValidationError(validateAmount(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateAmount(amount);
    if (error) {
      setValidationError(error);
      return;
    }

    if (amount) {
      setIsProcessing(true);
      try {
        await onDonate(parseInt(amount, 10));
      } catch (error) {
        setIsProcessing(false);
      }
    }
  };

  // Reset state when modal is closed
  const handleModalClose = () => {
    setAmount("");
    setCustomAmount("");
    setIsCustom(false);
    setIsProcessing(false);
    setValidationError("");
    onClose();
  };

  // Filter predefined amounts to only show those within the remaining target
  const availablePredefinedAmounts = predefinedAmounts.filter(
    (amount) => amount <= remainingAmount
  );

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-5 bg-indigo-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-indigo-800">
              {t("Donate to")} {campaign?.title}
            </h3>
            <button
              onClick={handleModalClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isProcessing}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5">
          {/* Campaign info */}
          <div className="mb-6 flex items-center">
            <div className="w-12 h-12 rounded-md overflow-hidden mr-4">
              <img
                src={campaign?.image_url?.[0] || "/donate_blank.png"}
                alt={campaign?.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm text-gray-500">
                {t("Goal")}: {formatCurrency(campaign?.target_amount)}
              </div>
              <div className="text-sm text-gray-500">
                {campaign?.progress}% {t("Funded")} - {campaign?.daysLeft}{" "}
                {t("days left")}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {t("Remaining needed")}: {formatCurrency(remainingAmount)}
              </div>
            </div>
          </div>

          {/* Amount selection */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-3">
              {t("Select donation amount")}
            </label>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {availablePredefinedAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    amount === value.toString() && !isCustom
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                  onClick={() => handleAmountSelect(value.toString())}
                  disabled={isProcessing}
                >
                  {formatCurrency(value)}
                </button>
              ))}
              <button
                type="button"
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  isCustom
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
                onClick={() => setIsCustom(true)}
                disabled={isProcessing}
              >
                {t("Custom")}
              </button>
            </div>

            {isCustom && (
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  {t("Enter amount")} (VND)
                </label>
                <input
                  type="text"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  className={`w-full p-3 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500 ${
                    validationError ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder={t("Enter amount in VND")}
                  autoFocus
                  disabled={isProcessing}
                />
                <div className="mt-2 text-sm text-gray-500">
                  {customAmount ? formatCurrency(customAmount) : ""}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {t("Maximum")}: {formatCurrency(remainingAmount)}
                </div>
              </div>
            )}

            {/* Validation Error */}
            {validationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-red-500 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-red-700">
                    {validationError}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700">{t("Donation amount")}</span>
              <span className="font-medium text-gray-900">
                {amount ? formatCurrency(amount) : formatCurrency(0)}
              </span>
            </div>
          </div>

          {/* Payment method */}
          <div className="mb-6">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center">
                <img src="/icon_vnpay.png" alt="VNPay" className="h-6 mr-2" />
                <span className="text-gray-800">{t("Pay with VNPay")}</span>
              </div>
              <div className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded">
                {t("Default")}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleModalClose}
              className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
              disabled={isProcessing}
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              disabled={!amount || isProcessing || validationError}
              className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
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
                  {t("Processing...")}
                </div>
              ) : (
                t("Confirm donation")
              )}
            </button>
          </div>
        </form>
      </div>
    </CustomModal>
  );
};

export default SelectAmount;
