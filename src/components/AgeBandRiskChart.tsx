import { Card } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { useECDData } from "@/context/ECDDataContext";
import { useLanguage } from "@/context/LanguageContext";
import InfoLabel from "@/components/InfoLabel";
import { useMemo } from "react";

const ageBands = [
  { label: "0-12m", min: 0, max: 12 },
  { label: "13-24m", min: 13, max: 24 },
  { label: "25-36m", min: 25, max: 36 },
  { label: "37-48m", min: 37, max: 48 },
  { label: "49-60m", min: 49, max: 60 },
  { label: "61-72m", min: 61, max: 72 },
];

const AgeBandRiskChart = () => {
  const { filteredProfiles, riskMap, loading } = useECDData();
  const { t } = useLanguage();

  const data = useMemo(() => {
    return ageBands.map((band) => {
      const children = filteredProfiles.filter(
        (c) => c.age_months >= band.min && c.age_months <= band.max
      );
      let Low = 0, Medium = 0, High = 0;
      children.forEach((c) => {
        const risk = riskMap.get(c.child_id);
        if (risk) {
          if (risk.baseline_category === "Low") Low++;
          else if (risk.baseline_category === "Medium") Medium++;
          else if (risk.baseline_category === "High") High++;
        }
      });
      return { age: band.label, Low, Medium, High };
    });
  }, [filteredProfiles, riskMap]);

  if (loading) return <Card className="p-5 h-[340px] animate-pulse bg-muted" />;

  return (
    <Card className="p-3 sm:p-5 animate-fade-in" style={{ animationDelay: "320ms" }}>
      <h3 className="section-title mb-4 flex items-center">{t("ageBandRiskDistribution")}<InfoLabel text="Distribution of developmental risk across different age groups (0–72 months)." /></h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="age" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={35} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          />
          <Legend iconType="square" wrapperStyle={{ fontSize: "11px" }} />
          <Bar dataKey="Low" stackId="a" fill="hsl(var(--risk-low))" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Medium" stackId="a" fill="hsl(var(--risk-medium))" />
          <Bar dataKey="High" stackId="a" fill="hsl(var(--risk-high))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default AgeBandRiskChart;
