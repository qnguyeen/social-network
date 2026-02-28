import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";
import GroupTable from "@/components/tables/BasicTables/GroupTable";
import { useTranslation } from "react-i18next";

export default function GroupManagement() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta title={`${t("Group Management")} - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle={t("Groups")} />
      <div className="space-y-6">
        <ComponentCard title={t("Groups Table")}>
          <GroupTable />
        </ComponentCard>
      </div>
    </>
  );
}
