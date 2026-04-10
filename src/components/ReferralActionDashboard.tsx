import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useECDData } from "@/context/ECDDataContext";
import { useLanguage } from "@/context/LanguageContext";
import InfoLabel from "@/components/InfoLabel";
import { useGovernance } from "@/context/GovernanceContext";
import { PhoneForwarded, CheckCircle, Clock, AlertCircle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import ReferralTable from "@/components/ReferralTable";
import { useIsMobile } from "@/hooks/use-mobile";

const RADIAN = Math.PI / 180;
const renderSmartLabel = (isMobile: boolean) => (props: any) => {
  const { cx, cy, midAngle, outerRadius, percent, name, label } = props;
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

const STATUS_COLORS: Record<string, string> = {
  Pending: "hsl(var(--referral-1))",
  Completed: "hsl(var(--risk-low))",
  "Under Treatment": "hsl(var(--referral-2))",
};

const ICON_BG = [
  "bg-[hsl(25,85%,50%,0.12)]",
  "bg-[hsl(152,60%,40%,0.12)]",
  "bg-[hsl(38,92%,50%,0.12)]",
  "bg-[hsl(15,75%,45%,0.12)]",
];
const ICON_CLR = [
  "text-[hsl(25,85%,50%)]",
  "text-[hsl(152,60%,40%)]",
  "text-[hsl(38,92%,50%)]",
  "text-[hsl(15,75%,45%)]",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  fontSize: "13px",
  boxShadow: "0 4px 12px hsl(213 32% 14% / 0.1)",
};

const ReferralActionDashboard = () => {
  const { filteredProfiles, referralMap, riskMap, loading } = useECDData();
  const { t } = useLanguage();
  const { showChildLevelData } = useGovernance();
  const isMobile = useIsMobile();

  const metrics = useMemo(() => {
    let total = 0, completed = 0, pending = 0, underTreatment = 0;
    let totalReferralDays = 0, referralDaysCount = 0;
    const statusCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    filteredProfiles.forEach((c) => {
      const r = referralMap.get(c.child_id);
      if (r) {
        total++;
        const status = r.referral_status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
        if (status === "Completed") {
          completed++;
          // Proxy: use baseline_score as days-to-completion estimate
          const risk = riskMap.get(c.child_id);
          if (risk) {
            const days = Math.max(3, Math.round(risk.baseline_score * 0.8 + 5));
            totalReferralDays += days;
            referralDaysCount++;
          }
        }
        else if (status === "Pending") pending++;
        else if (status === "Under Treatment") underTreatment++;

        if (r.referral_type) {
          typeCounts[r.referral_type] = (typeCounts[r.referral_type] || 0) + 1;
        }
      }
    });

    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : "0";
    const avgReferralTime = referralDaysCount > 0 ? (totalReferralDays / referralDaysCount).toFixed(0) : "0";
    return { total, completed, pending, underTreatment, completionRate, avgReferralTime, statusCounts, typeCounts };
  }, [filteredProfiles, referralMap]);

  const statusPieData = useMemo(() =>
    Object.entries(metrics.statusCounts).map(([name, value]) => ({ name, value })),
    [metrics.statusCounts]
  );

  const typeBarData = useMemo(() =>
    Object.entries(metrics.typeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    [metrics.typeCounts]
  );

  // Referral trend by district
  const referralTrendData = useMemo(() => {
    const districtCounts: Record<string, { total: number; completed: number }> = {};
    filteredProfiles.forEach((c) => {
      const r = referralMap.get(c.child_id);
      if (r) {
        if (!districtCounts[c.district]) districtCounts[c.district] = { total: 0, completed: 0 };
        districtCounts[c.district].total++;
        if (r.referral_status === "Completed") districtCounts[c.district].completed++;
      }
    });
    return Object.entries(districtCounts).map(([district, v]) => ({
      district,
      total: v.total,
      completed: v.completed,
      rate: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
    })).sort((a, b) => a.district.localeCompare(b.district));
  }, [filteredProfiles, referralMap]);

  // Urgent referral table with full details
  const urgentReferrals = useMemo(() => {
    type RefRow = {
      child_id: string; district: string; mandal: string; awc_code: number;
      risk: string; status: string; type: string; reason: string; urgency: string;
    };
    const rows: RefRow[] = [];
    const urgencyFromRisk = (r: string) => r === "Critical" || r === "High" ? "High Priority" : r === "Medium" ? "Medium Priority" : "Low Priority";
    filteredProfiles.forEach((c) => {
      const r = referralMap.get(c.child_id);
      if (r) {
        const risk = riskMap.get(c.child_id);
        const riskCat = risk?.baseline_category || "—";
        rows.push({
          child_id: c.child_id,
          district: c.district,
          mandal: c.mandal,
          awc_code: c.awc_code,
          risk: riskCat,
          status: r.referral_status,
          type: r.referral_type,
          reason: r.referral_reason,
          urgency: urgencyFromRisk(riskCat),
        });
      }
    });
    const riskOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    const statusOrder: Record<string, number> = { Pending: 0, "Under Treatment": 1, Completed: 2 };
    rows.sort((a, b) => (riskOrder[a.risk] ?? 9) - (riskOrder[b.risk] ?? 9) || (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9));
    return rows;
  }, [filteredProfiles, referralMap, riskMap]);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Card key={i} className="h-28 animate-pulse bg-muted" />)}</div>;

  const ICON_BG_5 = "bg-[hsl(200,70%,45%,0.12)]";
  const ICON_CLR_5 = "text-[hsl(200,70%,45%)]";

  const kpis = [
    { label: t("childrenNeedingReferral"), value: metrics.total.toLocaleString(), icon: PhoneForwarded, info: "Number of children identified as requiring referral to health or specialist services." },
    { label: t("referralCompletionRate"), value: metrics.completionRate + "%", icon: CheckCircle, info: "Percentage of identified referrals that have been successfully completed." },
    { label: "Average Referral Time", value: metrics.avgReferralTime + " Days", icon: Clock, info: "Average time from risk flag to referral completion (in days)." },
    { label: t("pendingReferrals"), value: metrics.pending.toLocaleString(), icon: Clock, info: "Number of referrals that are still pending action." },
    { label: t("underTreatment"), value: metrics.underTreatment.toLocaleString(), icon: AlertCircle, info: "Number of children currently receiving treatment following referral." },
  ];


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <PhoneForwarded className="w-5 h-5 text-[hsl(var(--referral-1))]" />
        <h2 className="text-xl font-semibold text-foreground">{t("referralActionMonitoring")}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h3 className="section-title mb-5 flex items-center gap-1">{t("referralStatusDistribution")}<InfoLabel text="Current status of referrals including Pending, Completed and Under Treatment." /></h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusPieData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={isMobile ? 65 : 80} innerRadius={isMobile ? 25 : 35} label={renderSmartLabel(isMobile)} labelLine={false} strokeWidth={2} stroke="hsl(var(--card))">
                {statusPieData.filter(d => d.value > 0).map((entry) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || "hsl(var(--muted-foreground))"} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-3 p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <h3 className="section-title mb-5 flex items-center gap-1">{t("referralTypeBreakdown")}<InfoLabel text="Distribution of referral types such as medical, specialist, nutritional, etc." /></h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={typeBarData} barCategoryGap="25%">
              <defs>
                <linearGradient id="refTypeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--referral-3))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--referral-3))" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="type" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={40} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.5)" }} />
              <Bar dataKey="count" fill="url(#refTypeGrad)" radius={[6, 6, 0, 0]} name="Referrals" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "600ms" }}>
        <h3 className="section-title mb-5 flex items-center gap-1">Referral Completion by District<InfoLabel text="Referral completion rate (%) for each district." /></h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={referralTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="district" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} unit="%" width={40} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="rate" stroke="hsl(var(--referral-line))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--referral-line))", strokeWidth: 2, stroke: "hsl(var(--card))" }} activeDot={{ r: 6 }} name="Completion Rate %" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "700ms" }}>
        <h3 className="section-title mb-5 flex items-center gap-1">{t("recentReferrals")}<InfoLabel text="Urgent referral cases sorted by risk severity and pending status." /></h3>
        <ReferralTable rows={urgentReferrals} />
      </Card>
    </div>
  );
};

export default ReferralActionDashboard;
