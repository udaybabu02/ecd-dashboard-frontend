import * as XLSX from "xlsx";

export interface ChildProfile {
  child_id: string;
  dob: string;
  age_months: number;
  gender: string;
  awc_code: number;
  mandal: string;
  district: string;
  assessment_cycle: string;
}

export interface DevelopmentalRisk {
  child_id: string;
  GM_delay: number;
  FM_delay: number;
  LC_delay: number;
  COG_delay: number;
  SE_delay: number;
  num_delays: number;
}

export interface NeuroBehavioral {
  child_id: string;
  autism_risk: string;
  adhd_risk: string;
  behavior_risk: string;
}

export interface NutritionExtended {
  child_id: string;
  underweight: number;
  stunting: number;
  wasting: number;
  anemia: number;
  nutrition_score: number;
  nutrition_risk: string;
}

export interface Environment {
  child_id: string;
  parent_child_interaction_score: number;
  parent_mental_health_score: number;
  home_stimulation_score: number;
  play_materials: string;
  caregiver_engagement: string;
  language_exposure: string;
  safe_water: string;
  toilet_facility: string;
}

export interface BaselineRiskOutput {
  child_id: string;
  baseline_score: number;
  baseline_category: string;
}

export interface ReferralAction {
  child_id: string;
  referral_triggered: string;
  referral_type: string;
  referral_reason: string;
  referral_status: string;
}

export interface InterventionFollowUp {
  child_id: string;
  intervention_plan_generated: string;
  home_activities_assigned: number;
  followup_conducted: string;
  improvement_status: string;
}

export interface OutcomesImpact {
  child_id: string;
  reduction_in_delay_months: number;
  domain_improvement: string;
  autism_risk_change: string;
  exit_high_risk: string;
}

export interface ECDDataset {
  childProfiles: ChildProfile[];
  developmentalRisk: DevelopmentalRisk[];
  neuroBehavioral: NeuroBehavioral[];
  nutritionExtended: NutritionExtended[];
  environment: Environment[];
  baselineRisk: BaselineRiskOutput[];
  referralAction: ReferralAction[];
  interventionFollowUp: InterventionFollowUp[];
  outcomesImpact: OutcomesImpact[];
}

function parseSheet<T>(workbook: XLSX.WorkBook, sheetIndex: number): T[] {
  const sheetName = workbook.SheetNames[sheetIndex];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<T>(sheet, { defval: "" });
}

function parseSheetByName<T>(workbook: XLSX.WorkBook, namePattern: string): T[] {
  const sheetName = workbook.SheetNames.find((n) =>
    n.toLowerCase().includes(namePattern.toLowerCase())
  );
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<T>(sheet, { defval: "" });
}

// Find sheet by checking if it contains specific columns in its first row
function parseSheetByColumns<T>(workbook: XLSX.WorkBook, requiredColumns: string[]): T[] {
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
    if (rows.length > 0) {
      const keys = Object.keys(rows[0]);
      if (requiredColumns.every((col) => keys.includes(col))) {
        return rows as T[];
      }
    }
  }
  return [];
}


// USE BELOW CODE FOR ONLY DATA FROM FRONTEND IN BUILD DATA

// export async function loadECDData(): Promise<ECDDataset> {
//   const response = await fetch("/data/ECD_Data_sets.xlsx");
//   const arrayBuffer = await response.arrayBuffer();
//   const workbook = XLSX.read(arrayBuffer, { type: "array" });

//   console.log("Excel sheet names:", workbook.SheetNames);

