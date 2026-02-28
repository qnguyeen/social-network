import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import { APP_NAME } from "../../utils";
import { useTranslation } from "react-i18next";
import PopupAI from "@/components/popupai";

export default function SignIn() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta title={t(`Đăng nhập - ${APP_NAME}`)} />
      <PopupAI />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
