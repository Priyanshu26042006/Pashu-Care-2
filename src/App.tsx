/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { CameraCaptureModal } from './components/farmer/CameraCaptureModal';
import { DiagnosticReportModal } from './components/farmer/DiagnosticReportModal';
import { AnimalDetailModal } from './components/farmer/AnimalDetailModal';
import { OfficerDashboard } from './components/officer/OfficerDashboard';
import { LoginScreen, DEMO_FARMERS, DEMO_VETS } from './components/auth/LoginScreen';
import { AnimalProfile, AuthUser, CattleFormalReport, DiagnosticAssessment, SupportedLanguage, UserRole } from './types';
import { INITIAL_ANIMAL_PROFILES, INITIAL_ASSESSMENTS } from './data/mockLivestockData';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

const STORAGE_KEY_USER = 'gausehat_current_user_session';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved user', e);
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<'farmer' | 'officer'>('farmer');
  const [language, setLanguage] = useState<SupportedLanguage>('hi');
  const [animals, setAnimals] = useState<AnimalProfile[]>(INITIAL_ANIMAL_PROFILES);
  const [assessments, setAssessments] = useState<DiagnosticAssessment[]>(INITIAL_ASSESSMENTS);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<DiagnosticAssessment | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalProfile | null>(null);
  const [escalationToast, setEscalationToast] = useState<string | null>(null);

  // Synchronize Tab permissions when role changes or initial load
  useEffect(() => {
    if (currentUser?.role === 'farmer' && activeTab === 'officer') {
      setActiveTab('farmer');
    }
  }, [currentUser, activeTab]);

  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user session', e);
    }

    if (user.role === 'veterinarian') {
      setActiveTab('officer');
    } else {
      setActiveTab('farmer');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch (e) {
      console.warn('Failed to clear session', e);
    }
    setCurrentUser(null);
    setActiveTab('farmer');
  };

  const handleSwitchUserPrompt = () => {
    handleLogout();
  };

  // Safe tab change guard
  const handleTabChange = (tab: 'farmer' | 'officer') => {
    if (tab === 'officer' && currentUser?.role === 'farmer') {
      // Block farmer from accessing officer view
      setEscalationToast('Access Restricted: Veterinary Officer portal requires authorized VCI credentials.');
      setTimeout(() => setEscalationToast(null), 4000);
      return;
    }
    setActiveTab(tab);
  };

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
      const matchIndex = prev.findIndex(
        (a) => a.id === newAssessment.animalId || a.breed.toLowerCase().includes(newAssessment.predictedBreed.split(' ')[0].toLowerCase())
      );
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
          ownerName: currentUser?.role === 'farmer' ? currentUser.name : 'Registered Livestock Farmer',
          ownerContact: currentUser?.phone || '+91 98000 00000',
          ownerVillage: currentUser?.village || 'Field Station',
          district: newAssessment.gpsMetadata.district || currentUser?.district || 'Satara',
          state: newAssessment.gpsMetadata.state || currentUser?.state || 'Maharashtra',
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
    if (currentUser?.role === 'veterinarian') {
      setActiveTab('officer');
    } else {
      setEscalationToast(`Case #${assessmentId.slice(-6)} escalated to District Veterinary Officer Dr. Arvind Shastri. SMS confirmation dispatched.`);
      setTimeout(() => setEscalationToast(null), 5000);
    }
  };

  const handleCreateSeparateReport = (report: CattleFormalReport, targetAnimalId?: string) => {
    setAnimals((prev) => {
      const targetId = targetAnimalId || report.animalId;
      const matchIndex = prev.findIndex(
        (a) => a.id === targetId || a.earTagNumber === report.animalEarTag
      );
      if (matchIndex >= 0) {
        const updated = [...prev];
        const target = updated[matchIndex];
        const existingReports = target.reports || [];
        updated[matchIndex] = {
          ...target,
          reports: [report, ...existingReports],
        };
        return updated;
      } else {
        // If registered as new specimen record
        const newAnimal: AnimalProfile = {
          id: report.animalId,
          earTagNumber: report.animalEarTag,
          name: report.animalName || `${report.breed.split(' ')[0]} Specimen`,
          species: (report.species as any) || 'Cattle',
          breed: report.breed,
          estimatedAgeMonths: 36,
          gender: 'Female',
          weightKg: 420,
          ownerName: currentUser?.role === 'farmer' ? currentUser.name : 'Registered Livestock Farmer',
          ownerContact: currentUser?.phone || '+91 98000 00000',
          ownerVillage: currentUser?.village || 'Field Station',
          district: report.gpsLocation.district || currentUser?.district || 'Satara',
          state: report.gpsLocation.state || currentUser?.state || 'Maharashtra',
          gpsLocation: {
            lat: report.gpsLocation.lat,
            lng: report.gpsLocation.lng,
            timestamp: report.createdAt,
          },
          currentStatus: report.severityGrade === 'Emergency Quarantine' || report.severityGrade === 'Severe'
            ? 'Critical / Flagged'
            : report.severityGrade === 'Moderate'
            ? 'Moderate Concern'
            : 'Healthy',
          lastAssessmentDate: report.createdAt,
          thumbnailUrl: report.imageUrl,
          bodyConditionScore: report.bcsScore,
          vaccinations: [
            { name: 'FMD Oil Adjuvant Vaccine', date: '2026-02-10', nextDueDate: '2026-08-10', batchNo: 'FMD-IN-901' }
          ],
          assessmentsCount: 1,
          quarantineStatus: report.severityGrade === 'Emergency Quarantine' ? 'Enforced' : 'None',
          reports: [report],
        };
        return [newAnimal, ...prev];
      }
    });

    setEscalationToast(`Official Health Report #${report.reportNumber} generated and added to Cattle Section.`);
    setTimeout(() => setEscalationToast(null), 5000);
  };

  // If not logged in, display the role-separated login screen
  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        language={language}
        setLanguage={setLanguage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white antialiased">
      
      {/* Top Navbar with Role Badging & Profile Actions */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        language={language}
        setLanguage={setLanguage}
        onOpenNewScan={() => handleOpenScan()}
        flaggedCount={flaggedCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUserPrompt={handleSwitchUserPrompt}
      />

      {/* Floating Action Alert / Escalation Toast */}
      {escalationToast && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-start space-x-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-emerald-300">NDLM Dispatch Confirmation</p>
            <p className="text-slate-200">{escalationToast}</p>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* STRICT ROLE ENFORCEMENT */}
        {/* 1. Farmer Portal: Accessible to both Farmer and Veterinary Officer */}
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

        {/* 2. Veterinary Officer Portal: STRICTLY ACCESSIBLE ONLY TO VETERINARY OFFICERS */}
        {activeTab === 'officer' && currentUser.role === 'veterinarian' && (
          <OfficerDashboard
            animals={animals}
            assessments={assessments}
            onViewAssessment={(diag) => setSelectedAssessment(diag)}
          />
        )}

        {/* Fallback Guard for Unauthorized Access */}
        {activeTab === 'officer' && currentUser.role !== 'veterinarian' && (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 max-w-lg mx-auto my-12">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Veterinary Command Portal Restricted</h3>
              <p className="text-xs text-slate-500">
                You are currently signed in under the Livestock Farmer profile ({currentUser.name}).
                The Veterinary Officer Command Center and regional quarantine tools are reserved for certified officers.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => setActiveTab('farmer')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer"
              >
                Return to Farmer Herd Portal
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Sign In as Veterinary Officer
              </button>
            </div>
          </div>
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
        animals={animals}
        currentUser={currentUser}
        onCreateSeparateReport={handleCreateSeparateReport}
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
      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-xs text-slate-500 text-center space-y-1.5 mt-auto">
        <p className="font-semibold text-slate-700">
          Gausehat • National Multi-Modal Livestock Health Intelligence & RAG Diagnostic Architecture
        </p>
        <p className="text-[11px] text-slate-400">
          Integrated with Bharat Pashudhan (NDLM), IEEE Dataport & CID Datasets • Edge & Cloud Veterinary Microservices
        </p>
      </footer>

    </div>
  );
}
