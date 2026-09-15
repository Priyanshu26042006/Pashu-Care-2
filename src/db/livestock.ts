import { db } from './index';
import { animals, assessments, outbreakAlerts, uploadedImages } from './schema';
import { eq, desc } from 'drizzle-orm';
import { AnimalProfile, CattleFormalReport, DiagnosticAssessment, OutbreakAlert } from '../types';

export async function getAllAnimals(): Promise<AnimalProfile[]> {
  try {
    const rows = await db.select().from(animals).orderBy(desc(animals.createdAt));
    return rows.map((r) => ({
      id: r.id,
      earTagNumber: r.earTagNumber,
      name: r.name || undefined,
      species: r.species as any,
      breed: r.breed,
      estimatedAgeMonths: r.estimatedAgeMonths,
      gender: r.gender as any,
      weightKg: r.weightKg,
      ownerName: r.ownerName || '',
      ownerContact: r.ownerContact || '',
      ownerVillage: r.ownerVillage || '',
      district: r.district || '',
      state: r.state || '',
      gpsLocation: r.gpsLocation as any,
      currentStatus: r.currentStatus as any,
      lastAssessmentDate: r.lastAssessmentDate || '',
      thumbnailUrl: r.thumbnailUrl || '',
      bodyConditionScore: r.bodyConditionScore,
      pregnancyStatus: (r.pregnancyStatus as any) || undefined,
      lactationStatus: (r.lactationStatus as any) || undefined,
      dailyMilkYieldLiters: r.dailyMilkYieldLiters ?? undefined,
      lactationStageDays: r.lactationStageDays ?? undefined,
      inseminationDate: r.inseminationDate || undefined,
      expectedCalvingDate: r.expectedCalvingDate || undefined,
      vaccinations: (r.vaccinations as any) || [],
      assessmentsCount: r.assessmentsCount,
      quarantineStatus: (r.quarantineStatus as any) || 'None',
      reports: (r.reports as any) || [],
    }));
  } catch (err) {
    console.error('Failed to get animals from Cloud SQL:', err);
    throw new Error('Failed to retrieve livestock profiles', { cause: err });
  }
}

