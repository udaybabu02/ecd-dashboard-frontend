// Translation dictionary for 20+ languages
// Only UI labels are translated; data values (Child_ID, numbers) remain unchanged.

export type LangCode = "en" | "te" | "hi" | "ms";

export const LANGUAGE_NAMES: Record<LangCode, string> = {
  en: "English",
  te: "తెలుగు",
  hi: "हिन्दी",
  ms: "Bahasa Melayu",
};

type TranslationKeys = {
  // Header
  appTitle: string;
  appSubtitle: string;
  searchPlaceholder: string;
  export: string;
  exportExcel: string;
  exportPDF: string;

  // Filters
  districts: string;
  mandals: string;
  anganwadis: string;
  selectAll: string;
  clearAll: string;
  clearAllFilters: string;
  searchPlaceholderFilter: string;
  children: string;
  awcs: string;

  // Tabs
  screeningCoverage: string;
  riskStratification: string;
  referralAction: string;
  workforce: string;
  longitudinalImpact: string;
  resources: string;
  uploadData: string;

  // Screening KPIs
  totalChildrenScreened: string;
  assessmentsPerAwc: string;
  screeningCoverageKpi: string;
  uniqueAwcsActive: string;
  screeningByAssessmentCycle: string;
  districtComparison: string;
  screeningDashboard: string;

  // Risk
  highCriticalRisk: string;
  mediumRisk: string;
  lowRisk: string;
  avgDelaysPerChild: string;
  riskCategoryDistribution: string;
  domainWiseDelayBurden: string;
  delaySeverityBreakdown: string;
  ageBandRiskDistribution: string;
  riskStratificationDashboard: string;

  // Referral
  childrenNeedingReferral: string;
  referralCompletionRate: string;
  pendingReferrals: string;
  underTreatment: string;
  referralStatusDistribution: string;
  referralTypeBreakdown: string;
  recentReferrals: string;
  referralActionMonitoring: string;

  // Workforce
  totalChildrenInProgram: string;
  parentsSensitized: string;
  parentsAssignedInterventions: string;
  activeAwcs: string;
  caregiverEngagement: string;
  playMaterialsAvailability: string;
  neuroBehavioralRiskIndicators: string;
  nutritionStatusDistribution: string;
  environmentStimulationScore: string;
  workforceDashboard: string;
  icdsFunctionariesTrained: string;
  modeOfTraining: string;
  parentDigitalAccess: string;
  cdpos: string;
  supervisors: string;
  awws: string;
  physical: string;
  virtual: string;
  hybrid: string;
  smartphone: string;
  keypad: string;

  // Longitudinal
  improvingChildren: string;
  worseningChildren: string;
  exitedHighRisk: string;
  followUpCompliance: string;
  developmentTrend: string;
  domainWiseImprovement: string;
  improvementStatusDistribution: string;
  keyOutcomesSummary: string;
  avgDelayReduction: string;
  followUpsConducted: string;
  improvingVsWorsening: string;
  longitudinalDashboard: string;

  // Child Profile
  childProfile: string;
  district: string;
  mandal: string;
  awc: string;
  gender: string;
  age: string;
  cycle: string;
  riskCategory: string;
  domainDelays: string;
  referral: string;
  followUp: string;
  outcomes: string;
  status: string;
  type: string;
  reason: string;
  conducted: string;
  delayReduction: string;
  domainImproved: string;
  autismRisk: string;
  exitHighRisk: string;

  // Governance
  stateStrategic: string;
  districtView: string;

  // Footer
  footerDisclaimer: string;

  // Common
  of: string;
  months: string;
  screened: string;
  highRisk: string;
  childId: string;
  risk: string;
};