//   return {
//     childProfiles: parseSheetByColumns<ChildProfile>(workbook, ["child_id", "dob", "age_months", "district"]),
//     developmentalRisk: parseSheetByColumns<DevelopmentalRisk>(workbook, ["child_id", "GM_delay", "FM_delay", "num_delays"]),
//     neuroBehavioral: parseSheetByColumns<NeuroBehavioral>(workbook, ["child_id", "autism_risk", "adhd_risk", "behavior_risk"]),
//     nutritionExtended: parseSheetByColumns<NutritionExtended>(workbook, ["child_id", "underweight", "stunting", "nutrition_risk"]),
//     environment: parseSheetByColumns<Environment>(workbook, ["child_id", "parent_child_interaction_score", "home_stimulation_score"]),
//     baselineRisk: parseSheetByColumns<BaselineRiskOutput>(workbook, ["child_id", "baseline_score", "baseline_category"]),
//     referralAction: parseSheetByColumns<ReferralAction>(workbook, ["child_id", "referral_triggered", "referral_type", "referral_status"]),
//     interventionFollowUp: parseSheetByColumns<InterventionFollowUp>(workbook, ["child_id", "intervention_plan_generated", "followup_conducted", "improvement_status"]),
//     outcomesImpact: parseSheetByColumns<OutcomesImpact>(workbook, ["child_id", "reduction_in_delay_months", "domain_improvement", "exit_high_risk"]),
//   };
// }





// THIS IS SERVER DATA 

export async function loadECDData(): Promise<ECDDataset> {
  const response = await fetch("https://ecd-backend-xqsw.onrender.com/ecd-data");

  if (!response.ok) {
    throw new Error("Failed to fetch ECD data");
  }

  const result = await response.json();
  const rows = result.data;

  // Build dataset structure from flat JOIN result
  return {
    childProfiles: rows.map((r: any) => ({
      child_id: r.child_id,
      dob: r.dob,
      age_months: r.age_months,
      gender: r.gender,
      awc_code: r.awc_code,
      mandal: r.mandal,
      district: r.district,
      assessment_cycle: r.assessment_cycle,
    })),

    developmentalRisk: rows.map((r: any) => ({
      child_id: r.child_id,
      GM_delay: r.gm_delay,
      FM_delay: r.fm_delay,
      LC_delay: r.lc_delay,
      COG_delay: r.cog_delay,
      SE_delay: r.se_delay,
      num_delays: r.num_delays,
    })),

    neuroBehavioral: rows.map((r: any) => ({
      child_id: r.child_id,
      autism_risk: r.autism_risk,
      adhd_risk: r.adhd_risk,
      behavior_risk: r.behavior_risk,
    })),

    nutritionExtended: rows.map((r: any) => ({
      child_id: r.child_id,
      underweight: r.underweight,
      stunting: r.stunting,
      wasting: r.wasting,
      anemia: r.anemia,
      nutrition_score: r.nutrition_score,
      nutrition_risk: r.nutrition_risk,
    })),

    environment: rows.map((r: any) => ({
      child_id: r.child_id,
      parent_child_interaction_score: r.parent_child_interaction_score,
      parent_mental_health_score: r.parent_mental_health_score,
      home_stimulation_score: r.home_stimulation_score,
      play_materials: r.play_materials,
      caregiver_engagement: r.caregiver_engagement,
      language_exposure: r.language_exposure,
      safe_water: r.safe_water,
      toilet_facility: r.toilet_facility,
    })),

    baselineRisk: rows.map((r: any) => ({
      child_id: r.child_id,
      baseline_score: r.baseline_score,
      baseline_category: r.baseline_category,
    })),

    referralAction: rows.map((r: any) => ({
      child_id: r.child_id,
      referral_triggered: r.referral_triggered,
      referral_type: r.referral_type,
      referral_reason: r.referral_reason,
      referral_status: r.referral_status,
    })),

    interventionFollowUp: rows.map((r: any) => ({
      child_id: r.child_id,
      intervention_plan_generated: r.intervention_plan_generated,
      home_activities_assigned: r.home_activities_assigned,
      followup_conducted: r.followup_conducted,
      improvement_status: r.improvement_status,
    })),

    outcomesImpact: rows.map((r: any) => ({
      child_id: r.child_id,
      reduction_in_delay_months: r.reduction_in_delay_months,
      domain_improvement: r.domain_improvement,
      autism_risk_change: r.autism_risk_change,
      exit_high_risk: r.exit_high_risk,
    })),
  };
}
