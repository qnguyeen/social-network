import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "@/utils";
import DonationChartItem from "@/components/charts/donation/DonationChartItem";

export default function DonationChart() {
  return (
    <div>
      <PageMeta title={`Post Chart - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Post Chart" />
      <div className="space-y-6">
        <DonationChartItem />
      </div>
    </div>
  );
}