const en: TranslationKeys = {
  appTitle: "ECD Decision Support System",
  appSubtitle: "Integrated Child Development Services — Andhra Pradesh",
  searchPlaceholder: "Search Child ID (e.g. AP_ECD_0...",
  export: "Export",
  exportExcel: "Export to Excel",
  exportPDF: "Export to PDF",
  districts: "Districts",
  mandals: "Mandals",
  anganwadis: "Anganwadis",
  selectAll: "Select All",
  clearAll: "Clear All",
  clearAllFilters: "Clear All Filters",
  searchPlaceholderFilter: "Search...",
  children: "Children",
  awcs: "AWCs",
  screeningCoverage: "Screening & Coverage",
  riskStratification: "Risk Stratification",
  referralAction: "Referral & Action",
  workforce: "Workforce",
  longitudinalImpact: "Longitudinal Impact",
  resources: "Resources",
  uploadData: "Upload Data",
  totalChildrenScreened: "Total Children Screened (0–6 yrs)",
  assessmentsPerAwc: "Assessments per AWC",
  screeningCoverageKpi: "Screening Coverage",
  uniqueAwcsActive: "Unique AWCs Active",
  screeningByAssessmentCycle: "Screening by Assessment Cycle",
  districtComparison: "District Comparison",
  screeningDashboard: "Screening & Coverage Dashboard",
  highCriticalRisk: "High/Critical Risk",
  mediumRisk: "Medium Risk",
  lowRisk: "Low Risk",
  avgDelaysPerChild: "Avg Delays per Child",
  riskCategoryDistribution: "Risk Category Distribution",
  domainWiseDelayBurden: "Domain-wise Delay Burden",
  delaySeverityBreakdown: "Delay Severity Breakdown",
  ageBandRiskDistribution: "Age-Band Wise Risk Distribution",
  riskStratificationDashboard: "Risk Stratification Dashboard",
  childrenNeedingReferral: "Children Needing Referral",
  referralCompletionRate: "Referral Completion Rate",
  pendingReferrals: "Pending Referrals",
  underTreatment: "Under Treatment",
  referralStatusDistribution: "Referral Status Distribution",
  referralTypeBreakdown: "Referral Type Breakdown",
  recentReferrals: "Recent Referrals",
  referralActionMonitoring: "Referral & Action Monitoring",
  totalChildrenInProgram: "Total Children in Program",
  parentsSensitized: "Parents Sensitized",
  parentsAssignedInterventions: "Parents Assigned Interventions",
  activeAwcs: "Active AWCs",
  caregiverEngagement: "Caregiver Engagement Level",
  playMaterialsAvailability: "Play Materials Availability",
  neuroBehavioralRiskIndicators: "Neuro Behavioral Risk Indicators",
  nutritionStatusDistribution: "Nutrition Status Distribution",
  environmentStimulationScore: "Environment Stimulation Score",
  workforceDashboard: "Workforce & System Performance",
  icdsFunctionariesTrained: "ICDS Functionaries Trained",
  modeOfTraining: "Mode of Training",
  parentDigitalAccess: "Parent Digital Access",
  cdpos: "CDPOs",
  supervisors: "Supervisors",
  awws: "AWWs",
  physical: "Physical",
  virtual: "Virtual",
  hybrid: "Hybrid",
  smartphone: "Smartphone",
  keypad: "Keypad",
  improvingChildren: "Improving Children",
  worseningChildren: "Worsening Children",
  exitedHighRisk: "Exited High Risk",
  followUpCompliance: "Follow-up Compliance",
  developmentTrend: "Development Trend",
  domainWiseImprovement: "Domain-wise Improvement",
  improvementStatusDistribution: "Improvement Status Distribution",
  keyOutcomesSummary: "Key Outcomes Summary",
  avgDelayReduction: "Avg Delay Reduction",
  followUpsConducted: "Follow-ups Conducted",
  improvingVsWorsening: "Improving vs Worsening",
  longitudinalDashboard: "Longitudinal Impact Dashboard",
  childProfile: "Child Profile",
  district: "District",
  mandal: "Mandal",
  awc: "AWC",
  gender: "Gender",
  age: "Age",
  cycle: "Cycle",
  riskCategory: "Risk Category",
  domainDelays: "Domain Delays",
  referral: "Referral",
  followUp: "Follow-up",
  outcomes: "Outcomes",
  status: "Status",
  type: "Type",
  reason: "Reason",
  conducted: "Conducted",
  delayReduction: "Delay Reduction",
  domainImproved: "Domain Improved",
  autismRisk: "Autism Risk",
  exitHighRisk: "Exit High Risk",
  stateStrategic: "State Strategic",
  districtView: "District View",
  footerDisclaimer: "This analytics dashboard has been built based on simulated de-identified patient data for demo purposes.",
  of: "of",
  months: "months",
  screened: "Screened",
  highRisk: "High Risk",
  childId: "Child ID",
  risk: "Risk",
};

