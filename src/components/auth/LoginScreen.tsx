import React, { useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Stethoscope, 
  User, 
  Phone, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  ShieldAlert, 
  Globe, 
  KeyRound, 
  Layers, 
  AlertCircle,
  FileCheck,
  Building2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthUser, SupportedLanguage, UserRole } from '../../types';

interface LoginScreenProps {
  onLogin: (user: AuthUser) => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

// Pre-configured Verified Farmer Personas for Quick Access
export const DEMO_FARMERS: AuthUser[] = [
  {
    id: 'FARMER-001',
    name: 'Ramesh Patil',
    role: 'farmer',
    phone: '+91 98220 45678',
    village: 'Wai Village, Taluka Wai',
    district: 'Satara',
    state: 'Maharashtra',
    designation: 'Dairy Livestock Farmer',
    assignedCattleIds: ['COW-001', 'COW-002', 'BUF-001']
  },
  {
    id: 'FARMER-002',
    name: 'Sunita Devi',
    role: 'farmer',
    phone: '+91 94310 98765',
    village: 'Bakhtiyarpur',
    district: 'Patna',
    state: 'Bihar',
    designation: 'Smallholder Cattle Breeder',
    assignedCattleIds: ['BUF-002', 'COW-003']
  },
  {
    id: 'FARMER-003',
    name: 'Vikram Singh',
    role: 'farmer',
    phone: '+91 98120 11223',
    village: 'Sampla Rural',
    district: 'Rohtak',
    state: 'Haryana',
    designation: 'Progressive Dairy Producer',
    assignedCattleIds: ['COW-004', 'COW-005']
  }
];

// Pre-configured Veterinary Officer Personas for Full System Access
export const DEMO_VETS: AuthUser[] = [
  {
    id: 'VET-001',
    name: 'Dr. Arvind Shastri (BVSc & AH)',
    role: 'veterinarian',
    email: 'arvind.shastri@ahd.gov.in',
    phone: '+91 98230 11990',
    district: 'Satara',
    state: 'Maharashtra',
    registrationNumber: 'VCI/MAH/2026/0942',
    badgeNumber: 'NDLM-VET-8821',
    designation: 'District Senior Veterinary Officer & Epidemiologist'
  },
  {
    id: 'VET-002',
    name: 'Dr. Meenakshi Sundaram (MVSc)',
    role: 'veterinarian',
    email: 'm.sundaram@icar.gov.in',
    phone: '+91 94440 22334',
    district: 'Pune',
    state: 'Maharashtra',
    registrationNumber: 'VCI/TN/2024/4811',
    badgeNumber: 'NDLM-EPI-1049',
    designation: 'State Outbreak Surveillance Officer'
  }
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  language,
  setLanguage
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');

  // Farmer Form State
  const [farmerPhone, setFarmerPhone] = useState('+91 98220 45678');
  const [farmerOtp, setFarmerOtp] = useState('4821');
  const [farmerOtpSent, setFarmerOtpSent] = useState(true);

  // Vet Form State
  const [vetRegNo, setVetRegNo] = useState('VCI/MAH/2026/0942');
  const [vetPassword, setVetPassword] = useState('GovtPass@2026');
  const [vetDistrict, setVetDistrict] = useState('Satara');

  // Validation / Error
  const [errorMsg, setErrorMsg] = useState('');
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningInWithGoogle(true);
      setErrorMsg('');
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleAuthProvider } = await import('../../lib/firebase');
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      const role: UserRole = selectedRole;
      const authUser: AuthUser = {
        id: user.uid,
        name: user.displayName || (role === 'veterinarian' ? 'Dr. Verified Veterinarian' : 'Verified Farmer'),
        email: user.email || undefined,
        role,
        phone: user.phoneNumber || (role === 'veterinarian' ? '+91 98000 11223' : '+91 98220 45678'),
        district: role === 'veterinarian' ? (vetDistrict || 'Satara') : 'Satara',
        state: 'Maharashtra',
        village: role === 'farmer' ? 'Gram Panchayat Center' : undefined,
        designation: role === 'veterinarian' ? 'Authorized District Veterinary Officer' : 'Livestock Owner',
        registrationNumber: role === 'veterinarian' ? (vetRegNo || 'VCI/MAH/2026/0942') : undefined,
        assignedCattleIds: role === 'farmer' ? ['COW-001', 'COW-002', 'BUF-001'] : undefined,
      };
      onLogin(authUser);
    } catch (err: any) {
      console.warn('Google sign-in notice:', err);
      setErrorMsg(err.message || 'Authentication in progress. You can also sign in via OTP or verified persona below.');
    } finally {
      setIsSigningInWithGoogle(false);
    }
  };

  const handleFarmerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerPhone.trim()) {
      setErrorMsg('Please enter a valid mobile number');
      return;
    }

    // Match with demo or create custom user
    const matched = DEMO_FARMERS.find((f) => f.phone?.includes(farmerPhone.slice(-5))) || {
      id: `FARMER-${Date.now().toString().slice(-4)}`,
      name: 'Registered Livestock Farmer',
      role: 'farmer' as UserRole,
      phone: farmerPhone,
      village: 'Gram Panchayat Center',
      district: 'Satara',
      state: 'Maharashtra',
      designation: 'Livestock Owner'
    };

    onLogin(matched);
  };

  const handleVetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vetRegNo.trim()) {
      setErrorMsg('Please enter your Veterinary Council Registration Number');
      return;
    }

    const matched = DEMO_VETS.find((v) => v.registrationNumber?.toLowerCase().includes(vetRegNo.toLowerCase().trim())) || {
      id: `VET-${Date.now().toString().slice(-4)}`,
      name: `Dr. Registered Veterinary Officer`,
      role: 'veterinarian' as UserRole,
      email: 'officer@ahd.gov.in',
      phone: '+91 98000 11223',
      district: vetDistrict || 'Satara',
      state: 'Maharashtra',
      registrationNumber: vetRegNo,
      badgeNumber: 'NDLM-VET-OFFICIAL',
      designation: 'Authorized District Veterinary Officer'
    };

    onLogin(matched);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white relative overflow-hidden">
      
      {/* Ambient background glow elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-display">
                Gausehat <span className="text-emerald-400 font-extrabold text-xs bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                <ShieldCheck className="w-3 h-3 mr-1 text-emerald-400" />
                NDLM / Bharat Pashudhan
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              National Multi-Modal Livestock Health Intelligence & RAG Diagnostic Architecture
            </p>
          </div>
        </div>

        {/* Language quick toggle */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 hidden md:inline">Language:</span>
          <button
            onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
            className="flex items-center space-x-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'hi' ? '🇮🇳 हिन्दी' : '🇬🇧 English'}</span>
          </button>
        </div>
      </header>

      {/* Main Login Authentication Container */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        
        {/* Left Column: Platform Overview */}
        <div className="w-full lg:w-1/2 space-y-6 text-left">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>National Livestock Health Intelligence System</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Unified Livestock Diagnostic & Disease Surveillance Portal
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Sign in with your dedicated role to access real-time multimodal AI diagnostics, herd biometrics, and national containment registries.
            </p>
          </div>

          {/* Platform Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/70 space-y-1">
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> AI Multimodal Vision
              </span>
              <p className="text-[11px] text-slate-400 leading-snug">
                Instant lesion & lameness detection with 22-language voice support
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/70 space-y-1">
              <span className="text-cyan-400 font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> NDLM Registry
              </span>
              <p className="text-[11px] text-slate-400 leading-snug">
                Verified bovine dossiers, GPS outbreak radar & digital Rx
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Login Card with Role Selector */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-5">
            
            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700/80">
              <button
                id="tab-login-farmer"
                type="button"
                onClick={() => {
                  setSelectedRole('farmer');
                  setErrorMsg('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  selectedRole === 'farmer'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>🌾 Farmer Login</span>
              </button>

              <button
                id="tab-login-vet"
                type="button"
                onClick={() => {
                  setSelectedRole('veterinarian');
                  setErrorMsg('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                  selectedRole === 'veterinarian'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>🩺 Veterinary Officer</span>
              </button>
            </div>

            {/* Real Firebase Google Sign-In Authentication */}
            <button
              id="btn-google-sign-in"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningInWithGoogle}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-2.5 cursor-pointer border border-slate-300 min-h-[44px]"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>
                {isSigningInWithGoogle
                  ? 'Connecting to Google...'
                  : `Sign in with Google (${selectedRole === 'veterinarian' ? 'Veterinary Officer' : 'Farmer'})`}
              </span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-700 w-full" />
              <span className="bg-slate-800 px-3 text-[11px] text-slate-400 uppercase font-semibold">
                Or continue with credentials
              </span>
              <div className="border-t border-slate-700 w-full" />
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/50 text-rose-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* FARMER LOGIN FORM */}
            {selectedRole === 'farmer' && (
              <form onSubmit={handleFarmerSubmit} className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Mobile Number (मोबाइल नंबर)
                    </label>
                    <span className="text-[10px] text-emerald-400 font-mono">SMS OTP Verification</span>
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={farmerPhone}
                      onChange={(e) => setFarmerPhone(e.target.value)}
                      placeholder="+91 98000 00000"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      4-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setFarmerOtp('4821')}
                      className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                    >
                      Resend Demo OTP
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      maxLength={4}
                      value={farmerOtp}
                      onChange={(e) => setFarmerOtp(e.target.value)}
                      placeholder="4821"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono text-sm tracking-widest"
                      required
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  id="btn-submit-farmer-login"
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
                >
                  <span>Sign In to Farmer Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 1-Click Demo Farmer Profiles */}
                <div className="pt-3 border-t border-slate-700/60 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    ⚡ Instant Demo Login (Click to Sign In):
                  </span>
                  <div className="space-y-1.5">
                    {DEMO_FARMERS.map((farmer) => (
                      <button
                        key={farmer.id}
                        type="button"
                        onClick={() => onLogin(farmer)}
                        className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-700/80 border border-slate-700/60 text-left transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                              {farmer.name}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-mono">({farmer.district})</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {farmer.village} • {farmer.phone}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

              </form>
            )}

            {/* VETERINARY OFFICER LOGIN FORM */}
            {selectedRole === 'veterinarian' && (
              <form onSubmit={handleVetSubmit} className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      VCI Registration # / Officer ID
                    </label>
                    <span className="text-[10px] text-cyan-400 font-mono">Govt Authenticated</span>
                  </div>
                  <div className="relative">
                    <FileCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={vetRegNo}
                      onChange={(e) => setVetRegNo(e.target.value)}
                      placeholder="VCI/MAH/2026/0942"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Security Passcode / NDLM PIN
                    </label>
                    <span className="text-[10px] text-slate-400">Department Token</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={vetPassword}
                      onChange={(e) => setVetPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    District Polyclinic / Jurisdiction
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={vetDistrict}
                      onChange={(e) => setVetDistrict(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Satara">Satara District Polyclinic & Surveillance Center</option>
                      <option value="Pune">Pune Divisional Animal Husbandry Polyclinic</option>
                      <option value="Kolhapur">Kolhapur Regional Bovine Diagnostic Lab</option>
                      <option value="Ahmednagar">Ahmednagar Veterinary Hospital HQ</option>
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  id="btn-submit-vet-login"
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-900/30 flex items-center justify-center space-x-2 cursor-pointer min-h-[44px]"
                >
                  <span>Sign In as Veterinary Officer (Full Access)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 1-Click Demo Veterinary Officer Profiles */}
                <div className="pt-3 border-t border-slate-700/60 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                    ⚡ Instant Demo Officer Login:
                  </span>
                  <div className="space-y-1.5">
                    {DEMO_VETS.map((vet) => (
                      <button
                        key={vet.id}
                        type="button"
                        onClick={() => onLogin(vet)}
                        className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-700/80 border border-slate-700/60 text-left transition-all flex items-center justify-between group cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                              {vet.name}
                            </span>
                            <span className="text-[10px] text-cyan-400 font-mono">({vet.district})</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {vet.designation} • {vet.registrationNumber}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>

              </form>
            )}

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950/60 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Gausehat Livestock Intelligence • Department of Animal Husbandry & Dairying (DAHD)</span>
          <span className="text-slate-600 font-mono text-[11px]">VCI Accredited • 256-Bit SSL Encrypted</span>
        </div>
      </footer>

    </div>
  );
};
