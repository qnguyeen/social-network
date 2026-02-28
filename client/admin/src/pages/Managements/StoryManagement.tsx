import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";
import StoryTable from "@/components/tables/BasicTables/StoryTable";
import { useTranslation } from "react-i18next";

export default function StoryManagement() {
  const { t } = useTranslation();
  return (
    <>
      <PageMeta title={`${t("Story Management")} - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Story" />
      <div className="space-y-6">
        <ComponentCard title={t("Table story")}>
          <StoryTable />
        </ComponentCard>
      </div>
    </>
  );
}
