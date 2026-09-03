export type PregnancyStatus =
  | 'Non-Pregnant (Open)'
  | 'Early Gestation (1-3 Months)'
  | 'Mid Gestation (4-6 Months)'
  | 'Late Gestation (7-9 Months)'
  | 'Advanced Gestation (>9 Months / Close-up)'
  | 'Recently Calved (Postpartum)'
  | 'Not Applicable / Male';

export type LactationStatus =
  | 'Early Lactation (Peak Yield)'
  | 'Mid Lactation'
  | 'Late Lactation'
  | 'Dry Cow (Rest Period)'
  | 'Heifer (Non-Lactating)'
  | 'Mastitic / Abnormal Yield'
  | 'Not Applicable / Male';

export interface AnimalProfile {
  id: string;
  earTagNumber: string;
  name?: string;
  species: 'Cattle' | 'Buffalo' | 'Goat' | 'Sheep';
  breed: string;
  estimatedAgeMonths: number;
  gender: 'Female' | 'Male';
  weightKg: number;
  ownerName: string;
  ownerContact: string;
  ownerVillage: string;
  district: string;
  state: string;
  gpsLocation: {
    lat: number;
    lng: number;
    district?: string;
    state?: string;
    locationName?: string;
    country?: string;
    accuracyMeters?: number;
    timestamp: string;
    isLiveLocation?: boolean;
  };
  currentStatus: 'Healthy' | 'Observation' | 'Moderate Concern' | 'Critical / Flagged';
  lastAssessmentDate: string;
  thumbnailUrl: string;
  bodyConditionScore: number; // 1.0 to 5.0
  pregnancyStatus?: PregnancyStatus;
  lactationStatus?: LactationStatus;
  dailyMilkYieldLiters?: number;
  lactationStageDays?: number;
  inseminationDate?: string;
  expectedCalvingDate?: string;
  vaccinations: {
    name: string;
    date: string;
    nextDueDate: string;
    batchNo: string;
  }[];
  assessmentsCount: number;
  quarantineStatus?: 'None' | 'Recommended' | 'Enforced';
  reports?: CattleFormalReport[];
}

export interface CattleFormalReport {
  id: string;
  reportNumber: string;
  animalId: string;
  animalEarTag: string;
  animalName?: string;
  breed: string;
  species: string;
  createdAt: string;
  authorRole: 'Farmer' | 'Veterinary Officer';
  authorName: string;
  title: string;
  primaryDiagnosis: string;
  severityGrade: 'Mild' | 'Moderate' | 'Severe' | 'Emergency Quarantine' | 'Healthy';
  summaryObservations: string;
  customNotes?: string;
  immediateRemedies: string[];
  recommendedVeterinaryActions: string[];
  drugContraindications?: string[];
  bcsScore: number;
  pregnancyStatus?: string;
  lactationStatus?: string;
  dailyMilkYieldLiters?: number;
  imageUrl: string;
  gpsLocation: {
    district: string;
    state: string;
    lat: number;
    lng: number;
    locationName?: string;
    country?: string;
    address?: string;
    isLiveLocation?: boolean;
  };
  ndlmSyncStatus: 'Synchronized & Verified' | 'Pending Field Verification';
  officialRemarks?: string;
}

export interface LesionDetection {
  id: string;
  label: string;
  confidence: number;
  severity: 'Mild' | 'Moderate' | 'Severe';
  boundingBox: {
    ymin: number; // 0 - 100%
    xmin: number;
    ymax: number;
    xmax: number;
  };
  anatomicalLocation: string; // e.g., 'Lateral flank', 'Muzzle & Nostril', 'Teat/Udder', 'Hock joint'
  clinicalDescription: string;
}

export interface ConformationalMetric {
  metric: string;
  score: number; // 0 to 100
  benchmark: string;
  status: 'Optimal' | 'Sub-optimal' | 'Abnormal';
  details: string;
}

