import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { loadECDData, ECDDataset, ChildProfile, BaselineRiskOutput, DevelopmentalRisk, ReferralAction, InterventionFollowUp, OutcomesImpact, NeuroBehavioral, NutritionExtended, Environment } from "@/lib/dataLoader";
import { useGovernance } from "@/context/GovernanceContext";

interface Filters {
  districts: string[];
  mandals: string[];
  anganwadis: string[];
}

interface ECDContextValue {
  loading: boolean;
  data: ECDDataset | null;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filteredProfiles: ChildProfile[];
  /** Profiles scoped to the role assignment (before user filters) */
  scopedProfiles: ChildProfile[];
  riskMap: Map<string, BaselineRiskOutput>;
  devRiskMap: Map<string, DevelopmentalRisk>;
  referralMap: Map<string, ReferralAction>;
  followUpMap: Map<string, InterventionFollowUp>;
  outcomesMap: Map<string, OutcomesImpact>;
  neuroMap: Map<string, NeuroBehavioral>;
  nutritionMap: Map<string, NutritionExtended>;
  environmentMap: Map<string, Environment>;
  allDistricts: string[];
  allMandals: string[];
  allAnganwadis: string[];
  /** All districts in the full dataset (for login selectors) */
  allDataDistricts: string[];
  /** All mandals in the full dataset (for login selectors) */
  allDataMandals: string[];
  /** All anganwadis in the full dataset (for login selectors) */
  allDataAnganwadis: string[];
  /** Get mandals for a specific district */
  getMandalsForDistrict: (district: string) => string[];
  /** Get anganwadis for a specific district+mandal */
  getAnganwadisForMandal: (district: string, mandal: string) => string[];
  clearAllFilters: () => void;
  /** Check if a child_id is within the current role scope */
  isChildInScope: (childId: string) => boolean;
}

const ECDDataContext = createContext<ECDContextValue | null>(null);

export const useECDData = () => {
  const ctx = useContext(ECDDataContext);
  if (!ctx) throw new Error("useECDData must be used within ECDDataProvider");
  return ctx;
};

export const ECDDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ECDDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ districts: [], mandals: [], anganwadis: [] });
  const { role, assignment } = useGovernance();

  useEffect(() => {
    loadECDData().then((d) => { setData(d); setLoading(false); });
  }, []);

  const buildMap = <T extends { child_id: string }>(items: T[] | undefined) => {
    const m = new Map<string, T>();
    items?.forEach((r) => m.set(r.child_id, r));
    return m;
  };

  const riskMap = useMemo(() => buildMap(data?.baselineRisk), [data]);
  const devRiskMap = useMemo(() => buildMap(data?.developmentalRisk), [data]);
  const referralMap = useMemo(() => buildMap(data?.referralAction), [data]);
  const followUpMap = useMemo(() => buildMap(data?.interventionFollowUp), [data]);
  const outcomesMap = useMemo(() => buildMap(data?.outcomesImpact), [data]);
  const neuroMap = useMemo(() => buildMap(data?.neuroBehavioral), [data]);
  const nutritionMap = useMemo(() => buildMap(data?.nutritionExtended), [data]);
  const environmentMap = useMemo(() => buildMap(data?.environment), [data]);

  // Full dataset lookups for login page
  const allDataDistricts = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.childProfiles.map((c) => c.district))].sort();
  }, [data]);

  const allDataMandals = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.childProfiles.map((c) => c.mandal))].sort();
  }, [data]);

  const allDataAnganwadis = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.childProfiles.map((c) => String(c.awc_code)))].sort();
  }, [data]);

  const getMandalsForDistrict = (district: string) => {
    if (!data) return [];
    return [...new Set(data.childProfiles.filter(c => c.district === district).map(c => c.mandal))].sort();
  };

  const getAnganwadisForMandal = (district: string, mandal: string) => {
    if (!data) return [];
    return [...new Set(
      data.childProfiles
        .filter(c => c.district === district && c.mandal === mandal)
        .map(c => String(c.awc_code))
    )].sort();
  };

  // Role-scoped profiles: mandatory pre-filter based on assignment
  const scopedProfiles = useMemo(() => {
    if (!data) return [];
    let profiles = data.childProfiles;

    if (role === "State Strategic") {
      // Full access
      return profiles;
    }

    if (assignment.district) {
      profiles = profiles.filter(c => c.district === assignment.district);
    }
    if (role === "Mandal / CDPO" || role === "Sector Supervisor" || role === "Anganwadi Worker") {
      if (assignment.mandal) {
        profiles = profiles.filter(c => c.mandal === assignment.mandal);
      }
    }
    if (role === "Anganwadi Worker") {
      if (assignment.anganwadi) {
        profiles = profiles.filter(c => String(c.awc_code) === assignment.anganwadi);
      }
    }

    return profiles;
  }, [data, role, assignment]);

  // Scoped child IDs set for quick lookup
  const scopedChildIds = useMemo(() => {
    return new Set(scopedProfiles.map(c => c.child_id));
  }, [scopedProfiles]);

  const isChildInScope = (childId: string) => scopedChildIds.has(childId);

  // Available filter options based on scoped data
  const allDistricts = useMemo(() => {
    return [...new Set(scopedProfiles.map((c) => c.district))].sort();
  }, [scopedProfiles]);

  // Cascading: mandals depend on selected districts (within scope)
  const allMandals = useMemo(() => {
    const profiles = filters.districts.length > 0
      ? scopedProfiles.filter((c) => filters.districts.includes(c.district))
      : scopedProfiles;
    return [...new Set(profiles.map((c) => c.mandal))].sort();
  }, [scopedProfiles, filters.districts]);

  // Cascading: anganwadis depend on selected districts + mandals (within scope)
  const allAnganwadis = useMemo(() => {
    let profiles = scopedProfiles;
    if (filters.districts.length > 0) profiles = profiles.filter((c) => filters.districts.includes(c.district));
    if (filters.mandals.length > 0) profiles = profiles.filter((c) => filters.mandals.includes(c.mandal));
    return [...new Set(profiles.map((c) => String(c.awc_code)))].sort();
  }, [scopedProfiles, filters.districts, filters.mandals]);

  // Final filtered profiles = scoped + user filters
  const filteredProfiles = useMemo(() => {
    let profiles = scopedProfiles;
    if (filters.districts.length > 0) profiles = profiles.filter((c) => filters.districts.includes(c.district));
    if (filters.mandals.length > 0) profiles = profiles.filter((c) => filters.mandals.includes(c.mandal));
    if (filters.anganwadis.length > 0) profiles = profiles.filter((c) => filters.anganwadis.includes(String(c.awc_code)));
    return profiles;
  }, [scopedProfiles, filters]);

  const clearAllFilters = () => setFilters({ districts: [], mandals: [], anganwadis: [] });

  return (
    <ECDDataContext.Provider
      value={{
        loading, data, filters, setFilters, filteredProfiles, scopedProfiles,
        riskMap, devRiskMap, referralMap, followUpMap, outcomesMap, neuroMap, nutritionMap, environmentMap,
        allDistricts, allMandals, allAnganwadis,
        allDataDistricts, allDataMandals, allDataAnganwadis,
        getMandalsForDistrict, getAnganwadisForMandal,
        clearAllFilters, isChildInScope,
      }}
    >
      {children}
    </ECDDataContext.Provider>
  );
};