export async function upsertAnimal(profile: AnimalProfile): Promise<AnimalProfile> {
  try {
    const result = await db
      .insert(animals)
      .values({
        id: profile.id,
        earTagNumber: profile.earTagNumber,
        name: profile.name || null,
        species: profile.species,
        breed: profile.breed,
        estimatedAgeMonths: profile.estimatedAgeMonths,
        gender: profile.gender,
        weightKg: profile.weightKg,
        ownerName: profile.ownerName || null,
        ownerContact: profile.ownerContact || null,
        ownerVillage: profile.ownerVillage || null,
        district: profile.district || null,
        state: profile.state || null,
        gpsLocation: profile.gpsLocation,
        currentStatus: profile.currentStatus,
        lastAssessmentDate: profile.lastAssessmentDate || null,
        thumbnailUrl: profile.thumbnailUrl || null,
        bodyConditionScore: profile.bodyConditionScore,
        pregnancyStatus: profile.pregnancyStatus || null,
        lactationStatus: profile.lactationStatus || null,
        dailyMilkYieldLiters: profile.dailyMilkYieldLiters ?? null,
        lactationStageDays: profile.lactationStageDays ?? null,
        inseminationDate: profile.inseminationDate || null,
        expectedCalvingDate: profile.expectedCalvingDate || null,
        vaccinations: profile.vaccinations || [],
        assessmentsCount: profile.assessmentsCount,
        quarantineStatus: profile.quarantineStatus || 'None',
        reports: profile.reports || [],
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: animals.id,
        set: {
          earTagNumber: profile.earTagNumber,
          name: profile.name || null,
          species: profile.species,
          breed: profile.breed,
          estimatedAgeMonths: profile.estimatedAgeMonths,
          gender: profile.gender,
          weightKg: profile.weightKg,
          ownerName: profile.ownerName || null,
          ownerContact: profile.ownerContact || null,
          ownerVillage: profile.ownerVillage || null,
          district: profile.district || null,
          state: profile.state || null,
          gpsLocation: profile.gpsLocation,
          currentStatus: profile.currentStatus,
          lastAssessmentDate: profile.lastAssessmentDate || null,
          thumbnailUrl: profile.thumbnailUrl || null,
          bodyConditionScore: profile.bodyConditionScore,
          pregnancyStatus: profile.pregnancyStatus || null,
          lactationStatus: profile.lactationStatus || null,
          dailyMilkYieldLiters: profile.dailyMilkYieldLiters ?? null,
          lactationStageDays: profile.lactationStageDays ?? null,
          inseminationDate: profile.inseminationDate || null,
          expectedCalvingDate: profile.expectedCalvingDate || null,
          vaccinations: profile.vaccinations || [],
          assessmentsCount: profile.assessmentsCount,
          quarantineStatus: profile.quarantineStatus || 'None',
          reports: profile.reports || [],
          updatedAt: new Date(),
        },
      })
      .returning();

    const r = result[0];
    return {
      id: r.id,
      earTagNumber: r.earTagNumber,
      name: r.name || undefined,
      species: r.species as any,
      breed: r.breed,
      estimatedAgeMonths: r.estimatedAgeMonths,
      gender: r.gender as any,
      weightKg: r.weightKg,
      ownerName: r.ownerName || '',
      ownerContact: r.ownerContact || '',
      ownerVillage: r.ownerVillage || '',
      district: r.district || '',
      state: r.state || '',
      gpsLocation: r.gpsLocation as any,
      currentStatus: r.currentStatus as any,
      lastAssessmentDate: r.lastAssessmentDate || '',
      thumbnailUrl: r.thumbnailUrl || '',
      bodyConditionScore: r.bodyConditionScore,
      pregnancyStatus: (r.pregnancyStatus as any) || undefined,
      lactationStatus: (r.lactationStatus as any) || undefined,
      dailyMilkYieldLiters: r.dailyMilkYieldLiters ?? undefined,
      lactationStageDays: r.lactationStageDays ?? undefined,
      inseminationDate: r.inseminationDate || undefined,
      expectedCalvingDate: r.expectedCalvingDate || undefined,
      vaccinations: (r.vaccinations as any) || [],
      assessmentsCount: r.assessmentsCount,
      quarantineStatus: (r.quarantineStatus as any) || 'None',
      reports: (r.reports as any) || [],
    };
  } catch (err) {
    console.error('Failed to upsert animal into Cloud SQL:', err);
    throw new Error('Failed to persist livestock profile', { cause: err });
  }
}

export async function getAllAssessments(): Promise<DiagnosticAssessment[]> {
  try {
    const rows = await db.select().from(assessments).orderBy(desc(assessments.createdAt));
    return rows.map((r) => ({
      id: r.id,
      animalId: r.animalId,
      timestamp: r.timestamp,
      imageUrl: r.imageUrl,
      predictedBreed: r.predictedBreed,
      breedConfidence: r.breedConfidence,
      detectedSpecies: r.detectedSpecies,
      coatCondition: r.coatCondition as any,
      postureAssessment: r.postureAssessment as any,
      bodyConditionScore: r.bodyConditionScore,
      conformationalMetrics: (r.conformationalMetrics as any) || [],
      lesions: (r.lesions as any) || [],
      primaryDiagnosis: r.primaryDiagnosis,
      isDiseased: r.isDiseased,
      diseaseIdentified: r.diseaseIdentified || undefined,
      diseaseCommonName: r.diseaseCommonName || undefined,
      diseaseStatus: r.diseaseStatus || undefined,
      diseaseSummaryStatement: r.diseaseSummaryStatement || undefined,
      symptomsObserved: (r.symptomsObserved as any) || [],
      differentialDiagnoses: (r.differentialDiagnoses as any) || [],
      severityGrade: r.severityGrade as any,
      pregnancyStatus: (r.pregnancyStatus as any) || undefined,
      lactationStatus: (r.lactationStatus as any) || undefined,
      milkYieldImpact: r.milkYieldImpact || undefined,
      reproductiveAndLactationAlerts: (r.reproductiveAndLactationAlerts as any) || undefined,
      ragCitations: (r.ragCitations as any) || [],
      immediateRemedies: (r.immediateRemedies as any) || [],
      recommendedVeterinaryActions: (r.recommendedVeterinaryActions as any) || [],
      biosecurityProtocol: (r.biosecurityProtocol as any) || [],
      gpsMetadata: r.gpsMetadata as any,
      audioNarrativeUrl: r.audioNarrativeUrl || undefined,
      audioLanguage: r.audioLanguage || undefined,
      reviewedByOfficer: (r.reviewedByOfficer as any) || undefined,
    }));
  } catch (err) {
    console.error('Failed to get assessments from Cloud SQL:', err);
    throw new Error('Failed to retrieve diagnostic assessments', { cause: err });
  }
}

