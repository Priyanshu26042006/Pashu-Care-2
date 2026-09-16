import {
  pgTable,
  text,
  integer,
  doublePrecision,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

// 1. Users Table (Mirroring AuthUser / System Actors)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(), // 'farmer' | 'veterinarian'
  phone: text('phone'),
  email: text('email'),
  village: text('village'),
  district: text('district').notNull(),
  state: text('state').notNull(),
  badgeNumber: text('badge_number'),
  registrationNumber: text('registration_number'),
  designation: text('designation'),
  avatarUrl: text('avatar_url'),
  assignedCattleIds: jsonb('assigned_cattle_ids').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Animals Table (Mirroring AnimalProfile from src/types.ts)
export const animals = pgTable('animals', {
  id: text('id').primaryKey(),
  earTagNumber: text('ear_tag_number').notNull(),
  name: text('name'),
  species: text('species').notNull(), // 'Cattle' | 'Buffalo' | 'Goat' | 'Sheep'
  breed: text('breed').notNull(),
  estimatedAgeMonths: integer('estimated_age_months').notNull().default(36),
  gender: text('gender').notNull().default('Female'), // 'Female' | 'Male'
  weightKg: doublePrecision('weight_kg').notNull().default(400),
  ownerName: text('owner_name').notNull(),
  ownerContact: text('owner_contact').notNull(),
  ownerVillage: text('owner_village').notNull(),
  district: text('district').notNull(),
  state: text('state').notNull(),
  gpsLocation: jsonb('gps_location').notNull().$type<{
    lat: number;
    lng: number;
    district?: string;
    state?: string;
    locationName?: string;
    country?: string;
    accuracyMeters?: number;
    timestamp: string;
    isLiveLocation?: boolean;
  }>(),
  currentStatus: text('current_status').notNull().default('Healthy'), // 'Healthy' | 'Observation' | 'Moderate Concern' | 'Critical / Flagged'
  lastAssessmentDate: text('last_assessment_date').notNull(),
  thumbnailUrl: text('thumbnail_url').notNull(),
  bodyConditionScore: doublePrecision('body_condition_score').notNull().default(3.0),
  pregnancyStatus: text('pregnancy_status'),
  lactationStatus: text('lactation_status'),
  dailyMilkYieldLiters: doublePrecision('daily_milk_yield_liters'),
  lactationStageDays: integer('lactation_stage_days'),
  inseminationDate: text('insemination_date'),
  expectedCalvingDate: text('expected_calving_date'),
  vaccinations: jsonb('vaccinations').notNull().default([]).$type<{
    name: string;
    date: string;
    nextDueDate: string;
    batchNo: string;
  }[]>(),
  assessmentsCount: integer('assessments_count').notNull().default(0),
  quarantineStatus: text('quarantine_status'),
  reports: jsonb('reports').default([]).$type<any[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Diagnostic Assessments Table (Mirroring DiagnosticAssessment from src/types.ts)
export const diagnosticAssessments = pgTable('diagnostic_assessments', {
  id: text('id').primaryKey(),
  animalId: text('animal_id').notNull(),
  timestamp: text('timestamp').notNull(),
  imageUrl: text('image_url').notNull(),
  predictedBreed: text('predicted_breed').notNull(),
  breedConfidence: doublePrecision('breed_confidence').notNull().default(0.85),
  detectedSpecies: text('detected_species').notNull().default('Cattle'),
  coatCondition: text('coat_condition').notNull().default('Glossy & Healthy'),
  postureAssessment: jsonb('posture_assessment').notNull().$type<{
    spineCurvature: 'Normal Straight' | 'Kyphosis (Hunched)' | 'Lordosis (Dropped)';
    headCarriage: 'Alert & Elevated' | 'Depressed / Drooping';
    weightBearing: 'Equal on all 4 limbs' | 'Antalgic (Shifting/Limping)';
    gaitConfidence: number;
  }>(),
  bodyConditionScore: doublePrecision('body_condition_score').notNull().default(3.0),
  conformationalMetrics: jsonb('conformational_metrics').notNull().default([]).$type<any[]>(),
  lesions: jsonb('lesions').notNull().default([]).$type<any[]>(),
  primaryDiagnosis: text('primary_diagnosis').notNull(),
  isDiseased: text('is_diseased'), // boolean string or stored flag
  diseaseIdentified: text('disease_identified'),
  diseaseCommonName: text('disease_common_name'),
  diseaseStatus: text('disease_status'),
  diseaseSummaryStatement: text('disease_summary_statement'),
  audioNarration: text('audio_narration'),
  symptomsObserved: jsonb('symptoms_observed').$type<string[]>(),
  differentialDiagnoses: jsonb('differential_diagnoses').notNull().default([]).$type<any[]>(),
  severityGrade: text('severity_grade').notNull().default('Mild'),
  pregnancyStatus: text('pregnancy_status'),
  lactationStatus: text('lactation_status'),
  milkYieldImpact: text('milk_yield_impact'),
  reproductiveAndLactationAlerts: jsonb('reproductive_and_lactation_alerts').$type<any>(),
  ragCitations: jsonb('rag_citations').notNull().default([]).$type<any[]>(),
  immediateRemedies: jsonb('immediate_remedies').notNull().default([]).$type<string[]>(),
  recommendedVeterinaryActions: jsonb('recommended_veterinary_actions').notNull().default([]).$type<string[]>(),
  biosecurityProtocol: jsonb('biosecurity_protocol').notNull().default([]).$type<string[]>(),
  gpsMetadata: jsonb('gps_metadata').notNull().$type<{
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
  }>(),
  audioNarrativeUrl: text('audio_narrative_url'),
  audioLanguage: text('audio_language'),
  reviewedByOfficer: jsonb('reviewed_by_officer').$type<{
    officerName: string;
    officerBadge: string;
    reviewedAt: string;
    officialRemarks: string;
    quarantineIssued: boolean;
  }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
