import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Button,
  Input,
  Select,
  DatePicker,
  message,
  Steps,
  InputNumber,
  Spin,
  Tooltip,
  Divider,
  Modal,
  Form,
} from "antd";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import { MdContentCopy, MdDone } from "react-icons/md";
import { FaRegCreditCard } from "react-icons/fa";
import { CloseOutlined } from "@ant-design/icons";
import moment from "moment";
import * as AdService from "~/services/AdService";

const CreateAdPost = ({ open, handleClose, post }) => {
  const { t } = useTranslation();
  const theme = useSelector((state) => state?.theme?.theme);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [adCampaignResult, setAdCampaignResult] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [form] = Form.useForm();
  const [errors, setErrors] = useState({
    description: "",
    mainAdCampaignId: "",
    timeSlots: "",
    duration: "",
    paymentAmount: "",
  });
  const [formData, setFormData] = useState({
    description: "",
    postId: post?.id || "",
    mainAdCampaignId: "",
    timeSlots: [],
    duration: 1,
  });
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [dateRange, setDateRange] = useState(null);

  const { Option } = Select;
  const { RangePicker } = DatePicker;

  const validateField = (field, value) => {
    let errorMessage = "";

    switch (field) {
      case "description":
        if (!value.trim()) {
          errorMessage = t("Description is required");
        } else if (value.length > 200) {
          errorMessage = t("Description must be less than 200 characters");
        }
        break;

      case "mainAdCampaignId":
        if (!value.trim()) {
          errorMessage = t("Campaign ID is required");
        } else if (!/^[a-zA-Z0-9-_]+$/.test(value)) {
          errorMessage = t("Campaign ID contains invalid characters");
        }
        break;

      case "timeSlots":
        if (!value || value.length === 0) {
          errorMessage = t("Time slots are required");
        }
        break;

      case "duration":
        if (!value || value <= 0) {
          errorMessage = t("Duration must be greater than 0");
        }
        break;

      case "paymentAmount":
        if (!value || value <= 0) {
          errorMessage = t("Payment amount must be greater than 0");
        } else if (value > 1000000000) {
          // 1 billion VND limit
          errorMessage = t("Payment amount is too large");
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: errorMessage,
    }));

    return !errorMessage;
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    validateField(field, value);
  };

  const handleTimeSlotChange = (dates, dateStrings) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange(dates);

      const timeSlots = [];
      const start = moment(dates[0]);
      const end = moment(dates[1]);

      console.log("start", start);
      console.log("end", end);

      const calculatedDuration = end.diff(start, "days") + 1;
      console.log("calculatedDuration", calculatedDuration);

      if (calculatedDuration > 90) {
        setErrors((prev) => ({
          ...prev,
          timeSlots: t("Date range cannot exceed 90 days"),
        }));
        return;
      }

      if (start.isBefore(moment(), "day")) {
        setErrors((prev) => ({
          ...prev,
          timeSlots: t("Start date cannot be in the past"),
        }));
        return;
      }

      let current = start.clone();
      while (current.isSameOrBefore(end, "day")) {
        timeSlots.push(current.format("YYYY-MM-DDTHH:mm:00Z"));
        current.add(1, "day");
      }

      const newFormData = {
        ...formData,
        timeSlots: timeSlots,
        duration: calculatedDuration,
      };
      setFormData(newFormData);

      setErrors((prev) => ({
        ...prev,
        timeSlots: "",
        duration: "",
      }));
    } else {
      setDateRange(null);
      const newFormData = {
        ...formData,
        timeSlots: [],
        duration: 1,
      };
      setFormData(newFormData);

      setErrors((prev) => ({
        ...prev,
        timeSlots: "",
        duration: "",
      }));
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handleInputChange("mainAdCampaignId", text);
    } catch (err) {
      message.error(t("Failed to access clipboard"));
    }
  };

  const copyToClipboard = () => {
    if (adCampaignResult?.id) {
      navigator.clipboard
        .writeText(adCampaignResult.id)
        .then(() => {
          setCopiedId(true);
          setTimeout(() => setCopiedId(false), 2000);
        })
        .catch((err) => message.error(t("Failed to copy to clipboard")));
    }
  };

  const validateForm = () => {
    // Validate all fields
    const descriptionValid = validateField("description", formData.description);
    const mainAdCampaignIdValid = validateField(
      "mainAdCampaignId",
      formData.mainAdCampaignId
    );
    const timeSlotsValid = validateField("timeSlots", formData.timeSlots);
    const durationValid = validateField("duration", formData.duration);

    return (
      descriptionValid &&
      mainAdCampaignIdValid &&
      timeSlotsValid &&
      durationValid
    );
  };

  const createAdCampaign = async () => {
    if (!validateForm()) {
      // Show first error message
      const firstError = Object.values(errors).find((error) => error);
      if (firstError) {
        message.error(firstError);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await AdService.createAdPost({ request: formData });
      if (res.code === 200) {
        setAdCampaignResult(res?.result);
        setCurrentStep(1);
        message.success(res?.message || t("Ad campaign created successfully"));
      } else {
        message.error(res?.message || t("Failed to create ad campaign"));
      }
    } catch (error) {
      message.error(error?.message || t("Failed to create ad campaign"));
    } finally {
      setLoading(false);
    }
  };

  const validatePayment = () => {
    return validateField("paymentAmount", paymentAmount);
  };

  const processPayment = async () => {
    if (!validatePayment()) {
      message.error(errors.paymentAmount || t("Invalid payment amount"));
      return;
    }

    setPaymentLoading(true);
    try {
      const data = {
        adCampaignId: adCampaignResult.id,
        amount: paymentAmount,
      };
      const res = await AdService.createDonateAd({ data: data });
      if (res?.code === 1000 && res?.result?.payment?.vnp_url) {
        window.location.href = res.result.payment.vnp_url;
      } else {
        message.error(res?.message || t("Payment processing failed"));
      }
    } catch (error) {
      message.error(error?.message || t("Payment processing failed"));
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setFormData({
        description: "",
        postId: post?.id || "",
        mainAdCampaignId: "",
        timeSlots: [],
        duration: 1,
      });
      setDateRange(null);
      setAdCampaignResult(null);
      setCopiedId(false);
      setPaymentAmount(0);
      setErrors({
        description: "",
        mainAdCampaignId: "",
        timeSlots: "",
        duration: "",
        paymentAmount: "",
      });
      form.resetFields();
    } else if (post?.id) {
      setFormData((prev) => ({
        ...prev,
        postId: post.id,
      }));
    }
  }, [open, post, form]);

  // Validate payment amount when it changes
  useEffect(() => {
    if (currentStep === 1) {
      validateField("paymentAmount", paymentAmount);
    }
  }, [paymentAmount, currentStep]);

  const steps = [
    {
      title: t("Create Ad Post"),
      content: (
        <div className="p-4">
          <Form
            form={form}
            layout="vertical"
            initialValues={formData}
            onValuesChange={(changedValues, allValues) => {
              const field = Object.keys(changedValues)[0];
              handleInputChange(field, changedValues[field]);
            }}
          >
            <Form.Item
              label={t("Description")}
              name="description"
              validateStatus={errors.description ? "error" : ""}
              help={errors.description}
              rules={[
                { required: true, message: t("Description is required") },
                {
                  max: 200,
                  message: t("Description must be less than 200 characters"),
                },
              ]}
            >
              <Input
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder={t("Campaign description")}
              />
            </Form.Item>

            <Form.Item label={t("Post ID")} name="postId">
              <Input
                value={formData.postId}
                disabled
                placeholder={t("Post ID will be auto-filled")}
              />
            </Form.Item>

            <Form.Item
              label={t("Main Ad Campaign ID")}
              name="mainAdCampaignId"
              validateStatus={errors.mainAdCampaignId ? "error" : ""}
              help={errors.mainAdCampaignId}
              rules={[
                { required: true, message: t("Campaign ID is required") },
                {
                  pattern: /^[a-zA-Z0-9-_]+$/,
                  message: t("Campaign ID contains invalid characters"),
                },
              ]}
            >
              <div className="flex gap-2">
                <Input
                  value={formData.mainAdCampaignId}
                  onChange={(e) =>
                    handleInputChange("mainAdCampaignId", e.target.value)
                  }
                  placeholder={t("Enter or paste campaign ID")}
                  className="flex-grow"
                />
                <Button onClick={handlePaste} icon={<MdContentCopy />}>
                  {t("Paste")}
                </Button>
              </div>
            </Form.Item>

            <Form.Item
              label={t("Time Slots")}
              validateStatus={errors.timeSlots ? "error" : ""}
              help={errors.timeSlots}
              required
            >
              <RangePicker
                className="w-full"
                value={dateRange}
                onChange={handleTimeSlotChange}
                showTime={{ format: "HH:mm" }}
                format="YYYY-MM-DD HH:mm"
                allowClear={true}
                disabledDate={(current) => {
                  return current && current < moment().startOf("day");
                }}
              />
              <div className="mt-2 text-xs text-gray-500">
                {formData.timeSlots.length > 0
                  ? `${formData.timeSlots.length} ${t("time slots selected")}`
                  : t("Please select date range for ad display")}
              </div>
            </Form.Item>

            <Form.Item
              label={`${t("Duration")} (${t("days")})`}
              name="duration"
              validateStatus={errors.duration ? "error" : ""}
              help={errors.duration}
            >
              <div className="flex items-center gap-2">
                <Input
                  value={`${formData.duration} ${
                    formData.duration === 1 ? t("day") : t("days")
                  }`}
                  disabled
                  className="bg-gray-50 flex-1"
                />
                <Tooltip
                  title={t(
                    "Duration is automatically calculated from selected date range"
                  )}
                >
                  <span className="text-gray-400 cursor-help">ℹ️</span>
                </Tooltip>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {t(
                  "Duration is automatically calculated from the selected date range"
                )}
              </div>
            </Form.Item>
          </Form>

          <Button
            type="primary"
            onClick={createAdCampaign}
            loading={loading}
            className="w-full h-12 mt-4 bg-bgStandard rounded-xl text-base font-normal hover:scale-105 active:scale-95 transition-transform text-ascent-3"
          >
            {t("Create Ad Post")}
          </Button>
        </div>
      ),
    },
    {
      title: t("Payment"),
      content: adCampaignResult && (
        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">
              {t("Campaign Details")}
            </h3>
            <div className="bg-primary border-1 border-borderNewFeed p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-y-2">
                <div className="text-sm font-medium">{t("Campaign ID")}:</div>
                <div className="text-sm">{adCampaignResult.id}</div>

                <div className="text-sm font-medium">{t("Title")}:</div>
                <div className="text-sm">
                  {adCampaignResult.title || adCampaignResult.description}
                </div>

                <div className="text-sm font-medium">{t("Post ID")}:</div>
                <div className="text-sm">{adCampaignResult.post_id}</div>

                <div className="text-sm font-medium">{t("Status")}:</div>
                <div className="text-sm">
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    {adCampaignResult.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">{t("Campaign ID")}</h3>
              <Tooltip
                title={copiedId ? `${t("Copied")}!` : t("Copy to clipboard")}
              >
                <Button
                  icon={copiedId ? <MdDone /> : <MdContentCopy />}
                  onClick={copyToClipboard}
                  size="small"
                >
                  {copiedId ? t("Copied") : t("Copy")}
                </Button>
              </Tooltip>
            </div>
            <div className="flex gap-2">
              <Input
                value={adCampaignResult?.id}
                readOnly
                className="font-mono flex-grow"
              />
            </div>
          </div>

          <Divider />

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">{t("Payment Details")}</h3>
            <Form.Item
              label={t("Amount to pay")}
              validateStatus={errors.paymentAmount ? "error" : ""}
              help={errors.paymentAmount}
            >
              <div className="flex items-center gap-2">
                <InputNumber
                  value={paymentAmount}
                  onChange={(value) => {
                    setPaymentAmount(value);
                    validateField("paymentAmount", value);
                  }}
                  formatter={(value) =>
                    `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/₫\s?|(,*)/g, "")}
                  min={1}
                  max={1000000000}
                  className={errors.paymentAmount ? "border-red-500" : ""}
                />
              </div>
            </Form.Item>
            <div className="mt-2 text-xs text-gray-500">
              {t(
                "Please select the correct amount according to the main ad campaign"
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleClose}
              className="w-1/3 h-12 rounded-xl text-base font-normal hover:scale-105 active:scale-95 transition-transform"
            >
              {t("Cancel")}
            </Button>
            <Button
              type="primary"
              icon={<FaRegCreditCard className="mr-2" />}
              onClick={processPayment}
              loading={paymentLoading}
              className="w-2/3  h-12 bg-green-600 hover:bg-green-700 rounded-xl text-base font-normal hover:scale-105 active:scale-95 transition-transform"
              disabled={!!errors.paymentAmount}
            >
              {t("Process Payment")}
            </Button>
          </div>
        </div>
      ),
    },
  ];

  // Modal title with icon
  const modalTitle = (
    <div className="flex items-center gap-2 py-2">
      <HiOutlineSpeakerphone size={25} />
      <span className="text-lg">{t("Advertise Post")}</span>
    </div>
  );

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      className={theme === "dark" ? "ant-modal-dark" : ""}
      closeIcon={<CloseOutlined />}
      maskClosible={!loading && !paymentLoading}
      centered
    >
      {/* Steps */}
      <div className="py-4 border-b border-borderNewFeed">
        <Steps
          current={currentStep}
          items={steps.map((item) => ({ title: item.title }))}
        />
      </div>

      {/* Content */}
      <div className="min-h-64">{steps[currentStep].content}</div>
    </Modal>
  );
};

export default CreateAdPost;