export async function insertAssessment(diag: DiagnosticAssessment): Promise<DiagnosticAssessment> {
  try {
    const result = await db
      .insert(assessments)
      .values({
        id: diag.id,
        animalId: diag.animalId,
        timestamp: diag.timestamp,
        imageUrl: diag.imageUrl,
        predictedBreed: diag.predictedBreed,
        breedConfidence: diag.breedConfidence,
        detectedSpecies: diag.detectedSpecies,
        coatCondition: diag.coatCondition || null,
        postureAssessment: diag.postureAssessment || null,
        bodyConditionScore: diag.bodyConditionScore,
        conformationalMetrics: diag.conformationalMetrics || [],
        lesions: diag.lesions || [],
        primaryDiagnosis: diag.primaryDiagnosis,
        isDiseased: diag.isDiseased ?? false,
        diseaseIdentified: diag.diseaseIdentified || null,
        diseaseCommonName: diag.diseaseCommonName || null,
        diseaseStatus: diag.diseaseStatus || null,
        diseaseSummaryStatement: diag.diseaseSummaryStatement || null,
        symptomsObserved: diag.symptomsObserved || [],
        differentialDiagnoses: diag.differentialDiagnoses || [],
        severityGrade: diag.severityGrade,
        pregnancyStatus: diag.pregnancyStatus || null,
        lactationStatus: diag.lactationStatus || null,
        milkYieldImpact: diag.milkYieldImpact || null,
        reproductiveAndLactationAlerts: diag.reproductiveAndLactationAlerts || null,
        ragCitations: diag.ragCitations || [],
        immediateRemedies: diag.immediateRemedies || [],
        recommendedVeterinaryActions: diag.recommendedVeterinaryActions || [],
        biosecurityProtocol: diag.biosecurityProtocol || [],
        gpsMetadata: diag.gpsMetadata,
        audioNarrativeUrl: diag.audioNarrativeUrl || null,
        audioLanguage: diag.audioLanguage || null,
        reviewedByOfficer: diag.reviewedByOfficer || null,
      })
      .returning();

    const r = result[0];
    return {
      id: r.id,
      animalId: r.animalId,
      timestamp: r.timestamp,
      imageUrl: r.imageUrl,
      predictedBreed: r.predictedBreed,
      breedConfidence: r.breedConfidence,
      detectedSpecies: r.detectedSpecies,
      coatCondition: r.coatCondition as any,
      postureAssessment: r.postureAssessment as any,
      bodyConditionScore: r.bodyConditionScore,
      conformationalMetrics: (r.conformationalMetrics as any) || [],
      lesions: (r.lesions as any) || [],
      primaryDiagnosis: r.primaryDiagnosis,
      isDiseased: r.isDiseased,
      diseaseIdentified: r.diseaseIdentified || undefined,
      diseaseCommonName: r.diseaseCommonName || undefined,
      diseaseStatus: r.diseaseStatus || undefined,
      diseaseSummaryStatement: r.diseaseSummaryStatement || undefined,
      symptomsObserved: (r.symptomsObserved as any) || [],
      differentialDiagnoses: (r.differentialDiagnoses as any) || [],
      severityGrade: r.severityGrade as any,
      pregnancyStatus: (r.pregnancyStatus as any) || undefined,
      lactationStatus: (r.lactationStatus as any) || undefined,
      milkYieldImpact: r.milkYieldImpact || undefined,
      reproductiveAndLactationAlerts: (r.reproductiveAndLactationAlerts as any) || undefined,
      ragCitations: (r.ragCitations as any) || [],
      immediateRemedies: (r.immediateRemedies as any) || [],
      recommendedVeterinaryActions: (r.recommendedVeterinaryActions as any) || [],
      biosecurityProtocol: (r.biosecurityProtocol as any) || [],
      gpsMetadata: r.gpsMetadata as any,
      audioNarrativeUrl: r.audioNarrativeUrl || undefined,
      audioLanguage: r.audioLanguage || undefined,
      reviewedByOfficer: (r.reviewedByOfficer as any) || undefined,
    };
  } catch (err) {
    console.error('Failed to insert assessment into Cloud SQL:', err);
    throw new Error('Failed to persist assessment', { cause: err });
  }
}

