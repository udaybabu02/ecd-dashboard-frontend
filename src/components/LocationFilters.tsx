import { MapPin, Building2, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useECDData } from "@/context/ECDDataContext";
import { useLanguage } from "@/context/LanguageContext";
import { useGovernance } from "@/context/GovernanceContext";
import MultiSelectDropdown from "./MultiSelectDropdown";

const LocationFilters = () => {
  const { filters, setFilters, allDistricts, allMandals, allAnganwadis, filteredProfiles, clearAllFilters } = useECDData();
  const { t } = useLanguage();
  const { role } = useGovernance();

  // Determine which filters are locked based on role
  // AWW: all locked; Supervisor: district+mandal locked; Mandal/CDPO: district locked; District: district locked; State: all enabled
  const districtLocked = role !== "State Strategic";
  const mandalLocked = role === "Anganwadi Worker" || role === "Sector Supervisor";
  const anganwadiLocked = role === "Anganwadi Worker";
  const allFiltersEnabled = role === "State Strategic";

  const uniqueAwcs = new Set(filteredProfiles.map((c) => c.awc_code)).size;
  const hasActiveFilters = filters.districts.length > 0 || filters.mandals.length > 0 || filters.anganwadis.length > 0;

  return (
    <div className="bg-card px-4 sm:px-6 py-3 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-medium">
          <MapPin className="w-3.5 h-3.5" />
          India
        </div>
        <span className="text-xs text-muted-foreground">{allDistricts.length} {t("districts")}</span>

        <MultiSelectDropdown
          icon={<Building2 className="w-3.5 h-3.5" />}
          label={t("districts")}
          items={allDistricts}
          selected={filters.districts}
          onSelectionChange={(selected) =>
            setFilters((f) => ({ ...f, districts: selected, mandals: [], anganwadis: [] }))
          }
          disabled={districtLocked}
        />

        <MultiSelectDropdown
          icon={<Home className="w-3.5 h-3.5" />}
          label={t("mandals")}
          items={allMandals}
          selected={filters.mandals}
          onSelectionChange={(selected) =>
            setFilters((f) => ({ ...f, mandals: selected, anganwadis: [] }))
          }
          disabled={mandalLocked}
        />

        <MultiSelectDropdown
          icon={<Home className="w-3.5 h-3.5" />}
          label={t("anganwadis")}
          items={allAnganwadis}
          selected={filters.anganwadis}
          onSelectionChange={(selected) =>
            setFilters((f) => ({ ...f, anganwadis: selected }))
          }
          formatItem={(item) => `AWC ${item}`}
          disabled={anganwadiLocked}
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-destructive hover:text-destructive"
            onClick={clearAllFilters}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t("clearAllFilters")}
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground w-full sm:w-auto justify-end">
        <span className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground">{filteredProfiles.length.toLocaleString()}</span> {t("children")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground">{uniqueAwcs}</span> {t("awcs")}
        </span>
      </div>
    </div>
  );
};

export default LocationFilters;
