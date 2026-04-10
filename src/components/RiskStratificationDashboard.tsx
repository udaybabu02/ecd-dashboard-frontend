import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useECDData } from "@/context/ECDDataContext";
import { useLanguage } from "@/context/LanguageContext";
import InfoLabel from "@/components/InfoLabel";
import { AlertTriangle, Shield, Activity, Brain } from "lucide-react";
import AgeBandRiskChart from "@/components/AgeBandRiskChart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

const RADIAN = Math.PI / 180;
const renderSmartLabel = (isMobile: boolean) => (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, label } = props;
  const displayName = name || label || "";
  const pct = percent * 100;
  const minPct = isMobile ? 5 : 2;
  if (pct < minPct) return null;
  const offset = isMobile ? 25 : 35;
  const radius = outerRadius + offset;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const fontSize = isMobile ? 11 : 13;
  return (
    <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={fontSize} fontWeight={500}>
      {`${displayName} ${Math.round(pct)}%`}
    </text>
  );
};

const RISK_COLORS: Record<string, string> = {
  Low: "hsl(var(--risk-low))",
  Medium: "hsl(var(--risk-medium))",
  High: "hsl(var(--risk-high))",
};

const SEVERITY_COLORS = [
  "hsl(var(--risk-low))",
  "hsl(var(--chart-accent))",
  "hsl(var(--risk-medium))",
  "hsl(var(--risk-high))",
  "hsl(var(--risk-critical))",
];

const DOMAIN_LABELS = ["GM", "FM", "LC", "COG", "SE"];

const ICON_BG = [
  "bg-[hsl(0,72%,51%,0.12)]",
  "bg-[hsl(38,92%,50%,0.12)]",
  "bg-[hsl(152,60%,40%,0.12)]",
  "bg-[hsl(265,55%,50%,0.12)]",
];
const ICON_CLR = [
  "text-[hsl(0,72%,51%)]",
  "text-[hsl(38,92%,50%)]",
  "text-[hsl(152,60%,40%)]",
  "text-[hsl(265,55%,50%)]",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  fontSize: "13px",
  boxShadow: "0 4px 12px hsl(213 32% 14% / 0.1)",
};

