import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";
import RoleTable from "../../components/tables/BasicTables/RoleTable";
import { Button } from "antd";
import RoleModal from "@/components/modal/RoleModal";
import { useTranslation } from "react-i18next";

export default function RoleManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <PageMeta title={`${t("Role Management")} - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle={t("Roles")} />
      <div className="space-y-6">
        <ComponentCard
          title={t("Roles Table")}
          btn={<Button onClick={handleOpenModal}>{t("Create role")}</Button>}
        >
          <RoleTable />
        </ComponentCard>
      </div>

      <RoleModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
