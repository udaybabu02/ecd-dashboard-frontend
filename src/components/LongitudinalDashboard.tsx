import { useMemo, useState } from "react";
import { Calendar, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useECDData } from "@/context/ECDDataContext";
import { useLanguage } from "@/context/LanguageContext";
import InfoLabel from "@/components/InfoLabel";
import { TrendingUp, TrendingDown, ArrowRightCircle, CheckCircle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import type { ChildProfile, OutcomesImpact, DevelopmentalRisk } from "@/lib/dataLoader";

const DOMAIN_LABELS = ["GM", "FM", "LC", "COG", "SE"];
const DOMAIN_COLORS = ["hsl(var(--longitudinal-1))", "hsl(var(--longitudinal-3))", "hsl(var(--risk-medium))", "hsl(var(--workforce-1))", "hsl(var(--chart-accent))"];

const domainTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  fontSize: "13px",
  boxShadow: "0 4px 12px hsl(213 32% 14% / 0.1)",
};

const DomainImprovementChart = ({ filteredProfiles, outcomesMap, devRiskMap }: {
  filteredProfiles: ChildProfile[];
  outcomesMap: Map<string, OutcomesImpact>;
  devRiskMap: Map<string, DevelopmentalRisk>;
}) => {
  const domainRates = useMemo(() => {
    const domainKeys = ["GM_delay", "FM_delay", "LC_delay", "COG_delay", "SE_delay"] as const;
    return DOMAIN_LABELS.map((label, i) => {
      let total = 0, improved = 0;
      filteredProfiles.forEach((c) => {
        const dev = devRiskMap.get(c.child_id);
        if (dev && Number(dev[domainKeys[i]]) > 0) {
          total++;
          const o = outcomesMap.get(c.child_id);
          if (o && o.domain_improvement === "Yes") improved++;
        }
      });
      return { domain: label, rate: total > 0 ? Math.round((improved / total) * 100) : 0 };
    });
  }, [filteredProfiles, outcomesMap, devRiskMap]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={domainRates} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="domain" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" width={40} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={domainTooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.5)" }} />
        <Bar dataKey="rate" radius={[6, 6, 0, 0]} name="Improvement Rate %">
          {domainRates.map((_, i) => (
            <Cell key={i} fill={DOMAIN_COLORS[i]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

const ICON_BG = [
  "bg-[hsl(160,65%,40%,0.12)]",
  "bg-[hsl(0,72%,51%,0.12)]",
  "bg-[hsl(175,60%,45%,0.12)]",
  "bg-[hsl(145,55%,35%,0.12)]",
];
const ICON_CLR = [
  "text-[hsl(160,65%,40%)]",
  "text-[hsl(0,72%,51%)]",
  "text-[hsl(175,60%,45%)]",
  "text-[hsl(145,55%,35%)]",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  fontSize: "13px",
  boxShadow: "0 4px 12px hsl(213 32% 14% / 0.1)",
};

const YEAR_OPTIONS = [
  { label: "All Years", min: 0, max: 72 },
  { label: "1st Year", min: 0, max: 12 },
  { label: "2nd Year", min: 13, max: 24 },
  { label: "3rd Year", min: 25, max: 36 },
  { label: "4th Year", min: 37, max: 48 },
  { label: "5th Year", min: 49, max: 60 },
  { label: "6th Year", min: 61, max: 72 },
];

export const getYearLabel = (ageMonths: number): string => {
  if (ageMonths <= 12) return "1st Year";
  if (ageMonths <= 24) return "2nd Year";
  if (ageMonths <= 36) return "3rd Year";
  if (ageMonths <= 48) return "4th Year";
  if (ageMonths <= 60) return "5th Year";
  return "6th Year";
};

export const formatAgeDisplay = (ageMonths: number): string => {
  return `${getYearLabel(ageMonths)} (${ageMonths} Months)`;
};

const LongitudinalDashboard = () => {
  const { filteredProfiles, outcomesMap, followUpMap, riskMap, devRiskMap, loading } = useECDData();
  const { t } = useLanguage();
  const [selectedYear, setSelectedYear] = useState(0);

  // Apply year filter on top of location-filtered profiles
  const ageFilteredProfiles = useMemo(() => {
    if (selectedYear === 0) return filteredProfiles;
    const opt = YEAR_OPTIONS[selectedYear];
    return filteredProfiles.filter(c => c.age_months >= opt.min && c.age_months <= opt.max);
  }, [filteredProfiles, selectedYear]);

  // Core metrics - now uses ageFilteredProfiles
  const metrics = useMemo(() => {
    let improving = 0, worsening = 0, stable = 0;
    let totalReduction = 0, reductionCount = 0;
    let highRiskBaseline = 0, exitedHighRisk = 0;
    let followUpConducted = 0, followUpTotal = 0;
    let domainImprovementYes = 0, domainImprovementNo = 0;

    ageFilteredProfiles.forEach((c) => {
      const fu = followUpMap.get(c.child_id);
      if (fu) {
        followUpTotal++;
        if (fu.improvement_status === "Improved") improving++;
        else if (fu.improvement_status === "Worsened") worsening++;
        else if (fu.improvement_status === "Same") stable++;
        if (fu.followup_conducted === "Yes") followUpConducted++;
      }

      const o = outcomesMap.get(c.child_id);
      if (o) {
        const reduction = Number(o.reduction_in_delay_months) || 0;
        totalReduction += reduction;
        reductionCount++;
        if (o.domain_improvement === "Yes") domainImprovementYes++;
        else domainImprovementNo++;
        const risk = riskMap.get(c.child_id);
        if (risk && risk.baseline_category === "High") {
          highRiskBaseline++;
          if (o.exit_high_risk === "Yes") exitedHighRisk++;
        }
      }
    });

    const avgReduction = reductionCount > 0 ? (totalReduction / reductionCount).toFixed(1) : "0";
    const complianceRate = followUpTotal > 0 ? ((followUpConducted / followUpTotal) * 100).toFixed(1) : "0";
    const exitRate = highRiskBaseline > 0 ? ((exitedHighRisk / highRiskBaseline) * 100).toFixed(1) : "0";

    return { improving, worsening, stable, avgReduction, exitedHighRisk, exitRate, highRiskBaseline, complianceRate, domainImprovementYes, domainImprovementNo, followUpConducted, followUpTotal };
  }, [ageFilteredProfiles, outcomesMap, followUpMap, riskMap]);

  const trendPie = useMemo(() => [
    { name: t("improvingChildren"), value: metrics.improving },
    { name: "Stable", value: metrics.stable },
    { name: t("worseningChildren"), value: metrics.worsening },
  ], [metrics, t]);

  const timeGroupedTrend = useMemo(() => {
    const groups: Record<string, { improving: number; stable: number; worsening: number }> = {};
    ageFilteredProfiles.forEach((c) => {
      const fu = followUpMap.get(c.child_id);
      if (!fu) return;
      const key = c.assessment_cycle || "Unknown";
      if (!groups[key]) groups[key] = { improving: 0, stable: 0, worsening: 0 };
      if (fu.improvement_status === "Improved") groups[key].improving++;
      else if (fu.improvement_status === "Worsened") groups[key].worsening++;
      else if (fu.improvement_status === "Same") groups[key].stable++;
    });
    const order = ["Baseline", "Follow-up", "Re-screen"];
    return Object.entries(groups)
      .map(([period, v]) => ({ period, ...v }))
      .sort((a, b) => {
        const ai = order.indexOf(a.period);
        const bi = order.indexOf(b.period);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
  }, [ageFilteredProfiles, followUpMap]);

  const improvementStatus = useMemo(() => {
    const counts: Record<string, number> = { Improved: 0, Same: 0, Worsened: 0 };
    ageFilteredProfiles.forEach((c) => {
      const fu = followUpMap.get(c.child_id);
      if (fu && fu.improvement_status && counts[fu.improvement_status] !== undefined) {
        counts[fu.improvement_status]++;
      }
    });
    return Object.entries(counts).map(([label, count]) => ({ label, count }));
  }, [ageFilteredProfiles, followUpMap]);

  const progressByDistrict = useMemo(() => {
    const data: Record<string, { improving: number; worsening: number; total: number }> = {};
    ageFilteredProfiles.forEach((c) => {
      const fu = followUpMap.get(c.child_id);
      if (fu) {
        if (!data[c.district]) data[c.district] = { improving: 0, worsening: 0, total: 0 };
        data[c.district].total++;
        if (fu.improvement_status === "Improved") data[c.district].improving++;
        else if (fu.improvement_status === "Worsened") data[c.district].worsening++;
      }
    });
    return Object.entries(data).map(([district, v]) => ({
      district,
      improvingPct: v.total > 0 ? Math.round((v.improving / v.total) * 100) : 0,
      worseningPct: v.total > 0 ? Math.round((v.worsening / v.total) * 100) : 0,
    })).sort((a, b) => a.district.localeCompare(b.district));
  }, [ageFilteredProfiles, followUpMap]);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Card key={i} className="h-28 animate-pulse bg-muted" />)}</div>;

  const TREND_COLORS = ["hsl(var(--longitudinal-1))", "hsl(var(--longitudinal-3))", "hsl(var(--risk-high))"];

  const kpis = [
    { label: t("improvingChildren"), value: metrics.improving.toLocaleString(), icon: TrendingUp, info: "Children with improvement_status = 'Improved' in Intervention_FollowUp." },
    { label: t("worseningChildren"), value: metrics.worsening.toLocaleString(), icon: TrendingDown, info: "Children with improvement_status = 'Worsened' in Intervention_FollowUp." },
    { label: t("exitedHighRisk"), value: `${metrics.exitedHighRisk} (${metrics.exitRate}%)`, icon: ArrowRightCircle, info: "Children with baseline_category = High AND exit_high_risk = Yes in Outcomes_Impact." },
    { label: t("followUpCompliance"), value: metrics.complianceRate + "%", icon: CheckCircle, info: "Percentage of children with followup_conducted = Yes." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[hsl(var(--longitudinal-1))]" />
          <h2 className="text-xl font-semibold text-foreground">{t("longitudinalDashboard")}</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-xs font-medium bg-muted border border-border rounded-md px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {YEAR_OPTIONS.map((opt, i) => (
              <option key={i} value={i}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/60 border border-border/50 text-xs text-muted-foreground leading-relaxed">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
        <span>
          <strong className="text-foreground">Year Filter:</strong> Shows child development progress by age group (0–72 months from Registration dataset). 1st Year = 0–12m · 2nd Year = 13–24m · 3rd Year = 25–36m · 4th Year = 37–48m · 5th Year = 49–60m · 6th Year = 61–72m
        </span>
      </div>

      {/* Year filter info badge */}
      {selectedYear > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-medium">
            {YEAR_OPTIONS[selectedYear].label}: {YEAR_OPTIONS[selectedYear].min}–{YEAR_OPTIONS[selectedYear].max} months
          </span>
          <span>{ageFilteredProfiles.length.toLocaleString()} children</span>
        </div>
      )}

      <>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="p-4 sm:p-5 flex justify-between items-start animate-fade-in group cursor-default" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="space-y-1">
              <p className="kpi-label flex items-center gap-1">{kpi.label}<InfoLabel text={kpi.info} /></p>
              <p className="kpi-value">{kpi.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${ICON_BG[i]} transition-transform duration-300 group-hover:scale-110`}>
              <kpi.icon className={`w-5 h-5 ${ICON_CLR[i]}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Improvement status bar chart from dataset */}
      <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "400ms" }}>
        <h3 className="section-title mb-5 flex items-center gap-1">
          Improving vs Stable vs Worsening (by Assessment Cycle)
          <InfoLabel text="Children grouped by improvement_status from Intervention_FollowUp, broken down by assessment cycle." />
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={timeGroupedTrend} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={40} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.5)" }} />
            <Bar dataKey="improving" fill="hsl(var(--longitudinal-1))" radius={[4, 4, 0, 0]} name="Improved" />
            <Bar dataKey="stable" fill="hsl(var(--longitudinal-3))" radius={[4, 4, 0, 0]} name="Same" />
            <Bar dataKey="worsening" fill="hsl(var(--risk-high))" radius={[4, 4, 0, 0]} name="Worsened" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <h3 className="section-title mb-5 flex items-center gap-1">{t("developmentTrend")}<InfoLabel text="Overall distribution: Improved, Same, Worsened children from dataset." /></h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={trendPie.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={35} label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''} labelLine={true} strokeWidth={2} stroke="hsl(var(--card))">
                {trendPie.filter(d => d.value > 0).map((entry) => {
                  const origIndex = trendPie.findIndex(d => d.name === entry.name);
                  return <Cell key={entry.name} fill={TREND_COLORS[origIndex]} />;
                })}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-3 p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "600ms" }}>
          <h3 className="section-title mb-5 flex items-center gap-1">{t("improvementStatusDistribution")}<InfoLabel text="Improved / Same / Worsened counts directly from Intervention_FollowUp." /></h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={improvementStatus} barCategoryGap="30%">
              <defs>
                <linearGradient id="impStatusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--longitudinal-3))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--longitudinal-3))" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={40} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.5)" }} />
              <Bar dataKey="count" fill="url(#impStatusGrad)" radius={[6, 6, 0, 0]} name={t("children")} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "700ms" }}>
        <h3 className="section-title mb-5 flex items-center gap-1">Progress Trend by District<InfoLabel text="District-wise comparison of Improved vs Worsened children (% of total)." /></h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={progressByDistrict}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="district" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" width={40} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="improvingPct" stroke="hsl(var(--longitudinal-1))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--longitudinal-1))", strokeWidth: 2, stroke: "hsl(var(--card))" }} activeDot={{ r: 6 }} name="Improved %" />
            <Line type="monotone" dataKey="worseningPct" stroke="hsl(var(--risk-high))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--risk-high))", strokeWidth: 2, stroke: "hsl(var(--card))" }} activeDot={{ r: 6 }} name="Worsened %" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Domain-wise Improvement Rates */}
      <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "800ms" }}>
        <h3 className="section-title mb-5 flex items-center gap-1">Domain-wise Improvement Rates<InfoLabel text="Percentage of children showing improvement in each developmental domain (GM, FM, LC, COG, SE) from Outcomes_Impact." /></h3>
        <DomainImprovementChart filteredProfiles={ageFilteredProfiles} outcomesMap={outcomesMap} devRiskMap={devRiskMap} />
      </Card>

      {/* Intervention Effectiveness Indicators */}
      <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "900ms" }}>
        <h3 className="section-title mb-5 flex items-center gap-1">Intervention Effectiveness<InfoLabel text="Key indicators measuring the effectiveness of interventions." /></h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 rounded-xl bg-muted/50 border border-border/50">
            <span className="text-2xl font-bold text-foreground">{metrics.avgReduction} {t("months")}</span>
            <span className="text-xs text-muted-foreground mt-1">Average Delay Reduction</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-muted/50 border border-border/50">
            <span className="text-2xl font-bold text-foreground">{metrics.improving > 0 && metrics.followUpTotal > 0 ? ((metrics.improving / metrics.followUpTotal) * 100).toFixed(1) : "0"}%</span>
            <span className="text-xs text-muted-foreground mt-1">Improvement Rate</span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-xl bg-muted/50 border border-border/50">
            <span className="text-2xl font-bold text-foreground">{metrics.complianceRate}%</span>
            <span className="text-xs text-muted-foreground mt-1">Follow-up Success Rate</span>
          </div>
        </div>
      </Card>

      {/* Reduction in Delay Months */}
      <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "1000ms" }}>
        <h3 className="section-title mb-5 flex items-center gap-1">Reduction in Delay Months<InfoLabel text="Average months of delay reduction comparing baseline to latest follow-up assessment." /></h3>
        <div className="flex items-center justify-center p-6">
          <div className="text-center">
            <span className="text-4xl font-bold text-foreground">{metrics.avgReduction}</span>
            <span className="text-lg text-muted-foreground ml-2">{t("months")}</span>
            <p className="text-xs text-muted-foreground mt-2">Average reduction across {ageFilteredProfiles.length.toLocaleString()} children</p>
          </div>
        </div>
      </Card>

      <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "1100ms" }}>
        <h3 className="section-title mb-5 flex items-center gap-1">{t("keyOutcomesSummary")}<InfoLabel text="Summary of key longitudinal metrics from the dataset." /></h3>
        <div className="space-y-3 mt-4">
          {[
            { label: t("avgDelayReduction"), value: `${metrics.avgReduction} ${t("months")}`, info: "Average reduction_in_delay_months from Outcomes_Impact." },
            { label: t("followUpsConducted"), value: `${metrics.followUpConducted} / ${metrics.followUpTotal}` },
            { label: t("exitedHighRisk"), value: `${metrics.exitedHighRisk} / ${metrics.highRiskBaseline}`, info: `${metrics.exitRate}% exit rate` },
            { label: t("improvingVsWorsening"), value: `${metrics.improving} : ${metrics.worsening}` },
            { label: "Domain Improvement (Yes)", value: `${metrics.domainImprovementYes}`, info: "Children with domain_improvement = Yes in Outcomes_Impact." },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center p-3.5 rounded-xl bg-muted/50 border border-border/50 transition-colors hover:bg-muted/80">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                {item.label}
                {item.info && <InfoLabel text={item.info} />}
              </span>
              <span className="text-lg font-bold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </Card>
      </>
    </div>
  );
};

export default LongitudinalDashboard;
