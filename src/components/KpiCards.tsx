import { Users, BarChart3, TrendingUp, ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useECDData } from "@/context/ECDDataContext";
import { useLanguage } from "@/context/LanguageContext";
import InfoLabel from "@/components/InfoLabel";
import { useMemo } from "react";

const ICON_BG_COLORS = [
  "bg-[hsl(192,70%,45%,0.12)]",
  "bg-[hsl(180,60%,35%,0.12)]",
  "bg-[hsl(168,55%,50%,0.12)]",
  "bg-[hsl(205,78%,22%,0.12)]",
];
const ICON_COLORS = [
  "text-[hsl(192,70%,45%)]",
  "text-[hsl(180,60%,35%)]",
  "text-[hsl(168,55%,50%)]",
  "text-[hsl(205,78%,22%)]",
];

const KpiCards = () => {
  const { filteredProfiles, loading } = useECDData();
  const { t } = useLanguage();

  const kpis = useMemo(() => {
    const total = filteredProfiles.length;
    const uniqueAwcs = new Set(filteredProfiles.map((c) => c.awc_code)).size;
    const assessmentsPerAwc = uniqueAwcs > 0 ? (total / uniqueAwcs).toFixed(1) : "0";
    const coverage = total > 0 ? "100.0%" : "0%";

    return [
      { label: t("totalChildrenScreened"), value: total.toLocaleString(), subtitle: "↑ Active screening", subtitleColor: "text-success", icon: Users, info: "Total number of children aged 0–6 years who have received developmental screening." },
      { label: t("assessmentsPerAwc"), value: assessmentsPerAwc, icon: BarChart3, info: "Number of developmental assessments conducted in each Anganwadi Centre." },
      { label: t("screeningCoverageKpi"), value: coverage, icon: TrendingUp, info: "Percentage of registered children who have been screened." },
      { label: t("uniqueAwcsActive"), value: uniqueAwcs.toLocaleString(), icon: ClipboardCheck, info: "Number of unique Anganwadi Centres that have active screening records." },
    ];
  }, [filteredProfiles, t]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-5 h-28 animate-pulse bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <Card key={i} className="p-4 sm:p-5 flex justify-between items-start animate-fade-in group cursor-default" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="space-y-1">
            <p className="kpi-label flex items-center gap-1">{kpi.label}<InfoLabel text={kpi.info} /></p>
            <p className="kpi-value">{kpi.value}</p>
            {kpi.subtitle && <p className={`text-xs font-medium ${kpi.subtitleColor}`}>{kpi.subtitle}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${ICON_BG_COLORS[i]} transition-transform duration-300 group-hover:scale-110`}>
            <kpi.icon className={`w-5 h-5 ${ICON_COLORS[i]}`} />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default KpiCards;
