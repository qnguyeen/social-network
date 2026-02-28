import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "@/utils";
import CampaignChartOne from "@/components/charts/campaign/CampaignChartOne";

export default function CampaignChart() {
  return (
    <>
      <PageMeta title={`User Chart - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="User Chart" />
      <div className="space-y-6">
        <ComponentCard title="Overview">
          <CampaignChartOne />
        </ComponentCard>
      </div>
    </>
  );
}
