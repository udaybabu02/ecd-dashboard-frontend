import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GOVERNANCE_ROLES, type GovernanceRole } from "@/context/GovernanceContext";
import { useGovernance } from "@/context/GovernanceContext";
import { useECDData } from "@/context/ECDDataContext";

const PASSWORD = "12345";

const Login = () => {
  const navigate = useNavigate();
  const { setAssignment } = useGovernance();
  const { allDataDistricts, allDataMandals, allDataAnganwadis, getMandalsForDistrict, getAnganwadisForMandal, loading } = useECDData();

  const [role, setRole] = useState<GovernanceRole>("State Strategic");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedMandal, setSelectedMandal] = useState("");
  const [selectedAnganwadi, setSelectedAnganwadi] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Available mandals/anganwadis based on selections
  const availableMandals = selectedDistrict ? getMandalsForDistrict(selectedDistrict) : [];
  const availableAnganwadis = selectedDistrict && selectedMandal ? getAnganwadisForMandal(selectedDistrict, selectedMandal) : [];

  useEffect(() => {
    const stored = localStorage.getItem("roleAssignment");
    if (stored) navigate("/dashboard", { replace: true });
  }, [navigate]);

  // Reset child selections when role changes
  useEffect(() => {
    setSelectedDistrict("");
    setSelectedMandal("");
    setSelectedAnganwadi("");
  }, [role]);

  // Reset mandal when district changes
  useEffect(() => {
    setSelectedMandal("");
    setSelectedAnganwadi("");
  }, [selectedDistrict]);

  // Reset anganwadi when mandal changes
  useEffect(() => {
    setSelectedAnganwadi("");
  }, [selectedMandal]);

  const needsDistrict = role !== "State Strategic";
  const needsMandal = role === "Mandal / CDPO" || role === "Sector Supervisor" || role === "Anganwadi Worker";
  const needsAnganwadi = role === "Anganwadi Worker";

  const canSubmit = () => {
    if (!password) return false;
    if (needsDistrict && !selectedDistrict) return false;
    if (needsMandal && !selectedMandal) return false;
    if (needsAnganwadi && !selectedAnganwadi) return false;
    return true;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== PASSWORD) {
      setError("Invalid Password");
      return;
    }
    const assignment = {
      role,
      district: needsDistrict ? selectedDistrict : undefined,
      mandal: needsMandal ? selectedMandal : undefined,
      anganwadi: needsAnganwadi ? selectedAnganwadi : undefined,
    };
    setAssignment(assignment);
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center">
          <div className="w-[220px] sm:w-[280px] h-auto flex items-center justify-center">
            <img
              src="/logo-amaramam.png"
              alt="AmaRaMam Services Logo"
              className="w-full h-auto object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-5 shadow-lg"
        >
          <div className="space-y-2">
            <Label htmlFor="role">Select Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as GovernanceRole)}>
              <SelectTrigger id="role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOVERNANCE_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District selector - for all except State Strategic */}
          {needsDistrict && (
            <div className="space-y-2">
              <Label>Assigned District</Label>
              <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={loading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loading ? "Loading..." : "Select District"} />
                </SelectTrigger>
                <SelectContent>
                  {allDataDistricts.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Mandal selector - for Mandal/CDPO, Sector Supervisor, AWW */}
          {needsMandal && selectedDistrict && (
            <div className="space-y-2">
              <Label>Assigned Mandal</Label>
              <Select value={selectedMandal} onValueChange={setSelectedMandal}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Mandal" />
                </SelectTrigger>
                <SelectContent>
                  {availableMandals.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Anganwadi selector - only for AWW */}
          {needsAnganwadi && selectedMandal && (
            <div className="space-y-2">
              <Label>Assigned Anganwadi</Label>
              <Select value={selectedAnganwadi} onValueChange={setSelectedAnganwadi}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Anganwadi" />
                </SelectTrigger>
                <SelectContent>
                  {availableAnganwadis.map((a) => (
                    <SelectItem key={a} value={a}>AWC {a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter password"
            />
            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={!canSubmit()}>
            Login
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Designed & Developed by AmaRaMam Services
        </p>
      </div>
    </div>
  );
};

export default Login;
