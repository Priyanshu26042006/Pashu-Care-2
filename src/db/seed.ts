import { db, getPool, isDatabaseConfigured } from './index';
import { animals, diagnosticAssessments, users } from './schema';
import { eq, desc } from 'drizzle-orm';
import { INITIAL_ANIMAL_PROFILES, INITIAL_ASSESSMENTS } from '../data/mockLivestockData';

/**
 * Initializes tables if not already created, then seeds default data if tables are empty.
 */
export async function ensureDatabaseSeeded() {
  if (!isDatabaseConfigured()) {
    console.log('PostgreSQL database not configured yet (DATABASE_URL pending). In-memory mock profiles are active.');
    return;
  }
  try {
    const pool = getPool();
    if (!pool) return;

    // Auto-create tables if they don't exist yet
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        name text NOT NULL,
        role text NOT NULL,
        phone text,
        email text,
        village text,
        district text NOT NULL,
        state text NOT NULL,
        badge_number text,
        registration_number text,
        designation text,
        avatar_url text,
        assigned_cattle_ids jsonb,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS animals (
        id text PRIMARY KEY,
        ear_tag_number text NOT NULL,
        name text,
        species text NOT NULL,
        breed text NOT NULL,
        estimated_age_months integer DEFAULT 36 NOT NULL,
        gender text DEFAULT 'Female' NOT NULL,
        weight_kg double precision DEFAULT 400 NOT NULL,
        owner_name text NOT NULL,
        owner_contact text NOT NULL,
        owner_village text NOT NULL,
        district text NOT NULL,
        state text NOT NULL,
        gps_location jsonb NOT NULL,
        current_status text DEFAULT 'Healthy' NOT NULL,
        last_assessment_date text NOT NULL,
        thumbnail_url text NOT NULL,
        body_condition_score double precision DEFAULT 3.0 NOT NULL,
        pregnancy_status text,
        lactation_status text,
        daily_milk_yield_liters double precision,
        lactation_stage_days integer,
        insemination_date text,
        expected_calving_date text,
        vaccinations jsonb DEFAULT '[]'::jsonb NOT NULL,
        assessments_count integer DEFAULT 0 NOT NULL,
        quarantine_status text,
        reports jsonb DEFAULT '[]'::jsonb,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS diagnostic_assessments (
        id text PRIMARY KEY,
        animal_id text NOT NULL,
        timestamp text NOT NULL,
        image_url text NOT NULL,
        predicted_breed text NOT NULL,
        breed_confidence double precision DEFAULT 0.85 NOT NULL,
        detected_species text DEFAULT 'Cattle' NOT NULL,
        coat_condition text DEFAULT 'Glossy & Healthy' NOT NULL,
        posture_assessment jsonb NOT NULL,
        body_condition_score double precision DEFAULT 3.0 NOT NULL,
        conformational_metrics jsonb DEFAULT '[]'::jsonb NOT NULL,
        lesions jsonb DEFAULT '[]'::jsonb NOT NULL,
        primary_diagnosis text NOT NULL,
        is_diseased text,
        disease_identified text,
        disease_common_name text,
        disease_status text,
        disease_summary_statement text,
        audio_narration text,
        symptoms_observed jsonb,
        differential_diagnoses jsonb DEFAULT '[]'::jsonb NOT NULL,
        severity_grade text DEFAULT 'Mild' NOT NULL,
        pregnancy_status text,
        lactation_status text,
        milk_yield_impact text,
        reproductive_and_lactation_alerts jsonb,
        rag_citations jsonb DEFAULT '[]'::jsonb NOT NULL,
        immediate_remedies jsonb DEFAULT '[]'::jsonb NOT NULL,
        recommended_veterinary_actions jsonb DEFAULT '[]'::jsonb NOT NULL,
        biosecurity_protocol jsonb DEFAULT '[]'::jsonb NOT NULL,
        gps_metadata jsonb NOT NULL,
        audio_narrative_url text,
        audio_language text,
        reviewed_by_officer jsonb,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `);

    const existingAnimals = await db.select({ id: animals.id }).from(animals).limit(1);
    if (existingAnimals.length === 0) {
      console.log('Seeding initial animal profiles into PostgreSQL database...');
      for (const animal of INITIAL_ANIMAL_PROFILES) {
        await db.insert(animals).values({
          id: animal.id,
          earTagNumber: animal.earTagNumber,
          name: animal.name || null,
          species: animal.species,
          breed: animal.breed,
          estimatedAgeMonths: animal.estimatedAgeMonths || 36,
          gender: animal.gender || 'Female',
          weightKg: animal.weightKg || 400,
          ownerName: animal.ownerName,
          ownerContact: animal.ownerContact,
          ownerVillage: animal.ownerVillage,
          district: animal.district,
          state: animal.state,
          gpsLocation: animal.gpsLocation,
          currentStatus: animal.currentStatus,
          lastAssessmentDate: animal.lastAssessmentDate,
          thumbnailUrl: animal.thumbnailUrl,
          bodyConditionScore: animal.bodyConditionScore,
          pregnancyStatus: animal.pregnancyStatus || null,
          lactationStatus: animal.lactationStatus || null,
          dailyMilkYieldLiters: animal.dailyMilkYieldLiters || null,
          lactationStageDays: animal.lactationStageDays || null,
          inseminationDate: animal.inseminationDate || null,
          expectedCalvingDate: animal.expectedCalvingDate || null,
          vaccinations: animal.vaccinations || [],
          assessmentsCount: animal.assessmentsCount || 0,
          quarantineStatus: animal.quarantineStatus || null,
          reports: animal.reports || [],
        }).onConflictDoNothing();
      }
      console.log('Initial animal profiles successfully seeded.');
    }

    const existingAssessments = await db.select({ id: diagnosticAssessments.id }).from(diagnosticAssessments).limit(1);
    if (existingAssessments.length === 0) {
      console.log('Seeding initial diagnostic assessments into PostgreSQL database...');
      for (const assessment of INITIAL_ASSESSMENTS) {
        await db.insert(diagnosticAssessments).values({
          id: assessment.id,
          animalId: assessment.animalId,
          timestamp: assessment.timestamp,
          imageUrl: assessment.imageUrl,
          predictedBreed: assessment.predictedBreed,
          breedConfidence: assessment.breedConfidence || 0.85,
          detectedSpecies: assessment.detectedSpecies || 'Cattle',
          coatCondition: assessment.coatCondition || 'Glossy & Healthy',
          postureAssessment: assessment.postureAssessment,
          bodyConditionScore: assessment.bodyConditionScore,
          conformationalMetrics: assessment.conformationalMetrics || [],
          lesions: assessment.lesions || [],
          primaryDiagnosis: assessment.primaryDiagnosis,
          isDiseased: assessment.isDiseased ? 'true' : 'false',
          diseaseIdentified: assessment.diseaseIdentified || null,
          diseaseCommonName: assessment.diseaseCommonName || null,
          diseaseStatus: assessment.diseaseStatus || null,
          diseaseSummaryStatement: assessment.diseaseSummaryStatement || null,
          audioNarration: assessment.audioNarration || null,
          symptomsObserved: assessment.symptomsObserved || [],
          differentialDiagnoses: assessment.differentialDiagnoses || [],
          severityGrade: assessment.severityGrade || 'Mild',
          pregnancyStatus: assessment.pregnancyStatus || null,
          lactationStatus: assessment.lactationStatus || null,
          milkYieldImpact: assessment.milkYieldImpact || null,
          reproductiveAndLactationAlerts: assessment.reproductiveAndLactationAlerts || null,
          ragCitations: assessment.ragCitations || [],
          immediateRemedies: assessment.immediateRemedies || [],
          recommendedVeterinaryActions: assessment.recommendedVeterinaryActions || [],
          biosecurityProtocol: assessment.biosecurityProtocol || [],
          gpsMetadata: assessment.gpsMetadata,
          audioNarrativeUrl: assessment.audioNarrativeUrl || null,
          audioLanguage: assessment.audioLanguage || null,
          reviewedByOfficer: assessment.reviewedByOfficer || null,
        }).onConflictDoNothing();
      }
      console.log('Initial diagnostic assessments successfully seeded.');
    }
  } catch (err) {
    console.warn('Database seed error:', err);
  }
}
