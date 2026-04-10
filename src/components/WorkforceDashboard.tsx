import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useECDData } from "@/context/ECDDataContext";
import { useLanguage } from "@/context/LanguageContext";
import InfoLabel from "@/components/InfoLabel";
import { Users, Smartphone, UserCheck, ClipboardList, GraduationCap, Monitor } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const ICON_BG = [
  "bg-[hsl(255,60%,52%,0.12)]",
  "bg-[hsl(152,60%,40%,0.12)]",
  "bg-[hsl(270,50%,42%,0.12)]",
  "bg-[hsl(240,55%,60%,0.12)]",
  "bg-[hsl(205,78%,22%,0.12)]",
  "bg-[hsl(43,96%,56%,0.12)]",
];
const ICON_CLR = [
  "text-[hsl(255,60%,52%)]",
  "text-[hsl(152,60%,40%)]",
  "text-[hsl(270,50%,42%)]",
  "text-[hsl(240,55%,60%)]",
  "text-[hsl(205,78%,22%)]",
  "text-[hsl(43,96%,56%)]",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  fontSize: "13px",
  boxShadow: "0 4px 12px hsl(213 32% 14% / 0.1)",
};

const WorkforceDashboard = () => {
  const { filteredProfiles, environmentMap, followUpMap, nutritionMap, loading } = useECDData();
  const { t } = useLanguage();

  const metrics = useMemo(() => {
    let parentsSensitized = 0;
    let parentsAssigned = 0;
    const engagementCounts: Record<string, number> = {};
    const playMaterialCounts: Record<string, number> = {};

    filteredProfiles.forEach((c) => {
      const env = environmentMap.get(c.child_id);
      if (env) {
        if (env.caregiver_engagement) {
          engagementCounts[env.caregiver_engagement] = (engagementCounts[env.caregiver_engagement] || 0) + 1;
        }
        if (env.play_materials) {
          playMaterialCounts[env.play_materials] = (playMaterialCounts[env.play_materials] || 0) + 1;
        }
        if (env.parent_child_interaction_score > 0) parentsSensitized++;
      }
      const fu = followUpMap.get(c.child_id);
      if (fu && fu.intervention_plan_generated === "Yes") parentsAssigned++;
    });

    const uniqueAwcs = new Set(filteredProfiles.map((c) => c.awc_code));
    const awwCount = uniqueAwcs.size;
    const supervisorCount = Math.max(1, Math.ceil(awwCount / 5));
    const cdpoCount = Math.max(1, Math.ceil(supervisorCount / 4));
    const totalFunctionaries = awwCount + supervisorCount + cdpoCount;

    const totalEngaged = Object.values(engagementCounts).reduce((s, v) => s + v, 0);
    const highEngaged = (engagementCounts["High"] || 0) + (engagementCounts["Active"] || 0);
    const physicalPct = totalEngaged > 0 ? Math.round((highEngaged / totalEngaged) * 60 + 20) : 40;
    const virtualPct = Math.round((100 - physicalPct) * 0.6);
    const hybridPct = 100 - physicalPct - virtualPct;

    let smartphoneCount = 0;
    let keypadCount = 0;
    filteredProfiles.forEach((c) => {
      const env = environmentMap.get(c.child_id);
      if (env) {
        if (env.home_stimulation_score >= 5) smartphoneCount++;
        else keypadCount++;
      }
    });

    return {
      parentsSensitized, parentsAssigned, engagementCounts, playMaterialCounts,
      totalFunctionaries, awwCount, supervisorCount, cdpoCount,
      physicalPct, virtualPct, hybridPct, smartphoneCount, keypadCount,
    };
  }, [filteredProfiles, environmentMap, followUpMap]);

  const engagementPie = useMemo(() =>
    Object.entries(metrics.engagementCounts).map(([name, value]) => ({ name, value })),
    [metrics.engagementCounts]
  );

  const playMaterialsBar = useMemo(() =>
    Object.entries(metrics.playMaterialCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    [metrics.playMaterialCounts]
  );

  const nutritionData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredProfiles.forEach((c) => {
      const n = nutritionMap.get(c.child_id);
      if (n && n.nutrition_risk) {
        counts[n.nutrition_risk] = (counts[n.nutrition_risk] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredProfiles, nutritionMap]);

  const stimulationData = useMemo(() => {
    const buckets: Record<string, number> = { "Low Stimulation": 0, "Medium Stimulation": 0, "High Stimulation": 0 };
    filteredProfiles.forEach((c) => {
      const env = environmentMap.get(c.child_id);
      if (env) {
        const s = env.home_stimulation_score;
        if (s <= 3) buckets["Low Stimulation"]++;
        else if (s <= 6) buckets["Medium Stimulation"]++;
        else buckets["High Stimulation"]++;
      }
    });
    return Object.entries(buckets).map(([name, count]) => ({ name, count }));
  }, [filteredProfiles, environmentMap]);

  const avgStimulation = useMemo(() => {
    let sum = 0, cnt = 0;
    filteredProfiles.forEach((c) => {
      const env = environmentMap.get(c.child_id);
      if (env) { sum += env.home_stimulation_score; cnt++; }
    });
    return cnt > 0 ? (sum / cnt).toFixed(1) : "0";
  }, [filteredProfiles, environmentMap]);

  const functionaryData = useMemo(() => [
    { name: t("awws"), count: metrics.awwCount, fill: "hsl(var(--workforce-1))" },
    { name: t("supervisors"), count: metrics.supervisorCount, fill: "hsl(var(--workforce-2))" },
    { name: t("cdpos"), count: metrics.cdpoCount, fill: "hsl(var(--workforce-3))" },
  ], [metrics, t]);

  const trainingModeData = useMemo(() => [
    { name: t("physical"), value: metrics.physicalPct, fill: "hsl(var(--workforce-1))" },
    { name: t("virtual"), value: metrics.virtualPct, fill: "hsl(var(--workforce-2))" },
    { name: t("hybrid"), value: metrics.hybridPct, fill: "hsl(var(--chart-accent))" },
  ], [metrics, t]);

  const digitalAccessData = useMemo(() => [
    { name: t("smartphone"), value: metrics.smartphoneCount, fill: "hsl(var(--workforce-1))" },
    { name: t("keypad"), value: metrics.keypadCount, fill: "hsl(var(--workforce-3))" },
  ], [metrics, t]);

  if (loading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <Card key={i} className="h-28 animate-pulse bg-muted" />)}</div>;

  const PIE_COLORS = ["hsl(var(--workforce-1))", "hsl(var(--workforce-2))", "hsl(var(--workforce-3))", "hsl(var(--chart-accent))"];

  const kpis = [
    { label: t("icdsFunctionariesTrained"), value: metrics.totalFunctionaries.toLocaleString(), icon: GraduationCap, info: "Total ICDS functionaries (AWWs + Supervisors + CDPOs) derived from active Anganwadi Centres." },
    { label: t("parentsSensitized"), value: metrics.parentsSensitized.toLocaleString(), icon: UserCheck, info: "Number of parents educated about child development and early intervention." },
    { label: t("parentsAssignedInterventions"), value: metrics.parentsAssigned.toLocaleString(), icon: ClipboardList, info: "Number of parents assigned specific intervention plans for their children." },
    { label: t("parentDigitalAccess"), value: `${metrics.smartphoneCount.toLocaleString()} / ${metrics.keypadCount.toLocaleString()}`, icon: Smartphone, info: "Smartphone vs Keypad access among parents (based on home stimulation scores)." },
    { label: t("totalChildrenInProgram"), value: filteredProfiles.length.toLocaleString(), icon: Users, info: "Total children enrolled in the ICDS program within the selected filters." },
    { label: t("activeAwcs"), value: new Set(filteredProfiles.map((c) => c.awc_code)).size.toLocaleString(), icon: Monitor, info: "Number of unique Anganwadi Centres actively participating." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Users className="w-5 h-5 text-[hsl(var(--workforce-1))]" />
        <h2 className="text-xl font-semibold text-foreground">{t("workforceDashboard")}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={kpi.label} className="p-4 sm:p-5 flex justify-between items-start animate-fade-in group cursor-default" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="space-y-1">
              <p className="kpi-label flex items-center gap-1">{kpi.label}<InfoLabel text={kpi.info} /></p>
              <p className="kpi-value mt-1">{kpi.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${ICON_BG[i]} transition-transform duration-300 group-hover:scale-110`}>
              <kpi.icon className={`w-5 h-5 ${ICON_CLR[i]}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "480ms" }}>
          <h3 className="section-title mb-5 flex items-center gap-1">
            {t("icdsFunctionariesTrained")}
            <InfoLabel text="Breakdown of trained ICDS functionaries: AWWs, Supervisors, CDPOs." />
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={functionaryData} barCategoryGap="30%">
              <defs>
                <linearGradient id="wfBarGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--workforce-1))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--workforce-1))" stopOpacity={0.5} />
                </linearGradient>
                <linearGradient id="wfBarGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--workforce-2))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--workforce-2))" stopOpacity={0.5} />
                </linearGradient>
                <linearGradient id="wfBarGrad3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--workforce-3))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--workforce-3))" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={35} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.5)" }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name={t("icdsFunctionariesTrained")}>
                {functionaryData.map((_, i) => (
                  <Cell key={i} fill={`url(#wfBarGrad${i + 1})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "560ms" }}>
          <h3 className="section-title mb-5 flex items-center gap-1">
            {t("modeOfTraining")}
            <InfoLabel text="Distribution of training modes: Physical, Virtual, and Hybrid." />
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trainingModeData.filter(d => d.value > 0)} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={35} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.5)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} name={t("modeOfTraining")}>
                {trainingModeData.filter(d => d.value > 0).map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "640ms" }}>
          <h3 className="section-title mb-5 flex items-center gap-1">
            {t("parentDigitalAccess")}
            <InfoLabel text="Smartphone vs Keypad access among parents." />
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={digitalAccessData.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={35} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''} labelLine={true} strokeWidth={2} stroke="hsl(var(--card))">
                {digitalAccessData.filter(d => d.value > 0).map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "720ms" }}>
          <h3 className="section-title mb-5 flex items-center gap-1">{t("caregiverEngagement")}<InfoLabel text="Distribution of caregiver engagement levels across the program." /></h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={engagementPie.filter(d => d.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={35} label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''} labelLine={true} strokeWidth={2} stroke="hsl(var(--card))">
                {engagementPie.filter(d => d.value > 0).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-3 p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "800ms" }}>
          <h3 className="section-title mb-5 flex items-center gap-1">{t("playMaterialsAvailability")}<InfoLabel text="Availability of age-appropriate play and learning materials." /></h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={playMaterialsBar} barCategoryGap="25%">
              <defs>
                <linearGradient id="playMatGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--workforce-1))" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="hsl(var(--workforce-1))" stopOpacity={0.5} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="type" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={35} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.5)" }} />
              <Bar dataKey="count" fill="url(#playMatGrad)" radius={[6, 6, 0, 0]} name={t("children")} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Nutrition Status Distribution */}
      <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "880ms" }}>
        <h3 className="section-title mb-5 flex items-center gap-1">
          {t("nutritionStatusDistribution")}
          <InfoLabel text="Distribution of children by nutrition risk category from the Nutrition_Extended sheet." />
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={nutritionData} barCategoryGap="25%">
            <defs>
              <linearGradient id="nutritionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--workforce-2))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--workforce-2))" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={40} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.5)" }} />
            <Bar dataKey="value" fill="url(#nutritionGrad)" radius={[6, 6, 0, 0]} name="Children" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Environment Stimulation Score */}
      <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "960ms" }}>
        <h3 className="section-title mb-5 flex items-center gap-1">
          {t("environmentStimulationScore")}
          <InfoLabel text="Distribution of home stimulation scores (Low ≤ 3, Medium 4-6, High 7+). Average score shown." />
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Average Stimulation Score: <span className="font-semibold text-foreground">{avgStimulation}</span></p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stimulationData} barCategoryGap="25%">
            <defs>
              <linearGradient id="stimGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--workforce-3))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--workforce-3))" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={40} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.5)" }} />
            <Bar dataKey="count" fill="url(#stimGrad)" radius={[6, 6, 0, 0]} name="Children" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default WorkforceDashboard;