const RiskStratificationDashboard = () => {
  const { filteredProfiles, riskMap, devRiskMap, neuroMap, loading } = useECDData();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const riskCounts = useMemo(() => {
    const counts: Record<string, number> = { Low: 0, Medium: 0, High: 0 };
    filteredProfiles.forEach((c) => {
      const r = riskMap.get(c.child_id);
      if (r && counts[r.baseline_category] !== undefined) counts[r.baseline_category]++;
    });
    return counts;
  }, [filteredProfiles, riskMap]);

  const riskPieData = useMemo(() =>
    Object.entries(riskCounts).map(([name, value]) => ({ name, value })),
    [riskCounts]
  );

  const domainDelays = useMemo(() => {
    const counts = { GM: 0, FM: 0, LC: 0, COG: 0, SE: 0 };
    filteredProfiles.forEach((c) => {
      const d = devRiskMap.get(c.child_id);
      if (d) {
        if (d.GM_delay) counts.GM++;
        if (d.FM_delay) counts.FM++;
        if (d.LC_delay) counts.LC++;
        if (d.COG_delay) counts.COG++;
        if (d.SE_delay) counts.SE++;
      }
    });
    return DOMAIN_LABELS.map((k) => ({ domain: k, count: counts[k as keyof typeof counts] }));
  }, [filteredProfiles, devRiskMap]);

  const delaySeverity = useMemo(() => {
    const severity: Record<string, number> = { "No Delay": 0, "1 Delay": 0, "2 Delays": 0, "3 Delays": 0, "4 Delays": 0 };
    filteredProfiles.forEach((c) => {
      const d = devRiskMap.get(c.child_id);
      if (d) {
        const n = Number(d.num_delays) || 0;
        if (n === 0) severity["No Delay"]++;
        else if (n === 1) severity["1 Delay"]++;
        else if (n === 2) severity["2 Delays"]++;
        else if (n === 3) severity["3 Delays"]++;
        else severity["4 Delays"]++;
      }
    });
    return Object.entries(severity).map(([label, count]) => ({ label, count }));
  }, [filteredProfiles, devRiskMap]);

  const neuroBehavioralData = useMemo(() => {
    let autism = 0, behavioral = 0, attention = 0;
    filteredProfiles.forEach((c) => {
      const n = neuroMap.get(c.child_id);
      if (n) {
        if (n.autism_risk && n.autism_risk !== "No" && n.autism_risk !== "None" && n.autism_risk !== "") autism++;
        if (n.behavior_risk && n.behavior_risk !== "No" && n.behavior_risk !== "None" && n.behavior_risk !== "") behavioral++;
        if (n.adhd_risk && n.adhd_risk !== "No" && n.adhd_risk !== "None" && n.adhd_risk !== "") attention++;
      }
    });
    return [
      { indicator: "Autism Risk", count: autism },
      { indicator: "Behavioral Concerns", count: behavioral },
      { indicator: "Attention Issues", count: attention },
    ];
  }, [filteredProfiles, neuroMap]);

  const highRiskPct = useMemo(() => {
    const total = filteredProfiles.length;
    if (!total) return "0%";
    return (riskCounts.High / total * 100).toFixed(1) + "%";
  }, [filteredProfiles, riskCounts]);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Card key={i} className="h-28 animate-pulse bg-muted" />)}</div>;

  const kpis = [
    { label: t("highCriticalRisk"), value: riskCounts.High.toLocaleString(), subtitle: highRiskPct + " of total", icon: AlertTriangle, info: "Children classified into High developmental risk based on baseline score > 25." },
    { label: t("mediumRisk"), value: riskCounts.Medium.toLocaleString(), icon: Shield, info: "Children classified into Medium developmental risk (baseline score 11-25)." },
    { label: t("lowRisk"), value: riskCounts.Low.toLocaleString(), icon: Activity, info: "Children classified as Low risk (baseline score ≤ 10)." },
    { label: t("avgDelaysPerChild"), value: filteredProfiles.length > 0 ? (filteredProfiles.reduce((s, c) => s + (devRiskMap.get(c.child_id)?.num_delays || 0), 0) / filteredProfiles.length).toFixed(1) : "0", icon: Brain, info: "Average number of developmental domain delays per child across GM, FM, LC, COG, SE." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-[hsl(var(--risk-bar))]" />
        <h2 className="text-xl font-semibold text-foreground">{t("riskStratificationDashboard")}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="p-4 sm:p-5 flex justify-between items-start animate-fade-in group cursor-default" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="space-y-1">
              <p className="kpi-label flex items-center gap-1">{kpi.label}<InfoLabel text={kpi.info} /></p>
              <p className="kpi-value">{kpi.value}</p>
              {kpi.subtitle && <p className="text-xs font-medium text-destructive">{kpi.subtitle}</p>}
            </div>
            <div className={`p-2.5 rounded-xl ${ICON_BG[i]} transition-transform duration-300 group-hover:scale-110`}>
              <kpi.icon className={`w-5 h-5 ${ICON_CLR[i]}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h3 className="section-title mb-5 flex items-center gap-1">{t("riskCategoryDistribution")}<InfoLabel text="Children classified into Low, Medium, High, or Critical developmental risk based on assessment results." /></h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={riskPieData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={isMobile ? 65 : 80} innerRadius={isMobile ? 25 : 35} label={renderSmartLabel(isMobile)} labelLine={false} strokeWidth={2} stroke="hsl(var(--card))">
                {riskPieData.filter(d => d.value > 0).map((entry) => (
                  <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-3 p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <h3 className="section-title mb-5 flex items-center gap-1">{t("domainWiseDelayBurden")}<InfoLabel text="Number of children with delays in developmental domains: Gross Motor, Fine Motor, Language, Cognitive and Social Emotional." /></h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={domainDelays} barCategoryGap="25%">
              <defs>
                <linearGradient id="riskBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--risk-bar))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--risk-bar))" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="domain" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={40} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.5)" }} />
              <Bar dataKey="count" fill="url(#riskBarGrad)" radius={[6, 6, 0, 0]} name="Children with Delay" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Neuro Behavioral Risk Indicators */}
      <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "550ms" }}>
        <h3 className="section-title mb-5 flex items-center gap-1">{t("neuroBehavioralRiskIndicators")}<InfoLabel text="Counts of children flagged for Autism Risk, Behavioral Concerns, and Attention Issues from the Neuro_Behavioral sheet." /></h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={neuroBehavioralData} barCategoryGap="25%">
            <defs>
              <linearGradient id="neuroBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-accent))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--chart-accent))" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="indicator" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={40} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.5)" }} />
            <Bar dataKey="count" fill="url(#neuroBarGrad)" radius={[6, 6, 0, 0]} name="Children" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "600ms" }}>
          <h3 className="section-title mb-5 flex items-center gap-1">{t("delaySeverityBreakdown")}<InfoLabel text="Number of children grouped by total developmental delays (0 to 4+)." /></h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={delaySeverity.filter(d => d.count > 0)} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={isMobile ? 65 : 80} innerRadius={isMobile ? 25 : 35} label={renderSmartLabel(isMobile)} labelLine={false} strokeWidth={2} stroke="hsl(var(--card))">
                {delaySeverity.filter(d => d.count > 0).map((entry) => {
                  const origIndex = delaySeverity.findIndex(d => d.label === entry.label);
                  return <Cell key={entry.label} fill={SEVERITY_COLORS[origIndex % SEVERITY_COLORS.length]} />;
                })}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <AgeBandRiskChart />
      </div>
    </div>
  );
};

export default RiskStratificationDashboard;
