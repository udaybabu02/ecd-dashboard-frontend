import { useState } from "react";
import { ClipboardCheck, AlertTriangle, PhoneForwarded, Users, TrendingUp, BookOpen, Upload, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUploadClick?: () => void;
}

const TAB_ACCENT_COLORS: Record<string, string> = {
  "Screening & Coverage": "border-[hsl(192,70%,45%)] text-[hsl(192,70%,45%)]",
  "Risk Stratification": "border-[hsl(265,55%,50%)] text-[hsl(265,55%,50%)]",
  "Referral & Action": "border-[hsl(25,85%,50%)] text-[hsl(25,85%,50%)]",
  "Workforce": "border-[hsl(255,60%,52%)] text-[hsl(255,60%,52%)]",
  "Longitudinal Impact": "border-[hsl(160,65%,40%)] text-[hsl(160,65%,40%)]",
  "District Risk Priority Map": "border-[hsl(210,70%,50%)] text-[hsl(210,70%,50%)]",
  "Resources": "border-[hsl(200,60%,45%)] text-[hsl(200,60%,45%)]",
  "Upload": "border-[hsl(150,60%,45%)] text-[hsl(150,60%,45%)]", // Added missing color for Upload
};

const DashboardTabs = ({ activeTab, onTabChange, onUploadClick }: DashboardTabsProps) => {
  const { t } = useLanguage();

  const tabs = [
    { key: "Screening & Coverage", labelKey: "screeningCoverage", icon: ClipboardCheck },
    { key: "Risk Stratification", labelKey: "riskStratification", icon: AlertTriangle },
    { key: "Referral & Action", labelKey: "referralAction", icon: PhoneForwarded },
    { key: "Workforce", labelKey: "workforce", icon: Users },
    { key: "Longitudinal Impact", labelKey: "longitudinalImpact", icon: TrendingUp },
    { key: "District Risk Priority Map", labelKey: "apMap", icon: MapPin },
    { key: "Resources", labelKey: "resources", icon: BookOpen },
    { key: "Upload", labelKey: "uploadData", icon: Upload }, // <-- Re-added your Upload tab!
  ];

  return (
    <div className="bg-card border-b border-border px-2 sm:px-6">
      <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-[3px] transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? TAB_ACCENT_COLORS[tab.key]
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">
                {tab.key === "District Risk Priority Map" ? "District Risk Priority Map" : (t(tab.labelKey) !== tab.labelKey ? t(tab.labelKey) : tab.key)}
              </span>
              <span className="sm:hidden">
                {tab.key === "District Risk Priority Map" ? "Risk Map" : (t(tab.labelKey) !== tab.labelKey ? t(tab.labelKey).split(' ')[0] : tab.key.split(' ')[0])}
              </span>
            </button>
          );
        })}

        {/* This handles the blue 'Upload Resource' button if you use it */}
        {onUploadClick && (
          <div className="ml-auto pl-2 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  onClick={onUploadClick}
                  className="gap-1.5 h-8"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">{t("uploadResource") !== "uploadResource" ? t("uploadResource") : "Upload Resource"}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("uploadResourceTooltip") !== "uploadResourceTooltip" ? t("uploadResourceTooltip") : "Upload a new resource file"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </nav>
    </div>
  );
};

export default DashboardTabs;