import { useMutationHook } from "@/hooks/useMutationHook";
import { Input, Modal, Button, message, DatePicker, Form, Select } from "antd";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
// Removed moment import as we're handling date formatting directly
import * as AdminService from "@/services/AdminService";
import { FaCircleExclamation } from "react-icons/fa6";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

const CreateUser = ({ open, handleClose, onSuccess }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Reset form when modal is opened
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  // Use the create user API call
  const mutation = useMutationHook((userData) => {
    return AdminService.createUser(userData);
  });

  const { isPending, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      handleClose();
      onSuccess();
      message.open({
        type: "success",
        content: t("User created successfully"),
      });
      form.resetFields();
    }
  }, [isSuccess]);

  const onSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const { confirmPassword, ...userData } = values;

        // Format dateOfBirth to DD/MM/YYYY format before sending
        if (userData.dateOfBirth) {
          // Extract day, month, year from the Date object
          const date = new Date(userData.dateOfBirth);
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();

          // Format as DD/MM/YYYY similar to the RegisterPage
          userData.dateOfBirth = `${day}/${month}/${year}`;
        }

        mutation.mutate(userData);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
      });
  };

  // Password validation patterns - similar to RegisterPage
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;
  const noSpacesPattern = /\s/;

  return (
    <Modal
      title={t("Create New User")}
      centered
      className="custom-modal"
      closeIcon={false}
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          {t("Cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={onSubmit}
          loading={isPending}
        >
          {t("Create User")}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <div className="flex items-center justify-between gap-4">
          <Form.Item
            label={t("First Name")}
            name="firstName"
            className="w-1/2"
            rules={[
              { required: true, message: t("Please enter first name") },
              { min: 1, message: t("First name must be at least 1 character") },
              { max: 50, message: t("First name cannot exceed 50 characters") },
            ]}
            hasFeedback
          >
            <Input
              count={{
                show: true,
                max: 50,
              }}
              minLength={1}
              maxLength={50}
              placeholder={t("Enter first name")}
              suffix={
                form.getFieldError("firstName").length > 0 ? (
                  <FaCircleExclamation color="red" />
                ) : null
              }
            />
          </Form.Item>
          <Form.Item
            label={t("Last Name")}
            name="lastName"
            className="w-1/2"
            rules={[
              { required: true, message: t("Please enter last name") },
              { min: 1, message: t("Last name must be at least 1 character") },
              { max: 50, message: t("Last name cannot exceed 50 characters") },
            ]}
            hasFeedback
          >
            <Input
              count={{
                show: true,
                max: 50,
              }}
              minLength={1}
              maxLength={50}
              placeholder={t("Enter last name")}
              suffix={
                form.getFieldError("lastName").length > 0 ? (
                  <FaCircleExclamation color="red" />
                ) : null
              }
            />
          </Form.Item>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Form.Item
            label={t("Username")}
            name="username"
            className="w-1/2"
            rules={[
              { required: true, message: t("Please enter username") },
              { min: 1, message: t("Username must be at least 1 character") },
              { max: 50, message: t("Username cannot exceed 50 characters") },
              {
                validator: (_, value) => {
                  if (value && noSpacesPattern.test(value)) {
                    return Promise.reject(
                      new Error(t("Username cannot contain spaces"))
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            hasFeedback
          >
            <Input
              count={{
                show: true,
                max: 50,
              }}
              placeholder={t("Enter username")}
              suffix={
                form.getFieldError("username").length > 0 ? (
                  <FaCircleExclamation color="red" />
                ) : null
              }
            />
          </Form.Item>
          <Form.Item
            label={t("Gender")}
            name="gender"
            className="w-1/2"
            rules={[{ required: true, message: t("Please select gender") }]}
            initialValue="male"
            hasFeedback
          >
            <Select placeholder={t("Select gender")}>
              <Select.Option value="male">{t("Male")}</Select.Option>
              <Select.Option value="female">{t("Female")}</Select.Option>
              <Select.Option value="other">{t("Other")}</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Form.Item
            label={t("Date of Birth")}
            name="dateOfBirth"
            className="w-1/2"
            rules={[
              { required: true, message: t("Please select date of birth") },
            ]}
            hasFeedback
          >
            <DatePicker
              className="w-full"
              placeholder={t("DD/MM/YYYY")}
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            label={t("Phone Number")}
            name="phoneNumber"
            className="w-1/2"
            rules={[
              { required: true, message: t("Please enter phone number") },
              {
                pattern: /^[0-9]{10,11}$/,
                message: t("Invalid phone number"),
              },
            ]}
            hasFeedback
          >
            <Input
              placeholder={t("Enter phone number")}
              suffix={
                form.getFieldError("phoneNumber").length > 0 ? (
                  <FaCircleExclamation color="red" />
                ) : null
              }
            />
          </Form.Item>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Form.Item
            label={t("Email")}
            name="email"
            className="w-full"
            rules={[
              { required: true, message: t("Please enter email") },
              { type: "email", message: t("Please enter a valid email") },
              {
                validator: (_, value) => {
                  if (value && noSpacesPattern.test(value)) {
                    return Promise.reject(
                      new Error(t("Email cannot contain spaces"))
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            hasFeedback
          >
            <Input
              placeholder={t("Enter email")}
              suffix={
                form.getFieldError("email").length > 0 ? (
                  <FaCircleExclamation color="red" />
                ) : null
              }
            />
          </Form.Item>
        </div>

        <div className="flex items-center justify-between gap-4">
          <Form.Item
            label={t("Password")}
            name="password"
            className="w-1/2"
            rules={[
              { required: true, message: t("Please enter password") },
              { min: 8, message: t("Password must be at least 8 characters") },
              { max: 64, message: t("Password cannot exceed 64 characters") },
              {
                pattern: passwordPattern,
                message: t(
                  "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
                ),
              },
              {
                validator: (_, value) => {
                  if (value && noSpacesPattern.test(value)) {
                    return Promise.reject(
                      new Error(t("Password cannot contain spaces"))
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
            hasFeedback
          >
            <Input.Password
              placeholder={t("Enter password")}
              visibilityToggle={{
                visible: passwordVisible,
                onVisibleChange: setPasswordVisible,
              }}
              iconRender={(visible) =>
                visible ? (
                  <IoMdEye className="cursor-pointer" />
                ) : (
                  <IoMdEyeOff className="cursor-pointer" />
                )
              }
            />
          </Form.Item>
          <Form.Item
            label={t("Confirm Password")}
            name="confirmPassword"
            className="w-1/2"
            dependencies={["password"]}
            rules={[
              { required: true, message: t("Please confirm password") },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t("Passwords do not match")));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password
              placeholder={t("Confirm password")}
              visibilityToggle={{
                visible: confirmPasswordVisible,
                onVisibleChange: setConfirmPasswordVisible,
              }}
              iconRender={(visible) =>
                visible ? (
                  <IoMdEye className="cursor-pointer" />
                ) : (
                  <IoMdEyeOff className="cursor-pointer" />
                )
              }
            />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateUser;