const te: TranslationKeys = {
  appTitle: "ECD నిర్ణయ మద్దతు వ్యవస్థ",
  appSubtitle: "సమగ్ర శిశు అభివృద్ధి సేవలు — ఆంధ్రప్రదేశ్",
  searchPlaceholder: "చైల్డ్ ID శోధించండి...",
  export: "ఎగుమతి",
  exportExcel: "Excel కు ఎగుమతి",
  exportPDF: "PDF కు ఎగుమతి",
  districts: "జిల్లాలు",
  mandals: "మండలాలు",
  anganwadis: "అంగన్‌వాడీలు",
  selectAll: "అన్నీ ఎంచుకోండి",
  clearAll: "అన్నీ తొలగించండి",
  clearAllFilters: "అన్ని ఫిల్టర్లు తొలగించండి",
  searchPlaceholderFilter: "శోధించండి...",
  children: "పిల్లలు",
  awcs: "AWCలు",
  screeningCoverage: "స్క్రీనింగ్ & కవరేజ్",
  riskStratification: "రిస్క్ వర్గీకరణ",
  referralAction: "రిఫరల్ & చర్య",
  workforce: "వర్క్‌ఫోర్స్",
  longitudinalImpact: "దీర్ఘకాలిక ప్రభావం",
  resources: "వనరులు",
  uploadData: "డేటా అప్లోడ్ చేయండి",
  totalChildrenScreened: "మొత్తం స్క్రీన్ చేసిన పిల్లలు (0–6 సం.)",
  assessmentsPerAwc: "AWC కి అంచనాలు",
  screeningCoverageKpi: "స్క్రీనింగ్ కవరేజ్",
  uniqueAwcsActive: "సక్రియ AWCలు",
  screeningByAssessmentCycle: "అంచనా చక్రం ద్వారా స్క్రీనింగ్",
  districtComparison: "జిల్లా పోలిక",
  screeningDashboard: "స్క్రీనింగ్ & కవరేజ్ డాష్‌బోర్డ్",
  highCriticalRisk: "అధిక/క్రిటికల్ రిస్క్",
  mediumRisk: "మధ్యస్థ రిస్క్",
  lowRisk: "తక్కువ రిస్క్",
  avgDelaysPerChild: "పిల్లవాడికి సగటు ఆలస్యాలు",
  riskCategoryDistribution: "రిస్క్ వర్గ పంపిణీ",
  domainWiseDelayBurden: "డొమైన్-వారీ ఆలస్య భారం",
  delaySeverityBreakdown: "ఆలస్య తీవ్రత విభజన",
  ageBandRiskDistribution: "వయస్సు-బ్యాండ్ వారీ రిస్క్ పంపిణీ",
  riskStratificationDashboard: "రిస్క్ వర్గీకరణ డాష్‌బోర్డ్",
  childrenNeedingReferral: "రిఫరల్ అవసరమైన పిల్లలు",
  referralCompletionRate: "రిఫరల్ పూర్తి రేటు",
  pendingReferrals: "పెండింగ్ రిఫరల్స్",
  underTreatment: "చికిత్సలో ఉన్నవి",
  referralStatusDistribution: "రిఫరల్ స్థితి పంపిణీ",
  referralTypeBreakdown: "రిఫరల్ రకం విభజన",
  recentReferrals: "ఇటీవలి రిఫరల్స్",
  referralActionMonitoring: "రిఫరల్ & చర్య పర్యవేక్షణ",
  totalChildrenInProgram: "ప్రోగ్రామ్‌లో మొత్తం పిల్లలు",
  parentsSensitized: "సున్నితం చేసిన తల్లిదండ్రులు",
  parentsAssignedInterventions: "జోక్యాలు కేటాయించిన తల్లిదండ్రులు",
  activeAwcs: "సక్రియ AWCలు",
  caregiverEngagement: "సంరక్షకుల నిశ్చితార్థ స్థాయి",
  playMaterialsAvailability: "ఆట సామగ్రి లభ్యత",
  neuroBehavioralRiskIndicators: "న్యూరో బిహేవియరల్ రిస్క్ సూచికలు",
  nutritionStatusDistribution: "పోషణ స్థితి పంపిణీ",
  environmentStimulationScore: "పర్యావరణ ఉద్దీపన స్కోరు",
  workforceDashboard: "వర్క్‌ఫోర్స్ & సిస్టమ్ పనితీరు",
  icdsFunctionariesTrained: "శిక్షణ పొందిన ICDS సిబ్బంది",
  modeOfTraining: "శిక్షణ విధానం",
  parentDigitalAccess: "తల్లిదండ్రుల డిజిటల్ యాక్సెస్",
  cdpos: "CDPOలు",
  supervisors: "సూపర్‌వైజర్లు",
  awws: "AWWలు",
  physical: "భౌతిక",
  virtual: "వర్చువల్",
  hybrid: "హైబ్రిడ్",
  smartphone: "స్మార్ట్‌ఫోన్",
  keypad: "కీప్యాడ్",
  improvingChildren: "మెరుగవుతున్న పిల్లలు",
  worseningChildren: "క్షీణిస్తున్న పిల్లలు",
  exitedHighRisk: "అధిక రిస్క్ నుండి బయటపడినవి",
  followUpCompliance: "ఫాలో-అప్ సమ్మతి",
  developmentTrend: "అభివృద్ధి ధోరణి",
  domainWiseImprovement: "డొమైన్-వారీ మెరుగుదల",
  improvementStatusDistribution: "మెరుగుదల స్థితి పంపిణీ",
  keyOutcomesSummary: "ముఖ్య ఫలితాల సారాంశం",
  avgDelayReduction: "సగటు ఆలస్య తగ్గింపు",
  followUpsConducted: "నిర్వహించిన ఫాలో-అప్‌లు",
  improvingVsWorsening: "మెరుగు vs క్షీణత",
  longitudinalDashboard: "దీర్ఘకాలిక ప్రభావ డాష్‌బోర్డ్",
  childProfile: "పిల్లల ప్రొఫైల్",
  district: "జిల్లా",
  mandal: "మండలం",
  awc: "AWC",
  gender: "లింగం",
  age: "వయస్సు",
  cycle: "చక్రం",
  riskCategory: "రిస్క్ వర్గం",
  domainDelays: "డొమైన్ ఆలస్యాలు",
  referral: "రిఫరల్",
  followUp: "ఫాలో-అప్",
  outcomes: "ఫలితాలు",
  status: "స్థితి",
  type: "రకం",
  reason: "కారణం",
  conducted: "నిర్వహించబడింది",
  delayReduction: "ఆలస్య తగ్గింపు",
  domainImproved: "మెరుగైన డొమైన్",
  autismRisk: "ఆటిజం రిస్క్",
  exitHighRisk: "అధిక రిస్క్ నిష్క్రమణ",
  stateStrategic: "రాష్ట్ర వ్యూహాత్మక",
  districtView: "జిల్లా వీక్షణ",
  footerDisclaimer: "ఈ విశ్లేషణ డాష్‌బోర్డ్ డెమో ప్రయోజనాల కోసం అనామక రోగి డేటా ఆధారంగా నిర్మించబడింది.",
  of: "లో",
  months: "నెలలు",
  screened: "స్క్రీన్ చేయబడింది",
  highRisk: "అధిక రిస్క్",
  childId: "చైల్డ్ ID",
  risk: "రిస్క్",
};

