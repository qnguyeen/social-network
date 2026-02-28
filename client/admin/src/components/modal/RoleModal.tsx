import { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as AdminService from "@/services/AdminService";
import { useTranslation } from "react-i18next";

export default function RoleModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const createRoleMutation = useMutation({
    mutationFn: (data) => {
      // Add default permission APPROVE_POST when submitting to API
      return AdminService.createRole({
        ...data,
        permissions: ["APPROVE_POST"],
      });
    },
    onSuccess: () => {
      message.success(t("Role created successfully"));
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      message.error(`Failed to create role: ${error.message}`);
    },
    onSettled: () => {
      setSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();
      createRoleMutation.mutate(values);
    } catch (error) {
      setSubmitting(false);
      console.error("Validation failed:", error);
    }
  };

  return (
    <Modal
      title={t("Create New Role")}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t("Cancel")}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={handleSubmit}
        >
          {t("Create")}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label={t("Role Name")}
          rules={[
            { required: true, message: t("Please enter role name") },
            {
              pattern: /^[A-Z_]+$/,
              message: t(
                "Role name must be uppercase letters and underscores only"
              ),
            },
            {
              min: 3,
              max: 50,
              message: t("Role name must be between 3 and 50 characters"),
            },
          ]}
        >
          <Input placeholder="e.g. ADMIN, EDITOR, USER" />
        </Form.Item>

        <Form.Item
          name="description"
          label={t("Description")}
          rules={[
            { required: true, message: t("Please enter role description") },
            {
              min: 10,
              max: 200,
              message: t("Description must be between 10 and 200 characters"),
            },
            {
              validator: (_, value) => {
                if (value && value.trim().split(/\s+/).length < 3) {
                  return Promise.reject(
                    t("Description should have at least 3 words")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder={t("Describe the role responsibilities")}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
