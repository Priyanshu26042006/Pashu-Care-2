/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { CameraCaptureModal } from './components/farmer/CameraCaptureModal';
import { DiagnosticReportModal } from './components/farmer/DiagnosticReportModal';
import { AnimalDetailModal } from './components/farmer/AnimalDetailModal';
import { OfficerDashboard } from './components/officer/OfficerDashboard';
import { AnimalProfile, DiagnosticAssessment, SupportedLanguage } from './types';
import { INITIAL_ANIMAL_PROFILES, INITIAL_ASSESSMENTS } from './data/mockLivestockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'farmer' | 'officer'>('farmer');
  const [language, setLanguage] = useState<SupportedLanguage>('hi');
  const [animals, setAnimals] = useState<AnimalProfile[]>(INITIAL_ANIMAL_PROFILES);
  const [assessments, setAssessments] = useState<DiagnosticAssessment[]>(INITIAL_ASSESSMENTS);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<DiagnosticAssessment | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalProfile | null>(null);

  // Count flagged cases for nav badge
  const flaggedCount = assessments.filter(
    (a) => a.severityGrade === 'Severe' || a.severityGrade === 'Emergency Quarantine' || a.severityGrade === 'Moderate'
  ).length;

  const handleOpenScan = (animal?: AnimalProfile) => {
    setIsCameraOpen(true);
  };

  const handleAssessmentComplete = (newAssessment: DiagnosticAssessment) => {
    setAssessments((prev) => [newAssessment, ...prev]);

    // Update or add corresponding animal profile
    setAnimals((prev) => {
      const matchIndex = prev.findIndex((a) => a.id === newAssessment.animalId || a.breed.toLowerCase().includes(newAssessment.predictedBreed.split(' ')[0].toLowerCase()));
      if (matchIndex >= 0) {
        const updated = [...prev];
        const current = updated[matchIndex];
        updated[matchIndex] = {
          ...current,
          lastAssessmentDate: newAssessment.timestamp,
          bodyConditionScore: newAssessment.bodyConditionScore,
          currentStatus: newAssessment.severityGrade === 'Emergency Quarantine'
            ? 'Critical / Flagged'
            : newAssessment.severityGrade === 'Severe'
            ? 'Critical / Flagged'
            : newAssessment.severityGrade === 'Moderate'
            ? 'Moderate Concern'
            : 'Healthy',
          assessmentsCount: current.assessmentsCount + 1,
        };
        return updated;
      } else {
        // Create new animal profile record
        const newAnimal: AnimalProfile = {
          id: newAssessment.animalId,
          earTagNumber: `IN-DLM-${Math.floor(1000 + Math.random() * 9000)}`,
          name: `${newAssessment.predictedBreed.split(' ')[0]} Specimen`,
          species: (newAssessment.detectedSpecies as any) || 'Cattle',
          breed: newAssessment.predictedBreed,
          estimatedAgeMonths: 36,
          gender: 'Female',
          weightKg: 420,
          ownerName: 'Registered Livestock Farmer',
          ownerContact: '+91 98000 00000',
          ownerVillage: 'Field Station',
          district: newAssessment.gpsMetadata.district,
          state: newAssessment.gpsMetadata.state,
          gpsLocation: {
            lat: newAssessment.gpsMetadata.lat,
            lng: newAssessment.gpsMetadata.lng,
            timestamp: newAssessment.timestamp,
          },
          currentStatus: newAssessment.severityGrade === 'Emergency Quarantine' || newAssessment.severityGrade === 'Severe'
            ? 'Critical / Flagged'
            : 'Moderate Concern',
          lastAssessmentDate: newAssessment.timestamp,
          thumbnailUrl: newAssessment.imageUrl,
          bodyConditionScore: newAssessment.bodyConditionScore,
          vaccinations: [
            { name: 'FMD Oil Adjuvant Vaccine', date: '2026-02-10', nextDueDate: '2026-08-10', batchNo: 'FMD-IN-901' }
          ],
          assessmentsCount: 1,
          quarantineStatus: newAssessment.severityGrade === 'Emergency Quarantine' ? 'Enforced' : 'None',
        };
        return [newAnimal, ...prev];
      }
    });

    // Open clinical report view immediately
    setSelectedAssessment(newAssessment);
  };

  const handleFlagForOfficerReview = (assessmentId: string) => {
    // Notify officer queue
    setActiveTab('officer');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white antialiased">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        onOpenNewScan={() => handleOpenScan()}
        flaggedCount={flaggedCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'farmer' && (
          <FarmerDashboard
            animals={animals}
            onOpenScan={handleOpenScan}
            onSelectAnimal={(animal) => setSelectedAnimal(animal)}
            onViewAssessment={(id) => {
              const match = assessments.find((a) => a.id === id) || assessments[0];
              setSelectedAssessment(match);
            }}
            language={language}
          />
        )}

        {activeTab === 'officer' && (
          <OfficerDashboard
            animals={animals}
            assessments={assessments}
            onViewAssessment={(diag) => setSelectedAssessment(diag)}
          />
        )}
      </main>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onAssessmentComplete={handleAssessmentComplete}
        language={language}
      />

      {/* Diagnostic Report Modal */}
      <DiagnosticReportModal
        assessment={selectedAssessment}
        onClose={() => setSelectedAssessment(null)}
        language={language}
        onFlagForOfficerReview={handleFlagForOfficerReview}
      />

      {/* Animal Detail Modal */}
      <AnimalDetailModal
        animal={selectedAnimal}
        onClose={() => setSelectedAnimal(null)}
        onScanThisAnimal={(anim) => {
          setSelectedAnimal(null);
          setIsCameraOpen(true);
        }}
        onViewDiagnosticReport={(id) => {
          const match = assessments.find((a) => a.animalId === selectedAnimal?.id) || assessments[0];
          setSelectedAssessment(match);
        }}
        language={language}
      />

      {/* Bottom Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 text-center space-y-1 mt-auto">
        <p className="font-semibold text-slate-700">
          PashuHealth AI • National Multi-Modal Livestock Health Intelligence & RAG Diagnostic Architecture
        </p>
        <p className="text-[11px] text-slate-400">
          Integrated with Bharat Pashudhan (NDLM), IEEE Dataport & CID Datasets • Edge & Cloud Veterinary Microservices
        </p>
      </footer>

    </div>
  );
}