const hi: TranslationKeys = {
  appTitle: "ECD निर्णय सहायता प्रणाली",
  appSubtitle: "एकीकृत बाल विकास सेवाएँ — आंध्र प्रदेश",
  searchPlaceholder: "चाइल्ड ID खोजें...",
  export: "निर्यात",
  exportExcel: "Excel में निर्यात",
  exportPDF: "PDF में निर्यात",
  districts: "जिले",
  mandals: "मंडल",
  anganwadis: "आंगनवाड़ी",
  selectAll: "सभी चुनें",
  clearAll: "सभी हटाएं",
  clearAllFilters: "सभी फ़िल्टर हटाएं",
  searchPlaceholderFilter: "खोजें...",
  children: "बच्चे",
  awcs: "AWC",
  screeningCoverage: "स्क्रीनिंग और कवरेज",
  riskStratification: "जोखिम वर्गीकरण",
  referralAction: "रेफरल और कार्रवाई",
  workforce: "कार्यबल",
  longitudinalImpact: "दीर्घकालिक प्रभाव",
  resources: "संसाधन",
  uploadData: "डेटा अपलोड करें",
  totalChildrenScreened: "कुल जांचे गए बच्चे (0–6 वर्ष)",
  assessmentsPerAwc: "प्रति AWC मूल्यांकन",
  screeningCoverageKpi: "स्क्रीनिंग कवरेज",
  uniqueAwcsActive: "सक्रिय AWC",
  screeningByAssessmentCycle: "मूल्यांकन चक्र द्वारा स्क्रीनिंग",
  districtComparison: "जिला तुलना",
  screeningDashboard: "स्क्रीनिंग और कवरेज डैशबोर्ड",
  highCriticalRisk: "उच्च/गंभीर जोखिम",
  mediumRisk: "मध्यम जोखिम",
  lowRisk: "कम जोखिम",
  avgDelaysPerChild: "प्रति बच्चा औसत देरी",
  riskCategoryDistribution: "जोखिम श्रेणी वितरण",
  domainWiseDelayBurden: "डोमेन-वार देरी भार",
  delaySeverityBreakdown: "देरी गंभीरता विभाजन",
  ageBandRiskDistribution: "आयु-बैंड जोखिम वितरण",
  riskStratificationDashboard: "जोखिम वर्गीकरण डैशबोर्ड",
  childrenNeedingReferral: "रेफरल आवश्यक बच्चे",
  referralCompletionRate: "रेफरल पूर्णता दर",
  pendingReferrals: "लंबित रेफरल",
  underTreatment: "उपचार में",
  referralStatusDistribution: "रेफरल स्थिति वितरण",
  referralTypeBreakdown: "रेफरल प्रकार विभाजन",
  recentReferrals: "हालिया रेफरल",
  referralActionMonitoring: "रेफरल और कार्रवाई निगरानी",
  totalChildrenInProgram: "कार्यक्रम में कुल बच्चे",
  parentsSensitized: "संवेदनशील माता-पिता",
  parentsAssignedInterventions: "हस्तक्षेप सौंपे गए माता-पिता",
  activeAwcs: "सक्रिय AWC",
  caregiverEngagement: "देखभालकर्ता सहभागिता स्तर",
  playMaterialsAvailability: "खेल सामग्री उपलब्धता",
  neuroBehavioralRiskIndicators: "न्यूरो व्यवहार जोखिम संकेतक",
  nutritionStatusDistribution: "पोषण स्थिति वितरण",
  environmentStimulationScore: "पर्यावरण उत्तेजना स्कोर",
  workforceDashboard: "कार्यबल और सिस्टम प्रदर्शन",
  icdsFunctionariesTrained: "प्रशिक्षित ICDS कार्यकर्ता",
  modeOfTraining: "प्रशिक्षण का तरीका",
  parentDigitalAccess: "माता-पिता डिजिटल पहुँच",
  cdpos: "CDPO",
  supervisors: "पर्यवेक्षक",
  awws: "AWW",
  physical: "भौतिक",
  virtual: "आभासी",
  hybrid: "हाइब्रिड",
  smartphone: "स्मार्टफोन",
  keypad: "कीपैड",
  improvingChildren: "सुधार हो रहे बच्चे",
  worseningChildren: "बिगड़ रहे बच्चे",
  exitedHighRisk: "उच्च जोखिम से बाहर",
  followUpCompliance: "फ़ॉलो-अप अनुपालन",
  developmentTrend: "विकास रुझान",
  domainWiseImprovement: "डोमेन-वार सुधार",
  improvementStatusDistribution: "सुधार स्थिति वितरण",
  keyOutcomesSummary: "मुख्य परिणाम सारांश",
  avgDelayReduction: "औसत देरी कमी",
  followUpsConducted: "किए गए फ़ॉलो-अप",
  improvingVsWorsening: "सुधार vs बिगड़ना",
  longitudinalDashboard: "दीर्घकालिक प्रभाव डैशबोर्ड",
  childProfile: "बच्चे की प्रोफ़ाइल",
  district: "जिला",
  mandal: "मंडल",
  awc: "AWC",
  gender: "लिंग",
  age: "आयु",
  cycle: "चक्र",
  riskCategory: "जोखिम श्रेणी",
  domainDelays: "डोमेन देरी",
  referral: "रेफरल",
  followUp: "फ़ॉलो-अप",
  outcomes: "परिणाम",
  status: "स्थिति",
  type: "प्रकार",
  reason: "कारण",
  conducted: "किया गया",
  delayReduction: "देरी कमी",
  domainImproved: "सुधारा गया डोमेन",
  autismRisk: "ऑटिज्म जोखिम",
  exitHighRisk: "उच्च जोखिम निकास",
  stateStrategic: "राज्य रणनीतिक",
  districtView: "जिला दृश्य",
  footerDisclaimer: "यह एनालिटिक्स डैशबोर्ड डेमो उद्देश्यों के लिए अनामिक रोगी डेटा पर बनाया गया है।",
  of: "का",
  months: "महीने",
  screened: "जांचे गए",
  highRisk: "उच्च जोखिम",
  childId: "चाइल्ड ID",
  risk: "जोखिम",
};

