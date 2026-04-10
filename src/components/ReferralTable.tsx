import { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface RefRow {
  child_id: string;
  district: string;
  mandal: string;
  awc_code: number;
  risk: string;
  status: string;
  type: string;
  reason: string;
  urgency: string;
}

interface ReferralTableProps {
  rows: RefRow[];
}

const ALL = "__all__";

const ReferralTable = ({ rows }: ReferralTableProps) => {
  const { t } = useLanguage();

  const [tableFilters, setTableFilters] = useState<Record<string, string>>({
    district: ALL,
    mandal: ALL,
    awc_code: ALL,
    risk: ALL,
    type: ALL,
    reason: ALL,
    urgency: ALL,
    status: ALL,
  });

  const uniqueValues = useMemo(() => {
    const cols = ["district", "mandal", "awc_code", "risk", "type", "reason", "urgency", "status"] as const;
    const result: Record<string, string[]> = {};
    cols.forEach((col) => {
      result[col] = [...new Set(rows.map((r) => String(r[col])))].sort();
    });
    return result;
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      return (
        (tableFilters.district === ALL || r.district === tableFilters.district) &&
        (tableFilters.mandal === ALL || r.mandal === tableFilters.mandal) &&
        (tableFilters.awc_code === ALL || String(r.awc_code) === tableFilters.awc_code) &&
        (tableFilters.risk === ALL || r.risk === tableFilters.risk) &&
        (tableFilters.type === ALL || r.type === tableFilters.type) &&
        (tableFilters.reason === ALL || r.reason === tableFilters.reason) &&
        (tableFilters.urgency === ALL || r.urgency === tableFilters.urgency) &&
        (tableFilters.status === ALL || r.status === tableFilters.status)
      );
    });
  }, [rows, tableFilters]);

  const hasActiveTableFilters = Object.values(tableFilters).some((v) => v !== ALL);

  const clearTableFilters = () => {
    setTableFilters({
      district: ALL, mandal: ALL, awc_code: ALL, risk: ALL,
      type: ALL, reason: ALL, urgency: ALL, status: ALL,
    });
  };

  const statusColor = (s: string) =>
    s === "Completed" ? "text-success" : s === "Pending" ? "text-warning" : "text-primary";
  const riskColor = (r: string) =>
    r === "High" || r === "Critical" ? "text-destructive" : r === "Medium" ? "text-warning" : "text-success";

  const filterSelect = (key: string, label: string) => (
    <Select value={tableFilters[key]} onValueChange={(v) => setTableFilters((f) => ({ ...f, [key]: v }))}>
      <SelectTrigger className="h-7 text-[10px] border-border/50 bg-background min-w-[70px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL} className="text-xs">All</SelectItem>
        {uniqueValues[key]?.map((v) => (
          <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          <span>{filteredRows.length} of {rows.length} referrals</span>
        </div>
        {hasActiveTableFilters && (
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-destructive hover:text-destructive" onClick={clearTableFilters}>
            <X className="w-3 h-3" /> Clear Filters
          </Button>
        )}
      </div>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs">{t("childId")}</th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs">{t("district")}</th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs">{t("mandal")}</th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs">{t("awc")}</th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs">{t("risk")}</th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs">{t("type")}</th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs">{t("reason")}</th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs">Urgency</th>
              <th className="text-left py-2.5 px-3 text-muted-foreground font-medium text-xs">{t("status")}</th>
            </tr>
            <tr className="bg-muted/30 border-t border-border/30">
              <th className="px-2 py-1.5"></th>
              <th className="px-2 py-1.5">{filterSelect("district", t("district"))}</th>
              <th className="px-2 py-1.5">{filterSelect("mandal", t("mandal"))}</th>
              <th className="px-2 py-1.5">{filterSelect("awc_code", t("awc"))}</th>
              <th className="px-2 py-1.5">{filterSelect("risk", t("risk"))}</th>
              <th className="px-2 py-1.5">{filterSelect("type", t("type"))}</th>
              <th className="px-2 py-1.5">{filterSelect("reason", t("reason"))}</th>
              <th className="px-2 py-1.5">{filterSelect("urgency", "Urgency")}</th>
              <th className="px-2 py-1.5">{filterSelect("status", t("status"))}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-8 text-muted-foreground text-sm">No referrals match the selected filters.</td></tr>
            ) : (
              filteredRows.map((r, idx) => (
                <tr key={r.child_id} className={`border-t border-border/50 transition-colors hover:bg-muted/30 ${idx % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="py-2.5 px-3 font-mono text-xs font-medium">{r.child_id}</td>
                  <td className="py-2.5 px-3 text-xs">{r.district}</td>
                  <td className="py-2.5 px-3 text-xs">{r.mandal}</td>
                  <td className="py-2.5 px-3 text-xs">{r.awc_code}</td>
                  <td className={`py-2.5 px-3 font-semibold text-xs ${riskColor(r.risk)}`}>{r.risk}</td>
                  <td className="py-2.5 px-3 text-xs">{r.type}</td>
                  <td className="py-2.5 px-3 text-xs">{r.reason}</td>
                  <td className={`py-2.5 px-3 font-semibold text-xs ${r.urgency === "High Priority" ? "text-destructive" : r.urgency === "Medium Priority" ? "text-warning" : "text-success"}`}>{r.urgency}</td>
                  <td className={`py-2.5 px-3 font-semibold text-xs ${statusColor(r.status)}`}>{r.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReferralTable;