export interface DiagnosticAssessment {
  id: string;
  animalId: string;
  timestamp: string;
  imageUrl: string;
  predictedBreed: string;
  breedConfidence: number;
  detectedSpecies: string;
  coatCondition: 'Glossy & Healthy' | 'Dull / Matted' | 'Alopecia / Hair Loss' | 'Crusted / Nodular';
  postureAssessment: {
    spineCurvature: 'Normal Straight' | 'Kyphosis (Hunched)' | 'Lordosis (Dropped)';
    headCarriage: 'Alert & Elevated' | 'Depressed / Drooping';
    weightBearing: 'Equal on all 4 limbs' | 'Antalgic (Shifting/Limping)';
    gaitConfidence: number;
  };
  bodyConditionScore: number;
  conformationalMetrics: ConformationalMetric[];
  lesions: LesionDetection[];
  primaryDiagnosis: string;
  isDiseased?: boolean;
  diseaseIdentified?: string;
  diseaseCommonName?: string;
  diseaseStatus?: string;
  diseaseSummaryStatement?: string;
  symptomsObserved?: string[];
  differentialDiagnoses: {
    disease: string;
    probability: number;
    keyIndications: string[];
    sourceDataset: string;
  }[];
  severityGrade: 'Mild' | 'Moderate' | 'Severe' | 'Emergency Quarantine';
  pregnancyStatus?: PregnancyStatus;
  lactationStatus?: LactationStatus;
  milkYieldImpact?: string;
  reproductiveAndLactationAlerts?: {
    pregnancyRiskNotes?: string;
    lactationImpact?: string;
    drugContraindications?: string[];
    nutritionalRecommendation?: string;
  };
  ragCitations: {
    source: 'Bharat Pashudhan (NDLM)' | 'IEEE Dataport Indian Breed' | 'CID Cattle Identification Dataset' | 'ICAR-IVRI Clinical Protocol';
    title: string;
    section: string;
    relevanceScore: number;
    guidelineSnippet: string;
    url?: string;
  }[];
  immediateRemedies: string[];
  recommendedVeterinaryActions: string[];
  biosecurityProtocol: string[];
  gpsMetadata: {
    lat: number;
    lng: number;
    district: string;
    state: string;
    locationName?: string;
    country?: string;
    address?: string;
    altitudeMeters?: number;
    accuracy?: number;
    isLiveLocation?: boolean;
  };
  audioNarrativeUrl?: string;
  audioLanguage?: string;
  reviewedByOfficer?: {
    officerName: string;
    officerBadge: string;
    reviewedAt: string;
    officialRemarks: string;
    quarantineIssued: boolean;
  };
}

export interface OutbreakAlert {
  id: string;
  diseaseName: string;
  affectedBreed: string;
  district: string;
  state: string;
  activeCasesCount: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Severe Epidemic';
  centerCoords: { lat: number; lng: number };
  radiusKm: number;
  lastUpdated: string;
  actionRequired: string;
}

export interface RagIndexItem {
  id: string;
  source: 'Bharat Pashudhan' | 'IEEE Dataport' | 'CID Dataset' | 'ICAR Guidelines';
  title: string;
  category: 'Viral Infections' | 'Bacterial & Parasitic' | 'Breed Biometrics' | 'Nutritional & BCS' | 'Quarantine Protocols';
  contentSnippet: string;
  vectorId: string;
  dimension: number;
  lastSynced: string;
  similarityScore?: number;
}

export type SupportedLanguage = 
  | 'en'
  | 'hi'
  | 'bn'
  | 'mr'
  | 'te'
  | 'ta'
  | 'gu'
  | 'ur'
  | 'kn'
  | 'or'
  | 'ml'
  | 'pa'
  | 'as'
  | 'mai'
  | 'sat'
  | 'ks'
  | 'ne'
  | 'kok'
  | 'sd'
  | 'doi'
  | 'mni'
  | 'brx'
  | 'sa';

export interface VoiceSymptomAnalysisResult {
  detectedLanguage: string;
  detectedLanguageCode: string;
  originalTranscription: string;
  translatedEnglish: string;
  extractedSymptoms: string[];
  suspectedConditions: string[];
  duration?: string;
  severity?: 'Mild' | 'Moderate' | 'Severe' | 'Critical';
  clinicalSummary: string;
}

export type UserRole = 'farmer' | 'veterinarian';

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  village?: string;
  district: string;
  state: string;
  badgeNumber?: string;
  registrationNumber?: string;
  designation?: string;
  avatarUrl?: string;
  assignedCattleIds?: string[];
}
