import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import BarChartOne from "../../components/charts/bar/BarChartOne";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "@/utils";

export default function BarChart() {
  return (
    <div>
      <PageMeta title={`Post Chart - ${APP_NAME}`} />
      <PageBreadcrumb pageTitle="Post Chart" />
      <div className="space-y-6">
        <BarChartOne />
      </div>
    </div>
  );
}
