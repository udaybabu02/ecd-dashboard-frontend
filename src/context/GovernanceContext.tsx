import React, { createContext, useContext, useState } from "react";

export type GovernanceRole =
  | "Anganwadi Worker"
  | "Sector Supervisor"
  | "Mandal / CDPO"
  | "District Officer"
  | "State Strategic";

export const GOVERNANCE_ROLES: GovernanceRole[] = [
  "Anganwadi Worker",
  "Sector Supervisor",
  "Mandal / CDPO",
  "District Officer",
  "State Strategic",
];

export interface RoleAssignment {
  role: GovernanceRole;
  district?: string;
  mandal?: string;
  anganwadi?: string;
}

interface GovernanceContextValue {
  role: GovernanceRole;
  assignment: RoleAssignment;
  setAssignment: (a: RoleAssignment) => void;
  /** Whether the current role allows viewing individual child-level data */
  showChildLevelData: boolean;
  /** Whether the current role allows showing district comparison charts */
  showDistrictComparison: boolean;
  logout: () => void;
}

const GovernanceContext = createContext<GovernanceContextValue | null>(null);

export const useGovernance = () => {
  const ctx = useContext(GovernanceContext);
  if (!ctx) throw new Error("useGovernance must be used within GovernanceProvider");
  return ctx;
};

function loadAssignment(): RoleAssignment {
  try {
    const stored = localStorage.getItem("roleAssignment");
    if (stored) return JSON.parse(stored);
  } catch {}
  const role = (localStorage.getItem("userRole") as GovernanceRole) || "State Strategic";
  return { role };
}

export const GovernanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assignment, setAssignmentState] = useState<RoleAssignment>(loadAssignment);

  const setAssignment = (a: RoleAssignment) => {
    localStorage.setItem("roleAssignment", JSON.stringify(a));
    localStorage.setItem("userRole", a.role);
    setAssignmentState(a);
  };

  const logout = () => {
    localStorage.removeItem("roleAssignment");
    localStorage.removeItem("userRole");
  };

  const role = assignment.role;

  // Child-level data only visible to AWW
  const showChildLevelData = role === "Anganwadi Worker";

  // District comparison visible to District Officer and State Strategic
  const showDistrictComparison = role === "District Officer" || role === "State Strategic";

  return (
    <GovernanceContext.Provider value={{ role, assignment, setAssignment, showChildLevelData, showDistrictComparison, logout }}>
      {children}
    </GovernanceContext.Provider>
  );
};
