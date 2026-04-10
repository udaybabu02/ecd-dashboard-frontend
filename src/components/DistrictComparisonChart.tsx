import { Card } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useECDData } from "@/context/ECDDataContext";
import { useLanguage } from "@/context/LanguageContext";
import InfoLabel from "@/components/InfoLabel";
import { useMemo } from "react";

const DistrictComparisonChart = () => {
  const { filteredProfiles, riskMap, loading } = useECDData();
  const { t } = useLanguage();

  const data = useMemo(() => {
    const districtMap: Record<string, { Screened: number; "High Risk": number; "Medium Risk": number }> = {};
    filteredProfiles.forEach((c) => {
      if (!districtMap[c.district]) {
        districtMap[c.district] = { Screened: 0, "High Risk": 0, "Medium Risk": 0 };
      }
      districtMap[c.district].Screened++;
      const risk = riskMap.get(c.child_id);
      if (risk) {
        if (risk.baseline_category === "High") districtMap[c.district]["High Risk"]++;
        else if (risk.baseline_category === "Medium") districtMap[c.district]["Medium Risk"]++;
      }
    });
    return Object.entries(districtMap)
      .map(([district, vals]) => ({ district, ...vals }))
      .sort((a, b) => a.district.localeCompare(b.district));
  }, [filteredProfiles, riskMap]);

  if (loading) return <Card className="p-5 h-[360px] animate-pulse bg-muted" />;

  return (
    <Card className="p-4 sm:p-5 animate-fade-in" style={{ animationDelay: "480ms" }}>
      <h3 className="section-title mb-5 flex items-center gap-1">{t("districtComparison")}<InfoLabel text="Comparison of screened children and risk levels across districts." /></h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barCategoryGap="20%">
          <defs>
            <linearGradient id="gradScreened" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--screening-2))" stopOpacity={0.9} />
              <stop offset="100%" stopColor="hsl(var(--screening-2))" stopOpacity={0.55} />
            </linearGradient>
            <linearGradient id="gradHighRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--risk-high))" stopOpacity={0.9} />
              <stop offset="100%" stopColor="hsl(var(--risk-high))" stopOpacity={0.55} />
            </linearGradient>
            <linearGradient id="gradMedRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--screening-3))" stopOpacity={0.9} />
              <stop offset="100%" stopColor="hsl(var(--screening-3))" stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="district" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontWeight: 500 }} axisLine={false} tickLine={false} />
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
          <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
          <Bar dataKey="Screened" fill="url(#gradScreened)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="High Risk" fill="url(#gradHighRisk)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Medium Risk" fill="url(#gradMedRisk)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default DistrictComparisonChart;