export async function addReportToAnimal(animalId: string, report: CattleFormalReport): Promise<void> {
  try {
    const existing = await db.select().from(animals).where(eq(animals.id, animalId)).limit(1);
    if (existing.length > 0) {
      const currentReports = (existing[0].reports as any[]) || [];
      await db
        .update(animals)
        .set({
          reports: [report, ...currentReports],
          updatedAt: new Date(),
        })
        .where(eq(animals.id, animalId));
    }
  } catch (err) {
    console.error('Failed to add formal report to animal in Cloud SQL:', err);
    throw new Error('Failed to save report', { cause: err });
  }
}

export async function saveImageToStorage(fileKey: string, mimeType: string, imageData: string): Promise<string> {
  try {
    await db
      .insert(uploadedImages)
      .values({
        fileKey,
        mimeType,
        imageData,
      })
      .onConflictDoNothing();
    return `/api/storage/${fileKey}`;
  } catch (err) {
    console.error('Failed to save image in Cloud SQL storage:', err);
    throw new Error('Failed to store image', { cause: err });
  }
}

export async function getImageFromStorage(fileKey: string) {
  try {
    const rows = await db.select().from(uploadedImages).where(eq(uploadedImages.fileKey, fileKey)).limit(1);
    return rows[0] || null;
  } catch (err) {
    console.error('Failed to read image from Cloud SQL storage:', err);
    return null;
  }
}

export async function seedInitialData(
  defaultAnimals: AnimalProfile[],
  defaultAssessments: DiagnosticAssessment[],
  defaultAlerts: OutbreakAlert[]
) {
  try {
    const count = await db.select().from(animals).limit(1);
    if (count.length === 0) {
      console.log('Seeding initial animals and assessments into Cloud SQL PostgreSQL...');
      for (const a of defaultAnimals) {
        await upsertAnimal(a);
      }
      for (const diag of defaultAssessments) {
        await insertAssessment(diag);
      }
      for (const alert of defaultAlerts) {
        await db
          .insert(outbreakAlerts)
          .values({
            id: alert.id,
            diseaseName: alert.diseaseName,
            affectedBreed: alert.affectedBreed,
            district: alert.district,
            state: alert.state,
            activeCasesCount: alert.activeCasesCount,
            riskLevel: alert.riskLevel,
            centerCoords: alert.centerCoords,
            radiusKm: alert.radiusKm,
            lastUpdated: alert.lastUpdated,
            actionRequired: alert.actionRequired,
          })
          .onConflictDoNothing();
      }
      console.log('Initial Cloud SQL seed completed successfully.');
    }
  } catch (e) {
    console.warn('Notice during database initial seeding:', e);
  }
}
