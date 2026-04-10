import { Card } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useECDData } from "@/context/ECDDataContext";
import { useLanguage } from "@/context/LanguageContext";
import InfoLabel from "@/components/InfoLabel";
import { useMemo } from "react";

const CYCLE_COLORS = [
  "hsl(var(--screening-1))",
  "hsl(var(--screening-2))",
  "hsl(var(--screening-3))",
];

const AssessmentCycleChart = () => {
  const { filteredProfiles, loading } = useECDData();
  const { t } = useLanguage();

  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredProfiles.forEach((c) => {
      counts[c.assessment_cycle] = (counts[c.assessment_cycle] || 0) + 1;
    });
    return ["Baseline", "Follow-up", "Re-screen"]
      .filter((cycle) => counts[cycle])
      .map((cycle) => ({ cycle, count: counts[cycle] || 0 }));
  }, [filteredProfiles]);

  if (loading) return <Card className="p-5 h-[340px] animate-pulse bg-muted" />;

  return (
    <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <h3 className="section-title mb-5 flex items-center gap-1">{t("screeningByAssessmentCycle")}<InfoLabel text="Breakdown of children screened by assessment cycle: Baseline, Follow-up, and Re-screen." /></h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barCategoryGap="30%">
          <defs>
            {CYCLE_COLORS.map((color, i) => (
              <linearGradient key={i} id={`cycleGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="cycle" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={40} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "10px",
              fontSize: "13px",
              boxShadow: "0 4px 12px hsl(213 32% 14% / 0.1)",
            }}
            cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} name={t("screened")}>
            {data.map((_, i) => (
              <Cell key={i} fill={`url(#cycleGrad${i % CYCLE_COLORS.length})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default AssessmentCycleChart;
