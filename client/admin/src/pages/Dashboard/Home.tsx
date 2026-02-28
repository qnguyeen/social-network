import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import PageMeta from "../../components/common/PageMeta";
import { APP_NAME } from "../../utils";
import SocialNetworkStatsTable from "@/components/ecommerce/SocialNetworkStatsTable";
import GroupsDashboard from "../../components/ecommerce/StatisticsChart";
import EngagementMetrics from "@/components/ecommerce/MonthlyTarget";

export default function Home() {
  return (
    <>
      <PageMeta title={`Admin - ${APP_NAME}`} />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <SocialNetworkStatsTable />
        </div>

        <div className="col-span-12">
          <GroupsDashboard />
        </div>

        <div className="col-span-12">
          <EngagementMetrics />
        </div>
      </div>
    </>
  );
}
