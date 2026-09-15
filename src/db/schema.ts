import { pgTable, text, serial, integer, doublePrecision, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Users table with Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID or Unique ID
  email: text('email'),
  name: text('name').notNull(),
  role: text('role').notNull().default('farmer'), // 'farmer' | 'veterinarian'
  phone: text('phone'),
  village: text('village'),
  district: text('district'),
  state: text('state'),
  badgeNumber: text('badge_number'),
  registrationNumber: text('registration_number'),
  designation: text('designation'),
  avatarUrl: text('avatar_url'),
  assignedCattleIds: jsonb('assigned_cattle_ids'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Animals / Cattle Livestock Profiles
export const animals = pgTable('animals', {
  id: text('id').primaryKey(), // e.g. 'COW-001'
  earTagNumber: text('ear_tag_number').notNull().unique(),
  name: text('name'),
  species: text('species').notNull().default('Cattle'),
  breed: text('breed').notNull(),
  estimatedAgeMonths: integer('estimated_age_months').notNull().default(36),
  gender: text('gender').notNull().default('Female'),
  weightKg: integer('weight_kg').notNull().default(400),
  ownerName: text('owner_name'),
  ownerContact: text('owner_contact'),
  ownerVillage: text('owner_village'),
  district: text('district'),
  state: text('state'),
  gpsLocation: jsonb('gps_location').notNull(),
  currentStatus: text('current_status').notNull().default('Healthy'),
  lastAssessmentDate: text('last_assessment_date'),
  thumbnailUrl: text('thumbnail_url'),
  bodyConditionScore: doublePrecision('body_condition_score').notNull().default(3.0),
  pregnancyStatus: text('pregnancy_status'),
  lactationStatus: text('lactation_status'),
  dailyMilkYieldLiters: doublePrecision('daily_milk_yield_liters'),
  lactationStageDays: integer('lactation_stage_days'),
  inseminationDate: text('insemination_date'),
  expectedCalvingDate: text('expected_calving_date'),
  vaccinations: jsonb('vaccinations'),
  assessmentsCount: integer('assessments_count').notNull().default(0),
  quarantineStatus: text('quarantine_status').default('None'),
  reports: jsonb('reports'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// AI Diagnostic Assessments & Clinical Findings
export const assessments = pgTable('assessments', {
  id: text('id').primaryKey(),
  animalId: text('animal_id').notNull(),
  timestamp: text('timestamp').notNull(),
  imageUrl: text('image_url').notNull(),
  predictedBreed: text('predicted_breed').notNull(),
  breedConfidence: integer('breed_confidence').notNull().default(90),
  detectedSpecies: text('detected_species').notNull().default('Cattle'),
  coatCondition: text('coat_condition'),
  postureAssessment: jsonb('posture_assessment'),
  bodyConditionScore: doublePrecision('body_condition_score').notNull().default(3.0),
  conformationalMetrics: jsonb('conformational_metrics'),
  lesions: jsonb('lesions'),
  primaryDiagnosis: text('primary_diagnosis').notNull(),
  isDiseased: boolean('is_diseased').notNull().default(false),
  diseaseIdentified: text('disease_identified'),
  diseaseCommonName: text('disease_common_name'),
  diseaseStatus: text('disease_status'),
  diseaseSummaryStatement: text('disease_summary_statement'),
  symptomsObserved: jsonb('symptoms_observed'),
  differentialDiagnoses: jsonb('differential_diagnoses'),
  severityGrade: text('severity_grade').notNull().default('Healthy'),
  pregnancyStatus: text('pregnancy_status'),
  lactationStatus: text('lactation_status'),
  milkYieldImpact: text('milk_yield_impact'),
  reproductiveAndLactationAlerts: jsonb('reproductive_and_lactation_alerts'),
  ragCitations: jsonb('rag_citations'),
  immediateRemedies: jsonb('immediate_remedies'),
  recommendedVeterinaryActions: jsonb('recommended_veterinary_actions'),
  biosecurityProtocol: jsonb('biosecurity_protocol'),
  gpsMetadata: jsonb('gps_metadata').notNull(),
  audioNarrativeUrl: text('audio_narrative_url'),
  audioLanguage: text('audio_language'),
  reviewedByOfficer: jsonb('reviewed_by_officer'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Outbreak Alerts & Epidemiological Surveillance
export const outbreakAlerts = pgTable('outbreak_alerts', {
  id: text('id').primaryKey(),
  diseaseName: text('disease_name').notNull(),
  affectedBreed: text('affected_breed').notNull(),
  district: text('district').notNull(),
  state: text('state').notNull(),
  activeCasesCount: integer('active_cases_count').notNull().default(1),
  riskLevel: text('risk_level').notNull().default('Medium'),
  centerCoords: jsonb('center_coords').notNull(),
  radiusKm: integer('radius_km').notNull().default(25),
  lastUpdated: text('last_updated').notNull(),
  actionRequired: text('action_required').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Persistent Image / Document Storage
export const uploadedImages = pgTable('uploaded_images', {
  id: serial('id').primaryKey(),
  fileKey: text('file_key').notNull().unique(),
  mimeType: text('mime_type').notNull(),
  imageData: text('image_data').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
