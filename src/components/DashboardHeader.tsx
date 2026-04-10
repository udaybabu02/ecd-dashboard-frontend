import { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Globe, FileSpreadsheet, FileText, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useECDData } from "@/context/ECDDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { useGovernance, GOVERNANCE_ROLES } from "@/context/GovernanceContext";
import { LangCode, LANGUAGE_NAMES } from "@/lib/translations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import * as XLSX from "xlsx";

const DashboardHeader = () => {
  const navigate = useNavigate();
  const { data, filteredProfiles, riskMap, devRiskMap, referralMap, followUpMap, outcomesMap, filters, isChildInScope } = useECDData();
  const { lang, setLang, t } = useLanguage();
  const { role, showChildLevelData, logout: governanceLogout } = useGovernance();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  const searchSuggestions = useMemo(() => {
    if (!data || !searchQuery.trim()) return [];
    const query = searchQuery.trim().toLowerCase();
    return data.childProfiles
      .filter((c) => c.child_id.toLowerCase().includes(query) && isChildInScope(c.child_id))
      .slice(0, 10);
  }, [data, searchQuery, isChildInScope]);

  const handleSearchSubmit = () => {
    if (searchSuggestions.length === 1) {
      handleSelectChild(searchSuggestions[0].child_id);
    } else if (searchSuggestions.length > 1) {
      setShowSuggestions(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const handleSelectChild = (childId: string) => {
    if (!isChildInScope(childId)) return;
    setSelectedChild(childId);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExportExcel = () => {
    const rows = filteredProfiles.map((c) => {
      const risk = riskMap.get(c.child_id);
      const dev = devRiskMap.get(c.child_id);
      const ref = referralMap.get(c.child_id);
      const fu = followUpMap.get(c.child_id);
      const out = outcomesMap.get(c.child_id);
      return {
        Child_ID: c.child_id,
        District: c.district,
        Mandal: c.mandal,
        AWC: c.awc_code,
        Gender: c.gender,
        Age_Months: c.age_months,
        Risk_Category: risk?.baseline_category || "",
        Risk_Score: risk?.baseline_score || "",
        Num_Delays: dev?.num_delays || 0,
        GM_Delay: dev?.GM_delay || 0,
        FM_Delay: dev?.FM_delay || 0,
        LC_Delay: dev?.LC_delay || 0,
        COG_Delay: dev?.COG_delay || 0,
        SE_Delay: dev?.SE_delay || 0,
        Referral_Status: ref?.referral_status || "",
        Referral_Type: ref?.referral_type || "",
        FollowUp_Conducted: fu?.followup_conducted || "",
        Improvement_Status: fu?.improvement_status || "",
        Delay_Reduction: out?.reduction_in_delay_months || "",
        Exit_High_Risk: out?.exit_high_risk || "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ECD_Filtered_Data");
    const filterInfo = [
      filters.districts.length > 0 ? `Districts: ${filters.districts.join(", ")}` : "Districts: All",
      filters.mandals.length > 0 ? `Mandals: ${filters.mandals.join(", ")}` : "Mandals: All",
      filters.anganwadis.length > 0 ? `Anganwadis: ${filters.anganwadis.join(", ")}` : "Anganwadis: All",
    ];
    const filterWs = XLSX.utils.aoa_to_sheet([["Filter", "Value"], ...filterInfo.map((f) => f.split(": "))]);
    XLSX.utils.book_append_sheet(wb, filterWs, "Applied_Filters");
    XLSX.writeFile(wb, "ECD_Dashboard_Export.xlsx");
  };

  const handleExportPDF = async () => {
    const { default: html2canvas } = await import("html2canvas");
    const { jsPDF } = await import("jspdf");
    const mainEl = document.querySelector("main");
    if (!mainEl) return;
    const canvas = await html2canvas(mainEl as HTMLElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("l", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("ECD_Dashboard_Export.pdf");
  };

  const child = selectedChild ? data?.childProfiles.find((c) => c.child_id === selectedChild) : null;
  const risk = selectedChild ? riskMap.get(selectedChild) : null;
  const devRisk = selectedChild ? devRiskMap.get(selectedChild) : null;
  const referral = selectedChild ? referralMap.get(selectedChild) : null;
  const followUp = selectedChild ? followUpMap.get(selectedChild) : null;
  const outcomes = selectedChild ? outcomesMap.get(selectedChild) : null;

  return (
    <>
      <header className="bg-header text-header-foreground px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <img
            src="/logo-amaramam.png"
            alt="AmaRaMam Services Logo"
            className="h-10 w-auto shrink-0 rounded"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold leading-tight truncate">{t("appTitle")}</h1>
            <p className="text-xs text-header-foreground/70 truncate">{t("appSubtitle")}</p>
          </div>
        </div>

        {/* Mobile: search full width row */}
        <div className="w-full sm:hidden" ref={mobileSearchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-header-foreground/50 cursor-pointer" onClick={handleSearchSubmit} />
            <Input
              placeholder={t("searchPlaceholder")}
              className="pl-9 w-full h-9 bg-header-foreground/10 border-header-foreground/20 text-header-foreground placeholder:text-header-foreground/40 text-sm"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
            />
            {showSuggestions && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-[100] max-h-60 overflow-y-auto">
                {searchSuggestions.length > 0 ? searchSuggestions.map((c) => (
                  <button key={c.child_id} className="w-full text-left px-3 py-2 text-sm hover:bg-accent/20 text-foreground" onClick={() => handleSelectChild(c.child_id)}>
                    {c.child_id} <span className="text-muted-foreground text-xs">— {c.district}, {c.mandal}</span>
                  </button>
                )) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">{t("noResults") || "No matching Child_ID found"}</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto justify-end">
          {/* Desktop search */}
          <div className="relative hidden sm:block" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-header-foreground/50 cursor-pointer" onClick={handleSearchSubmit} />
            <Input
              placeholder={t("searchPlaceholder")}
              className="pl-9 w-48 lg:w-64 h-9 bg-header-foreground/10 border-header-foreground/20 text-header-foreground placeholder:text-header-foreground/40 text-sm"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
            />
            {showSuggestions && searchQuery.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-[100] max-h-60 overflow-y-auto">
                {searchSuggestions.length > 0 ? searchSuggestions.map((c) => (
                  <button key={c.child_id} className="w-full text-left px-3 py-2 text-sm hover:bg-accent/20 text-foreground" onClick={() => handleSelectChild(c.child_id)}>
                    {c.child_id} <span className="text-muted-foreground text-xs">— {c.district}, {c.mandal}</span>
                  </button>
                )) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">{t("noResults") || "No matching Child_ID found"}</div>
                )}
              </div>
            )}
          </div>

          {/* Language Selector */}
          <DropdownMenu open={langOpen} onOpenChange={setLangOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-header-foreground/80 hover:text-header-foreground hover:bg-header-foreground/10 text-xs sm:text-sm px-2 sm:px-3">
                <Globe className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">{LANGUAGE_NAMES[lang]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-80 overflow-y-auto bg-popover z-50">
              {(Object.entries(LANGUAGE_NAMES) as [LangCode, string][]).map(([code, name]) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => { setLang(code); setLangOpen(false); }}
                  className={lang === code ? "bg-accent/20 font-semibold" : ""}
                >
                  {name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>


          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-header-foreground/80 hover:text-header-foreground hover:bg-header-foreground/10 text-xs sm:text-sm px-2 sm:px-3">
                <Download className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">{t("export")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover z-50" align="end">
              <DropdownMenuItem onClick={handleExportExcel}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                {t("exportExcel")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <FileText className="w-4 h-4 mr-2" />
                {t("exportPDF")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            className="text-header-foreground/80 hover:text-header-foreground hover:bg-header-foreground/10 text-xs sm:text-sm px-2 sm:px-3"
            onClick={() => {
              governanceLogout();
              navigate("/login");
            }}
          >
            <LogOut className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <Dialog open={!!selectedChild} onOpenChange={() => setSelectedChild(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("childProfile")} — {selectedChild}</DialogTitle>
          </DialogHeader>
          {child && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">{t("district")}:</span> {child.district}</div>
                <div><span className="text-muted-foreground">{t("mandal")}:</span> {child.mandal}</div>
                <div><span className="text-muted-foreground">{t("awc")}:</span> {child.awc_code}</div>
                <div><span className="text-muted-foreground">{t("gender")}:</span> {child.gender}</div>
                <div><span className="text-muted-foreground">{t("age")}:</span> {child.age_months} {t("months")}</div>
                <div><span className="text-muted-foreground">{t("cycle")}:</span> {child.assessment_cycle}</div>
              </div>
              {risk && (
                <div className="border-t pt-2">
                  <p className="font-medium mb-1">{t("riskCategory")}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                    risk.baseline_category === "High" || risk.baseline_category === "Critical" ? "bg-destructive/10 text-destructive" :
                    risk.baseline_category === "Medium" ? "bg-warning/10 text-warning" :
                    "bg-success/10 text-success"
                  }`}>{risk.baseline_category} (Score: {risk.baseline_score})</span>
                </div>
              )}
              {devRisk && (
                <div className="border-t pt-2">
                  <p className="font-medium mb-1">{t("domainDelays")} ({devRisk.num_delays})</p>
                  <div className="flex gap-2 flex-wrap">
                    {["GM", "FM", "LC", "COG", "SE"].map((d) => (
                      <span key={d} className={`px-2 py-0.5 rounded text-xs ${
                        devRisk[`${d}_delay` as keyof typeof devRisk] ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                      }`}>{d}: {devRisk[`${d}_delay` as keyof typeof devRisk] ? "Delayed" : "OK"}</span>
                    ))}
                  </div>
                </div>
              )}
              {referral && (
                <div className="border-t pt-2">
                  <p className="font-medium mb-1">{t("referral")}</p>
                  <div className="grid grid-cols-2 gap-1">
                    <div><span className="text-muted-foreground">{t("status")}:</span> {referral.referral_status}</div>
                    <div><span className="text-muted-foreground">{t("type")}:</span> {referral.referral_type}</div>
                    <div><span className="text-muted-foreground">{t("reason")}:</span> {referral.referral_reason}</div>
                  </div>
                </div>
              )}
              {followUp && (
                <div className="border-t pt-2">
                  <p className="font-medium mb-1">{t("followUp")}</p>
                  <div className="grid grid-cols-2 gap-1">
                    <div><span className="text-muted-foreground">{t("conducted")}:</span> {followUp.followup_conducted}</div>
                    <div><span className="text-muted-foreground">{t("status")}:</span> {followUp.improvement_status}</div>
                  </div>
                </div>
              )}
              {outcomes && (
                <div className="border-t pt-2">
                  <p className="font-medium mb-1">{t("outcomes")}</p>
                  <div className="grid grid-cols-2 gap-1">
                    <div><span className="text-muted-foreground">{t("delayReduction")}:</span> {outcomes.reduction_in_delay_months}m</div>
                    <div><span className="text-muted-foreground">{t("domainImproved")}:</span> {outcomes.domain_improvement}</div>
                    <div><span className="text-muted-foreground">{t("autismRisk")}:</span> {outcomes.autism_risk_change}</div>
                    <div><span className="text-muted-foreground">{t("exitHighRisk")}:</span> {outcomes.exit_high_risk}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardHeader;