const ms: TranslationKeys = {
  appTitle: "Sistem Sokongan Keputusan ECD",
  appSubtitle: "Perkhidmatan Pembangunan Kanak-Kanak Bersepadu — Andhra Pradesh",
  searchPlaceholder: "Cari ID Kanak-kanak (cth. AP_ECD_0...",
  export: "Eksport",
  exportExcel: "Eksport ke Excel",
  exportPDF: "Eksport ke PDF",
  districts: "Daerah",
  mandals: "Mandal",
  anganwadis: "Anganwadi",
  selectAll: "Pilih Semua",
  clearAll: "Kosongkan Semua",
  clearAllFilters: "Kosongkan Semua Penapis",
  searchPlaceholderFilter: "Cari...",
  children: "Kanak-kanak",
  awcs: "AWC",
  screeningCoverage: "Saringan & Liputan",
  riskStratification: "Stratifikasi Risiko",
  referralAction: "Rujukan & Tindakan",
  workforce: "Tenaga Kerja",
  longitudinalImpact: "Impak Membujur",
  resources: "Sumber",
  uploadData: "Muat Naik Data",
  totalChildrenScreened: "Jumlah Kanak-kanak Disaring (0–6 thn)",
  assessmentsPerAwc: "Penilaian setiap AWC",
  screeningCoverageKpi: "Liputan Saringan",
  uniqueAwcsActive: "AWC Unik Aktif",
  screeningByAssessmentCycle: "Saringan mengikut Kitaran Penilaian",
  districtComparison: "Perbandingan Daerah",
  screeningDashboard: "Papan Pemuka Saringan & Liputan",
  highCriticalRisk: "Risiko Tinggi/Kritikal",
  mediumRisk: "Risiko Sederhana",
  lowRisk: "Risiko Rendah",
  avgDelaysPerChild: "Purata Kelewatan Setiap Kanak-kanak",
  riskCategoryDistribution: "Taburan Kategori Risiko",
  domainWiseDelayBurden: "Beban Kelewatan Mengikut Domain",
  delaySeverityBreakdown: "Pecahan Keparahan Kelewatan",
  ageBandRiskDistribution: "Taburan Risiko Mengikut Kumpulan Umur",
  riskStratificationDashboard: "Papan Pemuka Stratifikasi Risiko",
  childrenNeedingReferral: "Kanak-kanak Memerlukan Rujukan",
  referralCompletionRate: "Kadar Penyelesaian Rujukan",
  pendingReferrals: "Rujukan Tertunda",
  underTreatment: "Sedang Dirawat",
  referralStatusDistribution: "Taburan Status Rujukan",
  referralTypeBreakdown: "Pecahan Jenis Rujukan",
  recentReferrals: "Rujukan Terkini",
  referralActionMonitoring: "Pemantauan Rujukan & Tindakan",
  totalChildrenInProgram: "Jumlah Kanak-kanak dalam Program",
  parentsSensitized: "Ibu Bapa Diberi Kesedaran",
  parentsAssignedInterventions: "Intervensi Ditugaskan Kepada Ibu Bapa",
  activeAwcs: "AWC Aktif",
  caregiverEngagement: "Tahap Penglibatan Penjaga",
  playMaterialsAvailability: "Ketersediaan Bahan Bermain",
  neuroBehavioralRiskIndicators: "Penunjuk Risiko Tingkah Laku Neuro",
  nutritionStatusDistribution: "Taburan Status Nutrisi",
  environmentStimulationScore: "Skor Rangsangan Persekitaran",
  workforceDashboard: "Papan Pemuka Tenaga Kerja & Prestasi Sistem",
  icdsFunctionariesTrained: "Fungsionari ICDS Dilatih",
  modeOfTraining: "Mod Latihan",
  parentDigitalAccess: "Akses Digital Ibu Bapa",
  cdpos: "CDPO",
  supervisors: "Penyelia",
  awws: "AWW",
  physical: "Fizikal",
  virtual: "Maya",
  hybrid: "Hibrid",
  smartphone: "Telefon Pintar",
  keypad: "Telefon Pad Kekunci",
  improvingChildren: "Kanak-kanak Semakin Baik",
  worseningChildren: "Kanak-kanak Semakin Merosot",
  exitedHighRisk: "Keluar dari Risiko Tinggi",
  followUpCompliance: "Pematuhan Susulan",
  developmentTrend: "Trend Pembangunan",
  domainWiseImprovement: "Peningkatan Mengikut Domain",
  improvementStatusDistribution: "Taburan Status Peningkatan",
  keyOutcomesSummary: "Ringkasan Hasil Utama",
  avgDelayReduction: "Purata Pengurangan Kelewatan",
  followUpsConducted: "Susulan Dijalankan",
  improvingVsWorsening: "Semakin Baik vs Semakin Merosot",
  longitudinalDashboard: "Papan Pemuka Impak Membujur",
  childProfile: "Profil Kanak-kanak",
  district: "Daerah",
  mandal: "Mandal",
  awc: "AWC",
  gender: "Jantina",
  age: "Umur",
  cycle: "Kitaran",
  riskCategory: "Kategori Risiko",
  domainDelays: "Kelewatan Domain",
  referral: "Rujukan",
  followUp: "Susulan",
  outcomes: "Hasil",
  status: "Status",
  type: "Jenis",
  reason: "Sebab",
  conducted: "Dijalankan",
  delayReduction: "Pengurangan Kelewatan",
  domainImproved: "Domain Ditingkatkan",
  autismRisk: "Risiko Autisme",
  exitHighRisk: "Keluar Risiko Tinggi",
  stateStrategic: "Strategik Negeri",
  districtView: "Paparan Daerah",
  footerDisclaimer: "Papan pemuka analitik ini telah dibina berdasarkan data pesakit tanpa pengenalan simulasi untuk tujuan demo.",
  of: "daripada",
  months: "bulan",
  screened: "Disaring",
  highRisk: "Risiko Tinggi",
  childId: "ID Kanak-kanak",
  risk: "Risiko",
};

export const TRANSLATIONS: Record<LangCode, TranslationKeys> = {
  en,
  te,
  hi,
  ms,
};
