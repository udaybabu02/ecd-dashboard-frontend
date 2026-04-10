import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import ResourcesTab from "@/components/ResourcesTab";
import LocationFilters from "@/components/LocationFilters";
import DashboardTabs from "@/components/DashboardTabs";
import KpiCards from "@/components/KpiCards";
import AssessmentCycleChart from "@/components/AssessmentCycleChart";
import DistrictComparisonChart from "@/components/DistrictComparisonChart";
import RiskStratificationDashboard from "@/components/RiskStratificationDashboard";
import ReferralActionDashboard from "@/components/ReferralActionDashboard";
import WorkforceDashboard from "@/components/WorkforceDashboard";
import LongitudinalDashboard from "@/components/LongitudinalDashboard";
import AndhraMapDashboard from "@/components/AndhraMapDashboard"; // Added Map Import
import { ClipboardCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useGovernance } from "@/context/GovernanceContext";
import ExcelUpload from "@/components/UploadData";

const Index = () => {
  const [activeTab, setActiveTab] = useState("Screening & Coverage");
  const { t } = useLanguage();
  const { showDistrictComparison } = useGovernance();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      <LocationFilters />
      <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-[1600px] mx-auto flex-1 w-full">
        {activeTab === "Screening & Coverage" && (
          <>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">{t("screeningDashboard")}</h2>
            </div>
            <KpiCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AssessmentCycleChart />
              {showDistrictComparison && <DistrictComparisonChart />}
            </div>
          </>
        )}

        {activeTab === "Risk Stratification" && <RiskStratificationDashboard />}
        {activeTab === "Referral & Action" && <ReferralActionDashboard />}
        {activeTab === "Workforce" && <WorkforceDashboard />}
        {activeTab === "Longitudinal Impact" && <LongitudinalDashboard />}
        
        {/* Added the new Map render logic here */}
        {activeTab === "District Risk Priority Map" && <AndhraMapDashboard />} 
        
        {activeTab === "Resources" && <ResourcesTab />}
        
        {/* Fixed this to match the "Upload" key from DashboardTabs */}
        {activeTab === "Upload" && <ExcelUpload/>} 

      </main>

      <footer className="border-t border-border py-3 px-6 text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          {t("footerDisclaimer")}
        </p>
        <p className="text-[11px] text-muted-foreground/70">
          Designed &amp; Developed by AmaRaMam Services
        </p>
      </footer>
    </div>
  );
};

export default Index;