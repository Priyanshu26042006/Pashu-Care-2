import { AnimalProfile, DiagnosticAssessment, OutbreakAlert, RagIndexItem } from '../types';

export const SAMPLE_CATTLE_PRESETS = [
  {
    id: 'preset-gir-lumpy',
    title: 'Gir Cow - Nodular Eruptions (Lumpy Skin Disease)',
    category: 'Viral Infections',
    breed: 'Gir (Bos indicus)',
    species: 'Cattle',
    earTag: 'IN-GJ-2024-9104',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80',
    description: 'Distinct red/speckled coat, convex forehead with pendulous ears. Visible circumscribed skin nodules (2-5cm) along neck and lateral flank.',
    symptoms: 'Fever 104°F, skin nodules, reduced milk output, mild nasal discharge',
    pregnancyStatus: 'Mid Gestation (4-6 Months)',
    lactationStatus: 'Mid Lactation',
    dailyMilkYieldLiters: 12.5,
    location: { lat: 21.5222, lng: 70.4579, district: 'Junagadh', state: 'Gujarat' },
    defaultDiagnosis: {
      disease: 'Lumpy Skin Disease (Capripoxvirus)',
      severity: 'Moderate',
      bcs: 3.1
    }
  },
  {
    id: 'preset-murrah-fmd',
    title: 'Murrah Buffalo - Vesicular Stomatitis & Hoof Lesions (FMD)',
    category: 'Viral Infections',
    breed: 'Murrah (Bubalus bubalis)',
    species: 'Buffalo',
    earTag: 'IN-HR-2024-4318',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80',
    description: 'Jet black coat with tightly coiled horns. Excessive frothy salivation, shifting weight and painful oral vesicles.',
    symptoms: 'Profuse drooling, reluctance to walk, interdigital vesicles between hooves',
    pregnancyStatus: 'Late Gestation (7-9 Months)',
    lactationStatus: 'Early Lactation (Peak Yield)',
    dailyMilkYieldLiters: 16.0,
    location: { lat: 29.0588, lng: 76.0856, district: 'Hisar', state: 'Haryana' },
    defaultDiagnosis: {
      disease: 'Foot and Mouth Disease (Aphthovirus)',
      severity: 'Critical / Flagged',
      bcs: 2.8
    }
  },
  {
    id: 'preset-crossbred-mastitis',
    title: 'HF Crossbred Cow - Udder Induration & Quarter Edema (Mastitis)',
    category: 'Bacterial & Mammary',
    breed: 'Holstein-Friesian Cross',
    species: 'Cattle',
    earTag: 'IN-MH-2024-6721',
    imageUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=1000&q=80',
    description: 'Black and white pied markings. Asymmetrical, warm, erythematous rear right udder quarter with flaked milk.',
    symptoms: 'Swollen rear udder, pain on palpation, clots in foremilk, elevated body temp',
    pregnancyStatus: 'Non-Pregnant (Open)',
    lactationStatus: 'Early Lactation (Peak Yield)',
    dailyMilkYieldLiters: 22.0,
    location: { lat: 19.8762, lng: 75.3433, district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra' },
    defaultDiagnosis: {
      disease: 'Acute Clinical Mastitis (Streptococcus / Staphylococcal)',
      severity: 'Severe',
      bcs: 3.2
    }
  },
  {
    id: 'preset-kankrej-theileriosis',
    title: 'Kankrej Cow - Prescapular Lymphadenopathy (Theileriosis)',
    category: 'Parasitic & Tick-borne',
    breed: 'Kankrej (Bos indicus)',
    species: 'Cattle',
    earTag: 'IN-GJ-2024-5820',
    imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1000&q=80',
    description: 'Silver-grey coat, lyre-shaped horns. Swollen prescapular lymph nodes (size of fist), pale conjunctiva, high persistent fever 105°F, heavy tick burden.',
    symptoms: 'Enlarged shoulder lymph nodes, pale mucous membranes, tick infestation, high fever, shivering',
    pregnancyStatus: 'Mid Gestation (4-6 Months)',
    lactationStatus: 'Mid Lactation',
    dailyMilkYieldLiters: 10.0,
    location: { lat: 23.0225, lng: 72.5714, district: 'Ahmedabad', state: 'Gujarat' },
    defaultDiagnosis: {
      disease: 'Bovine Theileriosis (Theileria annulata)',
      severity: 'Severe',
      bcs: 2.6
    }
  },
  {
    id: 'preset-jersey-pinkeye',
    title: 'Jersey Crossbred - Corneal Opacity & Blepharospasm (Pinkeye)',
    category: 'Ophthalmic & Bacterial',
    breed: 'Jersey Cross',
    species: 'Cattle',
    earTag: 'IN-KA-2024-3312',
    imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80',
    description: 'Fawn-colored coat. Central white-gray corneal opacity, intense tearing (epiphora), photophobia, and conjunctival redness with fly swarming.',
    symptoms: 'Cloudy eye, squinting in sunlight, copious tearing, fly irritation',
    pregnancyStatus: 'Mid Gestation (4-6 Months)',
    lactationStatus: 'Mid Lactation',
    dailyMilkYieldLiters: 14.0,
    location: { lat: 12.9716, lng: 77.5946, district: 'Bengaluru Rural', state: 'Karnataka' },
    defaultDiagnosis: {
      disease: 'Infectious Bovine Keratoconjunctivitis (Pinkeye / Moraxella bovis)',
      severity: 'Moderate',
      bcs: 3.3
    }
  },
  {
    id: 'preset-sindhi-ringworm',
    title: 'Red Sindhi Cow - Circular Alopecic Crusts (Ringworm)',
    category: 'Fungal & Dermal',
    breed: 'Red Sindhi (Bos indicus)',
    species: 'Cattle',
    earTag: 'IN-TN-2024-7704',
    imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1000&q=80',
    description: 'Deep red coat. Circular, circumscribed grayish asbestos-like crusty plaques and hair loss around periorbital face and neck.',
    symptoms: 'Circular grayish crusty patches on face and neck, hair falling out in rings',
    pregnancyStatus: 'Mid Gestation (4-6 Months)',
    lactationStatus: 'Mid Lactation',
    dailyMilkYieldLiters: 13.0,
    location: { lat: 11.0168, lng: 76.9558, district: 'Coimbatore', state: 'Tamil Nadu' },
    defaultDiagnosis: {
      disease: 'Bovine Dermatophytosis (Ringworm / Trichophyton verrucosum)',
      severity: 'Mild',
      bcs: 3.2
    }
  },
  {
    id: 'preset-jaffarabadi-hs',
    title: 'Jaffarabadi Buffalo - Submandibular Edema (Galghotu / HS)',
    category: 'Bacterial & Respiratory',
    breed: 'Jaffarabadi Buffalo',
    species: 'Buffalo',
    earTag: 'IN-GJ-2024-2190',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80',
    description: 'Massive heavy head and horns. Severe hot submandibular and throat swelling, stertorous gasping breathing, protruding tongue, fever 106°F.',
    symptoms: 'Huge throat swelling (Galghotu), gasping for air, stertorous breathing, high fever',
    pregnancyStatus: 'Mid Gestation (4-6 Months)',
    lactationStatus: 'Early Lactation',
    dailyMilkYieldLiters: 15.0,
    location: { lat: 21.6032, lng: 70.0321, district: 'Porbandar', state: 'Gujarat' },
    defaultDiagnosis: {
      disease: 'Haemorrhagic Septicaemia (HS / Pasteurella multocida)',
      severity: 'Emergency Quarantine',
      bcs: 3.0
    }
  },
  {
    id: 'preset-tharparkar-mange',
    title: 'Tharparkar Cow - Lichenified Skin Folds & Pruritus (Mange)',
    category: 'Parasitic & Ectoparasites',
    breed: 'Tharparkar (Bos indicus)',
    species: 'Cattle',
    earTag: 'IN-RJ-2024-5502',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80',
    description: 'White/light grey desert coat. Thickened corrugated skin folds, intense itching, raw scratch marks and heavy crusting along neck and tailhead.',
    symptoms: 'Continuous itching and rubbing against walls, thickened wrinkled skin, hair loss',
    pregnancyStatus: 'Late Gestation (7-9 Months)',
    lactationStatus: 'Late Lactation',
    dailyMilkYieldLiters: 9.5,
    location: { lat: 25.7521, lng: 71.3967, district: 'Barmer', state: 'Rajasthan' },
    defaultDiagnosis: {
      disease: 'Bovine Acariasis (Sarcoptic / Psoroptic Mange)',
      severity: 'Moderate',
      bcs: 2.7
    }
  },
  {
    id: 'preset-crossbred-bloat',
    title: 'Dairy Crossbred - Left Flank Tympany & Distension (Bloat)',
    category: 'Digestive & Acute',
    breed: 'HF Crossbred',
    species: 'Cattle',
    earTag: 'IN-UP-2024-8841',
    imageUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=1000&q=80',
    description: 'Severe ballooning distension of left paralumbar fossa rising higher than spinal line after lush legume grazing. Animal kicking at belly.',
    symptoms: 'Huge swelling on left side of belly (Aafra), restlessness, kicking at stomach, respiratory distress',
    pregnancyStatus: 'Mid Gestation (4-6 Months)',
    lactationStatus: 'Mid Lactation',
    dailyMilkYieldLiters: 17.0,
    location: { lat: 26.8467, lng: 80.9462, district: 'Lucknow', state: 'Uttar Pradesh' },
    defaultDiagnosis: {
      disease: 'Acute Ruminal Bloat (Frothy Tympany)',
      severity: 'Severe',
      bcs: 3.4
    }
  },
  {
    id: 'preset-hf-milkfever',
    title: 'HF Cow - Postparturient Sternal Recumbency (Milk Fever)',
    category: 'Metabolic & Postpartum',
    breed: 'Holstein-Friesian Cross',
    species: 'Cattle',
    earTag: 'IN-AP-2024-4419',
    imageUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=1000&q=80',
    description: 'Downer cow sitting in sternal recumbency with classic S-shaped neck kink turned towards flank 24 hours post-calving. Cold ears and dry muzzle.',
    symptoms: 'Unable to stand after calving (Downer cow), head tucked to side, cold ears, dull demeanor',
    pregnancyStatus: 'Recently Calved (Postpartum)',
    lactationStatus: 'Early Lactation (Peak Yield)',
    dailyMilkYieldLiters: 24.0,
    location: { lat: 16.5062, lng: 80.6480, district: 'Krishna', state: 'Andhra Pradesh' },
    defaultDiagnosis: {
      disease: 'Postparturient Hypocalcemia (Milk Fever)',
      severity: 'Severe',
      bcs: 3.5
    }
  },
  {
    id: 'preset-sahiwal-healthy',
    title: 'Sahiwal Dairy Cow - Optimal BCS & Posture (Healthy)',
    category: 'Healthy Baseline',
    breed: 'Sahiwal (Zebu Cattle)',
    species: 'Cattle',
    earTag: 'IN-PB-2024-1189',
    imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1000&q=80',
    description: 'Reddish-dun smooth glossy coat, prominent hump, well-developed symmetrical udder, moist sweat beads on muzzle, alert straight spine.',
    symptoms: 'Routine herd health check, high milk yield, normal rumination and alert conformation',
    pregnancyStatus: 'Early Gestation (1-3 Months)',
    lactationStatus: 'Early Lactation (Peak Yield)',
    dailyMilkYieldLiters: 18.5,
    location: { lat: 30.9010, lng: 75.8573, district: 'Ludhiana', state: 'Punjab' },
    defaultDiagnosis: {
      disease: 'Healthy Herd Specimen - No Pathological Lesions',
      severity: 'Healthy',
      bcs: 3.7
    }
  },
  {
    id: 'preset-ongole-healthy',
    title: 'Ongole Bull - Certified Pathogen-Free Breeding Sire (Healthy)',
    category: 'Healthy Baseline',
    breed: 'Ongole (Bos indicus)',
    species: 'Cattle',
    earTag: 'IN-AP-2024-1002',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80',
    description: 'Pristine white coat, majestic muscular hump, powerful clean limbs and straight spine with certified negative serology for Brucella and IBR.',
    symptoms: 'Breeding soundness examination, optimal BCS 4.0, zero lesions or lameness',
    pregnancyStatus: 'Not Applicable / Male',
    lactationStatus: 'Not Applicable / Male',
    location: { lat: 15.5057, lng: 80.0499, district: 'Prakasam', state: 'Andhra Pradesh' },
    defaultDiagnosis: {
      disease: 'Certified Pathogen-Free Breeding Sire',
      severity: 'Healthy',
      bcs: 4.0
    }
  }
];

export const INITIAL_ANIMAL_PROFILES: AnimalProfile[] = [
  {
    id: 'anim-c9b1-8924',
    earTagNumber: 'IN-GJ-2024-9104',
    name: 'Gauri (गौरी)',
    species: 'Cattle',
    breed: 'Gir',
    estimatedAgeMonths: 42,
    gender: 'Female',
    weightKg: 385,
    ownerName: 'Rameshwar Patel',
    ownerContact: '+91 98251 44102',
    ownerVillage: 'Keshod Taluka',
    district: 'Junagadh',
    state: 'Gujarat',
    gpsLocation: {
      lat: 21.5222,
      lng: 70.4579,
      accuracyMeters: 4.2,
      timestamp: '2026-08-20T10:15:00Z'
    },
    currentStatus: 'Moderate Concern',
    lastAssessmentDate: '2026-08-20T10:30:00Z',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80',
    bodyConditionScore: 3.1,
    pregnancyStatus: 'Mid Gestation (4-6 Months)',
    lactationStatus: 'Mid Lactation',
    dailyMilkYieldLiters: 12.5,
    lactationStageDays: 145,
    inseminationDate: '2026-03-12',
    expectedCalvingDate: '2026-12-18',
    vaccinations: [
      { name: 'FMD Oil Adjuvant Vaccine', date: '2026-02-14', nextDueDate: '2026-08-14', batchNo: 'FMD-GJ-884' },
      { name: 'Goat Pox Vaccine (Heterologous for LSD)', date: '2025-11-10', nextDueDate: '2026-11-10', batchNo: 'GPV-291' }
    ],
    assessmentsCount: 3,
    quarantineStatus: 'Recommended',
    reports: [
      {
        id: 'rep-ndlm-9104-01',
        reportNumber: 'REP-NDLM-9104-1',
        animalId: 'anim-c9b1-8924',
        animalEarTag: 'IN-GJ-2024-9104',
        animalName: 'Gauri (गौरी)',
        breed: 'Gir',
        species: 'Cattle',
        createdAt: '2026-08-20T10:35:00Z',
        authorName: 'Dr. Arvind Shastri, MVSc',
        authorRole: 'Veterinary Officer',
        title: 'Clinical Diagnostic Report - Suspected Lumpy Skin Disease',
        primaryDiagnosis: 'Lumpy Skin Disease (Capripoxvirus) - Nodular Stage',
        severityGrade: 'Moderate',
        bcsScore: 3.1,
        summaryObservations: 'Circumscribed cutaneous nodules (2-4 cm) along neck, lateral thorax, and perineum with mild pyrexia.',
        customNotes: 'Advised strict vector isolation with mosquito netting. Secondary bacterial prophylaxis initiated.',
        immediateRemedies: [
          'Fly & tick repellent spray (Cypermethrin 1% / Neem-oil formulation)',
          'Topical antiseptic ointment (Povidone Iodine 5%) on ruptured nodules',
          'Isolate from other milking cows to prevent mechanical transmission'
        ],
        recommendedVeterinaryActions: [
          'Ring vaccination with Goat Pox Vaccine in 5km radius zone',
          'Supportive antipyretic administration (Meloxicam + Paracetamol)',
          'Daily mucosal inspection for secondary ulcerative complications'
        ],
        ndlmSyncStatus: 'Synchronized & Verified',
        imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80',
        gpsLocation: {
          lat: 21.5222,
          lng: 70.4579,
          district: 'Junagadh',
          state: 'Gujarat'
        }
      }
    ]
  },
  {
    id: 'anim-f4a2-4318',
    earTagNumber: 'IN-HR-2024-4318',
    name: 'Kali (काली)',
    species: 'Buffalo',
    breed: 'Murrah',
    estimatedAgeMonths: 54,
    gender: 'Female',
    weightKg: 520,
    ownerName: 'Suresh Kumar',
    ownerContact: '+91 94160 88231',
    ownerVillage: 'Hansi Rural',
    district: 'Hisar',
    state: 'Haryana',
    gpsLocation: {
      lat: 29.0588,
      lng: 76.0856,
      accuracyMeters: 3.8,
      timestamp: '2026-08-21T08:45:00Z'
    },
    currentStatus: 'Critical / Flagged',
    lastAssessmentDate: '2026-08-21T09:00:00Z',
    thumbnailUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80',
    bodyConditionScore: 2.8,
    pregnancyStatus: 'Late Gestation (7-9 Months)',
    lactationStatus: 'Early Lactation (Peak Yield)',
    dailyMilkYieldLiters: 16.0,
    lactationStageDays: 62,
    inseminationDate: '2025-11-20',
    expectedCalvingDate: '2026-09-28',
    vaccinations: [
      { name: 'Haemorrhagic Septicaemia (HS) Alum', date: '2025-06-12', nextDueDate: '2026-06-12', batchNo: 'HS-NDDB-701' },
      { name: 'Brucella Abortus S19', date: '2023-01-10', nextDueDate: 'Lifetime', batchNo: 'BRU-441' }
    ],
    assessmentsCount: 5,
    quarantineStatus: 'Enforced'
  },
  {
    id: 'anim-e8d3-1189',
    earTagNumber: 'IN-PB-2024-1189',
    name: 'Lakshmi (ਲਕਸ਼ਮੀ)',
    species: 'Cattle',
    breed: 'Sahiwal',
    estimatedAgeMonths: 36,
    gender: 'Female',
    weightKg: 410,
    ownerName: 'Gurpreet Singh',
    ownerContact: '+91 98722 33419',
    ownerVillage: 'Samrala Block',
    district: 'Ludhiana',
    state: 'Punjab',
    gpsLocation: {
      lat: 30.9010,
      lng: 75.8573,
      accuracyMeters: 5.1,
      timestamp: '2026-08-21T14:20:00Z'
    },
    currentStatus: 'Healthy',
    lastAssessmentDate: '2026-08-21T14:40:00Z',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=600&q=80',
    bodyConditionScore: 3.7,
    pregnancyStatus: 'Early Gestation (1-3 Months)',
    lactationStatus: 'Early Lactation (Peak Yield)',
    dailyMilkYieldLiters: 18.5,
    lactationStageDays: 45,
    inseminationDate: '2026-06-15',
    expectedCalvingDate: '2027-03-22',
    vaccinations: [
      { name: 'FMD Polyvalent Inactivated', date: '2026-03-01', nextDueDate: '2026-09-01', batchNo: 'FMD-PB-2026' },
      { name: 'Theileriosis Vaccine (Rakshavac-T)', date: '2025-08-15', nextDueDate: '2028-08-15', batchNo: 'TH-902' }
    ],
    assessmentsCount: 2,
    quarantineStatus: 'None'
  },
  {
    id: 'anim-a2e7-6721',
    earTagNumber: 'IN-MH-2024-6721',
    name: 'Kamadhenu (कामधेनु)',
    species: 'Cattle',
    breed: 'HF Crossbred',
    estimatedAgeMonths: 48,
    gender: 'Female',
    weightKg: 460,
    ownerName: 'Vilas Deshmukh',
    ownerContact: '+91 94222 19045',
    ownerVillage: 'Paithan Sector',
    district: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    gpsLocation: {
      lat: 19.8762,
      lng: 75.3433,
      accuracyMeters: 4.6,
      timestamp: '2026-08-22T06:10:00Z'
    },
    currentStatus: 'Critical / Flagged',
    lastAssessmentDate: '2026-08-22T06:30:00Z',
    thumbnailUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=600&q=80',
    bodyConditionScore: 3.2,
    pregnancyStatus: 'Non-Pregnant (Open)',
    lactationStatus: 'Early Lactation (Peak Yield)',
    dailyMilkYieldLiters: 22.0,
    lactationStageDays: 30,
    vaccinations: [
      { name: 'FMD Oil Adjuvant Vaccine', date: '2026-01-20', nextDueDate: '2026-07-20', batchNo: 'FMD-MH-512' }
    ],
    assessmentsCount: 4,
    quarantineStatus: 'Recommended'
  },
  {
    id: 'anim-th-5502',
    earTagNumber: 'IN-RJ-2024-5502',
    name: 'Nandini (नंदिनी)',
    species: 'Cattle',
    breed: 'Tharparkar',
    estimatedAgeMonths: 50,
    gender: 'Female',
    weightKg: 405,
    ownerName: 'Manohar Lal Bhati',
    ownerContact: '+91 94141 66209',
    ownerVillage: 'Sheo Tehsil',
    district: 'Barmer',
    state: 'Rajasthan',
    gpsLocation: {
      lat: 25.7521,
      lng: 71.3967,
      accuracyMeters: 4.8,
      timestamp: '2026-08-22T09:15:00Z'
    },
    currentStatus: 'Observation',
    lastAssessmentDate: '2026-08-22T09:30:00Z',
    thumbnailUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=600&q=80',
    bodyConditionScore: 3.4,
    pregnancyStatus: 'Late Gestation (7-9 Months)',
    lactationStatus: 'Late Lactation',
    dailyMilkYieldLiters: 9.5,
    lactationStageDays: 210,
    inseminationDate: '2025-12-10',
    expectedCalvingDate: '2026-09-18',
    vaccinations: [
      { name: 'FMD Polyvalent Inactivated', date: '2026-02-15', nextDueDate: '2026-08-15', batchNo: 'FMD-RJ-312' },
      { name: 'Black Quarter (BQ) Vaccine', date: '2025-05-10', nextDueDate: '2026-05-10', batchNo: 'BQ-552' }
    ],
    assessmentsCount: 2,
    quarantineStatus: 'None'
  },
  {
    id: 'anim-on-7714',
    earTagNumber: 'IN-AP-2024-7714',
    name: 'Veer (वीर)',
    species: 'Cattle',
    breed: 'Ongole',
    estimatedAgeMonths: 60,
    gender: 'Male',
    weightKg: 680,
    ownerName: 'Subba Rao',
    ownerContact: '+91 98480 55198',
    ownerVillage: 'Kandukur Mandal',
    district: 'Prakasam',
    state: 'Andhra Pradesh',
    gpsLocation: {
      lat: 15.2185,
      lng: 79.9042,
      accuracyMeters: 3.5,
      timestamp: '2026-08-21T11:00:00Z'
    },
    currentStatus: 'Healthy',
    lastAssessmentDate: '2026-08-21T11:30:00Z',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=600&q=80',
    bodyConditionScore: 4.1,
    pregnancyStatus: 'Not Applicable / Male',
    lactationStatus: 'Not Applicable / Male',
    dailyMilkYieldLiters: 0,
    vaccinations: [
      { name: 'FMD Oil Adjuvant Vaccine', date: '2026-03-10', nextDueDate: '2026-09-10', batchNo: 'FMD-AP-891' },
      { name: 'Anthrax Spore Vaccine', date: '2025-09-15', nextDueDate: '2026-09-15', batchNo: 'ANTH-104' }
    ],
    assessmentsCount: 2,
    quarantineStatus: 'None'
  }
];

export const INITIAL_ASSESSMENTS: DiagnosticAssessment[] = [
  {
    id: 'diag-9104-01',
    animalId: 'anim-c9b1-8924',
    timestamp: '2026-08-20T10:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80',
    predictedBreed: 'Gir (Bos indicus)',
    breedConfidence: 94.6,
    detectedSpecies: 'Cattle (Zebu)',
    coatCondition: 'Crusted / Nodular',
    postureAssessment: {
      spineCurvature: 'Kyphosis (Hunched)',
      headCarriage: 'Depressed / Drooping',
      weightBearing: 'Equal on all 4 limbs',
      gaitConfidence: 89.2
    },
    bodyConditionScore: 3.1,
    conformationalMetrics: [
      { metric: 'Spine Alignment Index', score: 72, benchmark: '85-100 Normal', status: 'Sub-optimal', details: 'Slight dorsal kyphosis indicating visceral or muscular discomfort.' },
      { metric: 'Pelvic-Wither Ratio', score: 94, benchmark: '90-100 Ideal', status: 'Optimal', details: 'True to Gir breed conformational standards with typical humped dorsal line.' },
      { metric: 'Stifle-Hock Angle', score: 88, benchmark: '80-95 Healthy', status: 'Optimal', details: 'Good limb angulation with no acute joint swelling.' }
    ],
    lesions: [
      {
        id: 'les-01',
        label: 'Circumscribed Cutaneous Nodules (2-4 cm)',
        confidence: 96.2,
        severity: 'Moderate',
        boundingBox: { ymin: 28, xmin: 34, ymax: 52, xmax: 62 },
        anatomicalLocation: 'Lateral Flank & Prescapular Area',
        clinicalDescription: 'Firm, raised intradermal nodules with central necrotic plug characteristic of Capripoxvirus infection.'
      },
      {
        id: 'les-02',
        label: 'Superficial Lymph Node Enlargement',
        confidence: 88.7,
        severity: 'Moderate',
        boundingBox: { ymin: 44, xmin: 68, ymax: 60, xmax: 82 },
        anatomicalLocation: 'Prescapular Lymph Node Region',
        clinicalDescription: 'Marked regional lymphadenopathy accompanying viral dissemination.'
      }
    ],
    primaryDiagnosis: 'Suspected Lumpy Skin Disease (LSD) - Clinical Stage II',
    pregnancyStatus: 'Mid Gestation (4-6 Months)',
    lactationStatus: 'Mid Lactation',
    milkYieldImpact: 'Moderate 30-40% reduction in daily milk yield due to high pyrexia and systemic discomfort.',
    reproductiveAndLactationAlerts: {
      pregnancyRiskNotes: 'Mid-gestation status (Month 5). Prevent physical trauma and severe dehydration. High fever must be brought down quickly to prevent fetal distress.',
      lactationImpact: 'Temporary drop in daily yield from 12.5L to ~8.0L. Discard milk during antibiotic treatment and observe withdrawal period.',
      drugContraindications: [
        'Avoid Corticosteroids (Dexamethasone/Isoflupredone) due to abortifacient risks in pregnant cattle.',
        'Do not vaccinate heavily pregnant animals with live heterologous goat pox vaccines without veterinary discretion.'
      ],
      nutritionalRecommendation: 'Provide 50g mineral mixture + bypass fat, jaggery water, and fresh succulent green fodder (Maize/Sorghum) daily.'
    },
    differentialDiagnoses: [
      {
        disease: 'Lumpy Skin Disease (Capripoxvirus)',
        probability: 88.5,
        keyIndications: ['Circumscribed 2-4cm cutaneous nodules', 'Enlarged prescapular lymph nodes', 'Pyrexia & reduced appetite'],
        sourceDataset: 'Bharat Pashudhan & ICAR-NIVEDI Epidemiology Hub'
      },
      {
        disease: 'Pseudolumpy Skin Disease (Bovine Herpesvirus 2)',
        probability: 9.2,
        keyIndications: ['Superficial skin lesions with central depression', 'Milder systemic signs'],
        sourceDataset: 'IEEE Dataport & ICAR Diagnostic Protocols'
      },
      {
        disease: 'Bovine Papillomatosis (Warts)',
        probability: 2.3,
        keyIndications: ['Cauliflower-like cutaneous growths', 'Absence of acute fever'],
        sourceDataset: 'CID Cattle Identification Dataset'
      }
    ],
    severityGrade: 'Moderate',
    ragCitations: [
      {
        source: 'Bharat Pashudhan (NDLM)',
        title: 'National Advisory on Lumpy Skin Disease Management in Dairy Herds',
        section: 'Section 4.2: Field Triage and Symptomatic Protocol',
        relevanceScore: 0.942,
        guidelineSnippet: 'Isolate affected cattle immediately. Apply neem leaf decoction or herbal antiseptic lotion (mustard oil + turmeric) topically on lesions. Administer antipyretics (Meloxicam 0.5 mg/kg) and broad-spectrum antibiotics to prevent secondary bacterial infection.',
        url: 'https://bharatpashudhan.ndlm.co.in/guidelines/lsd-protocol-2026'
      },
      {
        source: 'IEEE Dataport Indian Breed',
        title: 'Morphological & Conformational Baselines for Indigenous Gir Cattle',
        section: 'Trait Table 3: Coat Texture & Skin Biometrics',
        relevanceScore: 0.884,
        guidelineSnippet: 'Indigenous Gir cattle demonstrate higher heat tolerance but remain susceptible to Capripox vector transmission via Stomoxys calcitrans during humid monsoons.',
        url: 'https://ieee-dataport.org/open-access/indian-cattle-breeds'
      }
    ],
    immediateRemedies: [
      'Strict isolation in a dry, shaded shed away from healthy herd members.',
      'Apply paste of Turmeric (Curcuma longa) + Neem oil topically over ruptured nodules twice daily.',
      'Administer oral hydration with electrolytes (Jaggery water with rock salt & cumin).',
      'Provide soft, palatable green fodder (Hybrid Napier / Lucerne) to maintain rumination.'
    ],
    recommendedVeterinaryActions: [
      'Veterinary Officer verification within 24 hours for official NDLM epidemic registry.',
      'Injectable Meloxicam + Paracetamol for pain and high pyrexia control.',
      'Administer Long-acting Oxytetracycline (20 mg/kg IM) to suppress secondary bacterial dermatitis.',
      'Ring vaccination of all asymptomatic cattle in 5 km radius with Goat Pox Vaccine (10^3.5 TCID50).'
    ],
    biosecurityProtocol: [
      'Daily fly and tick vector control using fly repellents (Cypermethrin 1% spray on shed walls).',
      'Disinfect shed flooring with 2% Sodium Carbonate or Virkon-S.',
      'Restrict animal movement outside the village perimeter for 21 days.'
    ],
    gpsMetadata: {
      lat: 21.5222,
      lng: 70.4579,
      district: 'Junagadh',
      state: 'Gujarat'
    },
    audioLanguage: 'hi',
    reviewedByOfficer: {
      officerName: 'Dr. Arvind Shastri (BVSc & AH)',
      officerBadge: 'VET-GJ-9042',
      reviewedAt: '2026-08-20T14:15:00Z',
      officialRemarks: 'Confirmed moderate LSD lesions. Prescribed NSAIDs and topical neem spray. Advised 21 days isolation.',
      quarantineIssued: true
    }
  },
  {
    id: 'diag-4318-01',
    animalId: 'anim-f4a2-4318',
    timestamp: '2026-08-21T09:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1000&q=80',
    predictedBreed: 'Murrah Buffalo (Bubalus bubalis)',
    breedConfidence: 97.1,
    detectedSpecies: 'Buffalo',
    coatCondition: 'Dull / Matted',
    postureAssessment: {
      spineCurvature: 'Kyphosis (Hunched)',
      headCarriage: 'Depressed / Drooping',
      weightBearing: 'Antalgic (Shifting/Limping)',
      gaitConfidence: 94.5
    },
    bodyConditionScore: 2.8,
    conformationalMetrics: [
      { metric: 'Gait Symmetry Index', score: 48, benchmark: '80-100 Healthy', status: 'Abnormal', details: 'Severe antalgic limb shifting with reluctance to stand due to interdigital pododermatitis.' },
      { metric: 'Body Symmetry', score: 82, benchmark: '85-100', status: 'Sub-optimal', details: 'Depressed demeanor with significant weight reduction over last 10 days.' }
    ],
    lesions: [
      {
        id: 'les-fmd-01',
        label: 'Oral Mucosal Vesicles & Sloughing',
        confidence: 97.8,
        severity: 'Severe',
        boundingBox: { ymin: 40, xmin: 30, ymax: 65, xmax: 55 },
        anatomicalLocation: 'Muzzle, Dental Pad & Tongue',
        clinicalDescription: 'Ruptured vesicular blisters with raw, painful erosions causing profuse stringy salivation.'
      },
      {
        id: 'les-fmd-02',
        label: 'Interdigital Coronary Band Vesicles',
        confidence: 95.4,
        severity: 'Severe',
        boundingBox: { ymin: 75, xmin: 40, ymax: 95, xmax: 65 },
        anatomicalLocation: 'Interdigital Cleft of Forelimbs',
        clinicalDescription: 'Erosive cleft lesions with secondary fly strike risk and acute lameness.'
      }
    ],
    primaryDiagnosis: 'Foot and Mouth Disease (FMD) - Acute Vesicular Stage',
    pregnancyStatus: 'Late Gestation (7-9 Months)',
    lactationStatus: 'Early Lactation (Peak Yield)',
    milkYieldImpact: 'Severe drop: 16.0L/day crashed to <4.0L/day due to acute oral pain, anorexia and hyperthermia.',
    reproductiveAndLactationAlerts: {
      pregnancyRiskNotes: 'Late gestation alert: Risk of abortion or stillbirth triggered by acute high pyrexia (>105°F). Monitor vital signs hourly.',
      lactationImpact: 'Severe agalactia. Milk must be boiled and destroyed to prevent viral transmission.',
      drugContraindications: ['Corticosteroids are contraindicated during acute viral viremia and late gestation.'],
      nutritionalRecommendation: 'Feed soft gruel, cooled rice water, porridge (Dalia) and crushed soaked oil cakes.'
    },
    differentialDiagnoses: [
      {
        disease: 'Foot and Mouth Disease (Aphthovirus Type-O)',
        probability: 96.4,
        keyIndications: ['Profuse ropy salivation', 'Interdigital vesicles', 'High fever >105°F', 'Acute lameness'],
        sourceDataset: 'Bharat Pashudhan & ICAR-PDFMD Registry'
      },
      {
        disease: 'Vesicular Stomatitis (Rhabdoviridae)',
        probability: 3.1,
        keyIndications: ['Oral lesions without widespread hoof detachment'],
        sourceDataset: 'ICAR Diagnostic Guidelines'
      }
    ],
    severityGrade: 'Emergency Quarantine',
    ragCitations: [
      {
        source: 'Bharat Pashudhan (NDLM)',
        title: 'Epidemic Response Protocol for FMD Outbreaks in High-Yield Dairy Animals',
        section: 'Section 1.1: Mandatory Ring Quarantine & Biosecurity Cordon',
        relevanceScore: 0.985,
        guidelineSnippet: 'Enforce strict 10km movement barrier. Wash oral lesions with 1% Potassium Permanganate (KMnO4) or 2% Sodium Bicarbonate solution. Treat foot lesions with Copper Sulphate 1:1000 wash and apply insect repellent.',
        url: 'https://bharatpashudhan.ndlm.co.in/guidelines/fmd-emergency'
      }
    ],
    immediateRemedies: [
      'Immediate isolation in clean shed with soft dry bedding (paddy straw).',
      'Mouth wash 3 times daily with mild 1% Potassium Permanganate (KMnO4) solution.',
      'Foot bath with 2% Sodium Carbonate or Copper Sulphate solution twice daily.',
      'Offer soft liquid gruel (wheat bran + jaggery + mineral mixture) to maintain caloric intake.'
    ],
    recommendedVeterinaryActions: [
      'Emergency Veterinary Officer dispatch for biosecurity cordon.',
      'Injectable Flunixin Meglumine (2.2 mg/kg IV/IM) for rapid antipyretic & analgesia.',
      'Broad-spectrum Ceftiofur Sodium to prevent septic pododermatitis.',
      'Notification to National Outbreak Monitoring Cell (NDLM) within 4 hours.'
    ],
    biosecurityProtocol: [
      'Quarantine perimeter of 5 km radius with ban on animal transport.',
      'Disinfect farm entrance with 4% Sodium Carbonate solution.',
      'Burn or safely bury contaminated bedding and feed leftovers.'
    ],
    gpsMetadata: {
      lat: 29.0588,
      lng: 76.0856,
      district: 'Hisar',
      state: 'Haryana'
    },
    audioLanguage: 'hi',
    reviewedByOfficer: {
      officerName: 'Dr. Arvind Shastri (BVSc & AH)',
      officerBadge: 'VET-GJ-9042',
      reviewedAt: '2026-08-21T10:15:00Z',
      officialRemarks: 'EMERGENCY QUARANTINE ENFORCED. Notified State Directorate of Animal Husbandry.',
      quarantineIssued: true
    }
  },
  {
    id: 'diag-6721-01',
    animalId: 'anim-a2e7-6721',
    timestamp: '2026-08-22T06:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=1000&q=80',
    predictedBreed: 'Holstein-Friesian Crossbred',
    breedConfidence: 96.0,
    detectedSpecies: 'Cattle',
    coatCondition: 'Dull / Matted',
    postureAssessment: {
      spineCurvature: 'Normal Straight',
      headCarriage: 'Alert & Elevated',
      weightBearing: 'Equal on all 4 limbs',
      gaitConfidence: 91.0
    },
    bodyConditionScore: 3.2,
    conformationalMetrics: [
      { metric: 'Udder Depth & Conformation', score: 42, benchmark: '75-95 Optimal', status: 'Abnormal', details: 'Marked asymmetric enlargement of right hind quarter with pronounced vascular engorgement.' },
      { metric: 'Body Frame Score', score: 85, benchmark: '80-100 Ideal', status: 'Optimal', details: 'Good crossbred dairy frame with typical wedge conformation.' }
    ],
    lesions: [
      {
        id: 'les-mast-01',
        label: 'Right Hind Quarter Erythema & Severe Induration',
        confidence: 94.8,
        severity: 'Severe',
        boundingBox: { ymin: 55, xmin: 45, ymax: 85, xmax: 75 },
        anatomicalLocation: 'Right Rear Mammary Quarter',
        clinicalDescription: 'Tense, hot, painful quarter with purulent clotted secretions and microvascular stasis.'
      }
    ],
    primaryDiagnosis: 'Acute Clinical Mastitis (Bovine Staphylococcal/Streptococcal)',
    pregnancyStatus: 'Non-Pregnant (Open)',
    lactationStatus: 'Early Lactation (Peak Yield)',
    milkYieldImpact: 'Drop from 22.0L/day to 11.5L/day. Affected quarter produces yellowish whey-like clotted milk.',
    reproductiveAndLactationAlerts: {
      pregnancyRiskNotes: 'Open cow - prepare for recovery before AI breeding cycle.',
      lactationImpact: 'Discard milk from affected quarter immediately. Do not pool with bulk milk vat.',
      drugContraindications: ['Observe mandatory 72-96 hour milk withdrawal period post intramammary infusion.'],
      nutritionalRecommendation: 'Supplement with Vitamin E (1000 IU) and Selenium + Zinc Chelate to boost mammary immunity.'
    },
    differentialDiagnoses: [
      {
        disease: 'Acute Staphylococcal Mastitis',
        probability: 91.2,
        keyIndications: ['Hyperemic swollen quarter', 'Clotted flakes in milk', 'Pyrexia'],
        sourceDataset: 'Bharat Pashudhan & ICAR-NDRI Clinical Database'
      },
      {
        disease: 'Coliform Mastitis (E. coli Endotoxin)',
        probability: 7.5,
        keyIndications: ['Systemic toxemia', 'Serous secretions'],
        sourceDataset: 'ICAR Protocol Hub'
      }
    ],
    severityGrade: 'Severe',
    ragCitations: [
      {
        source: 'Bharat Pashudhan (NDLM)',
        title: 'Standard Operating Protocol: Clinical & Subclinical Mastitis Control in Dairy Herds',
        section: 'Section 3.4: Ethno-Veterinary Formulations & Intramammary Therapy',
        relevanceScore: 0.95,
        guidelineSnippet: 'Completely milk out the affected quarter every 2 hours. Infuse intramammary antibiotic tube after antiseptic teat dip. Apply topical herbal formulation of Aloe vera + Curcuma longa + Calcium hydroxide.',
        url: 'https://bharatpashudhan.ndlm.co.in/guidelines/mastitis-control'
      }
    ],
    immediateRemedies: [
      'Frequent stripping / hand milking of affected quarter every 2-3 hours to evacuate toxins.',
      'Cold water fomentation on swollen quarter followed by herbal mastitis paste.',
      'Post-milking teat dipping in 0.5% Povidone Iodine solution.',
      'Separate milking cluster/bucket to avoid cross-contaminating other dairy cows.'
    ],
    recommendedVeterinaryActions: [
      'Intramammary Ceftiofur/Cloxacillin infusion after complete milking out.',
      'Systemic NSAID (Meloxicam 15 ml IM) for anti-inflammatory relief.',
      'Culture and antibiotic sensitivity test (ABST) of milk sample within 24 hours.'
    ],
    biosecurityProtocol: [
      'Milk the infected animal last in milking order.',
      'Sanitize milker hands and teat cups with chlorine solution between animals.'
    ],
    gpsMetadata: {
      lat: 19.8762,
      lng: 75.3433,
      district: 'Chhatrapati Sambhajinagar',
      state: 'Maharashtra'
    },
    audioLanguage: 'hi'
  },
  {
    id: 'diag-1189-01',
    animalId: 'anim-e8d3-1189',
    timestamp: '2026-08-21T14:40:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1000&q=80',
    predictedBreed: 'Sahiwal (Bos indicus)',
    breedConfidence: 98.2,
    detectedSpecies: 'Cattle (Zebu)',
    coatCondition: 'Glossy & Healthy',
    postureAssessment: {
      spineCurvature: 'Normal Straight',
      headCarriage: 'Alert & Elevated',
      weightBearing: 'Equal on all 4 limbs',
      gaitConfidence: 98.5
    },
    bodyConditionScore: 3.7,
    conformationalMetrics: [
      { metric: 'Spine Alignment Index', score: 96, benchmark: '85-100 Normal', status: 'Optimal', details: 'Perfect dorsal spine alignment with breed-true hump structure.' },
      { metric: 'Udder Symmetry & Attachment', score: 94, benchmark: '85-100 Ideal', status: 'Optimal', details: 'Well-balanced pendulous udder with symmetrical quarters and clear teat spacing.' },
      { metric: 'Locomotion Score', score: 98, benchmark: '90-100 Healthy', status: 'Optimal', details: 'Confident, rhythmic stride on all limbs.' }
    ],
    lesions: [],
    primaryDiagnosis: 'Healthy Dairy Herd Specimen - Optimal Health & Conformation',
    pregnancyStatus: 'Early Gestation (1-3 Months)',
    lactationStatus: 'Early Lactation (Peak Yield)',
    milkYieldImpact: 'Peak production steady at 18.5 L/day with optimal butterfat (4.6%) and protein content.',
    reproductiveAndLactationAlerts: {
      pregnancyRiskNotes: 'Confirmed pregnancy (45 days). Normal embryonic development with no signs of distress.',
      lactationImpact: 'Optimal yield sustained. High conversion efficiency on green maize silage.',
      nutritionalRecommendation: 'Maintain balanced TMR (Total Mixed Ration) with 4kg concentrate + 25kg green fodder.'
    },
    differentialDiagnoses: [
      {
        disease: 'Healthy Bovine Specimen (No Pathologies)',
        probability: 99.1,
        keyIndications: ['Glossy coat', 'Bright alert eyes', 'Normal rumination 55 chews/min', 'Clean muzzle sweat droplets'],
        sourceDataset: 'Bharat Pashudhan NDLM Baselines'
      }
    ],
    severityGrade: 'Mild',
    ragCitations: [
      {
        source: 'Bharat Pashudhan (NDLM)',
        title: 'Good Dairy Husbandry Practices (GDHP) for Indigenous Zebu Dairy Breeds',
        section: 'Section 2.1: Transition Cow Nutrition & Peak Lactation Management',
        relevanceScore: 0.92,
        guidelineSnippet: 'Indigenous Sahiwal cows exhibit superior A2 beta-casein allele frequencies and exceptional heat tolerance up to 45°C ambient temperature.',
        url: 'https://bharatpashudhan.ndlm.co.in/guidelines/sahiwal-management'
      }
    ],
    immediateRemedies: [
      'Continue standard herd feeding routine and clean ad-libitum drinking water.',
      'Maintain regular morning and evening milking schedule.'
    ],
    recommendedVeterinaryActions: [
      'Routine 90-day gestation ultrasound check scheduled for next veterinary officer visit.',
      'FMD booster vaccination scheduled for 2026-09-01.'
    ],
    biosecurityProtocol: [
      'Maintain routine clean shed hygiene and seasonal fly repellant.'
    ],
    gpsMetadata: {
      lat: 30.9010,
      lng: 75.8573,
      district: 'Ludhiana',
      state: 'Punjab'
    },
    audioLanguage: 'pa'
  },
  {
    id: 'diag-5502-01',
    animalId: 'anim-th-5502',
    timestamp: '2026-08-22T09:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?auto=format&fit=crop&w=1000&q=80',
    predictedBreed: 'Tharparkar (White Sindhi)',
    breedConfidence: 93.4,
    detectedSpecies: 'Cattle',
    coatCondition: 'Alopecia / Hair Loss',
    postureAssessment: {
      spineCurvature: 'Normal Straight',
      headCarriage: 'Alert & Elevated',
      weightBearing: 'Equal on all 4 limbs',
      gaitConfidence: 92.0
    },
    bodyConditionScore: 3.4,
    conformationalMetrics: [
      { metric: 'Coat Density Index', score: 68, benchmark: '80-100 Normal', status: 'Sub-optimal', details: 'Localized alopecia around neck and tail base due to tick infestation.' }
    ],
    lesions: [
      {
        id: 'les-th-01',
        label: 'Localized Ectoparasitic Dermatitis (Hyalomma Ticks)',
        confidence: 89.5,
        severity: 'Mild',
        boundingBox: { ymin: 35, xmin: 20, ymax: 55, xmax: 40 },
        anatomicalLocation: 'Neck Crease & Perineum',
        clinicalDescription: 'Moderate tick burden with superficial erythema and pruritus.'
      }
    ],
    primaryDiagnosis: 'Sub-acute Bovine Ectoparasitism & Mild Papular Dermatitis',
    pregnancyStatus: 'Late Gestation (7-9 Months)',
    lactationStatus: 'Late Lactation',
    milkYieldImpact: 'Minor yield drop from 10.5L to 9.5L/day due to mild discomfort and irritation.',
    reproductiveAndLactationAlerts: {
      pregnancyRiskNotes: 'Approaching dry period (Month 8). Ensure gentle topical parasite control without systemic organophosphates.',
      lactationImpact: 'Plan dry cow therapy in 2 weeks.',
      drugContraindications: ['Avoid systemic organophosphate dips in late gestation pregnant cows. Use topical Flumethrin/Deltamethrin pour-on.'],
      nutritionalRecommendation: 'Provide balanced dry cow mineral mix with low calcium to prevent milk fever post-calving.'
    },
    differentialDiagnoses: [
      {
        disease: 'Bovine Ectoparasitism (Hyalomma / Rhipicephalus ticks)',
        probability: 91.0,
        keyIndications: ['Visible ticks in neck folds', 'Pruritus / rubbing against posts'],
        sourceDataset: 'Bharat Pashudhan & ICAR-CAZRI Field Registry'
      }
    ],
    severityGrade: 'Mild',
    ragCitations: [
      {
        source: 'Bharat Pashudhan (NDLM)',
        title: 'Integrated Vector & Ectoparasite Management in Arid Zone Cattle',
        section: 'Section 5.2: Safe Acaricide Application in Pregnant Livestock',
        relevanceScore: 0.89,
        guidelineSnippet: 'Apply Deltamethrin 1.25% EC pour-on along backline at 1 ml/10 kg body weight. Alternatively apply cold-pressed neem kernel extract 5% emulsion.',
        url: 'https://bharatpashudhan.ndlm.co.in/guidelines/arid-tick-control'
      }
    ],
    immediateRemedies: [
      'Gently groom and clean tick attachment sites with neem leaf decoction.',
      'Apply herbal fly & tick repellent spray (Custard apple seed + neem oil).'
    ],
    recommendedVeterinaryActions: [
      'Pour-on synthetic pyrethroid (Flumethrin 1%) treatment.',
      'Screen blood smear for Theileria / Babesia haemoprotozoa at next visit.'
    ],
    biosecurityProtocol: [
      'Spray shed walls and cracks with lime and acaricide to break tick breeding cycle.'
    ],
    gpsMetadata: {
      lat: 25.7521,
      lng: 71.3967,
      district: 'Barmer',
      state: 'Rajasthan'
    },
    audioLanguage: 'hi'
  },
  {
    id: 'diag-7714-01',
    animalId: 'anim-on-7714',
    timestamp: '2026-08-21T11:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1000&q=80',
    predictedBreed: 'Ongole (Bos indicus)',
    breedConfidence: 98.6,
    detectedSpecies: 'Cattle (Zebu)',
    coatCondition: 'Glossy & Healthy',
    postureAssessment: {
      spineCurvature: 'Normal Straight',
      headCarriage: 'Alert & Elevated',
      weightBearing: 'Equal on all 4 limbs',
      gaitConfidence: 99.0
    },
    bodyConditionScore: 4.1,
    conformationalMetrics: [
      { metric: 'Sire Muscularity Score', score: 98, benchmark: '90-100 Ideal', status: 'Optimal', details: 'Robust thoracic muscularity and prominent hump characteristic of prime Ongole breeding bulls.' },
      { metric: 'Stifle & Hock Integrity', score: 96, benchmark: '85-100 Healthy', status: 'Optimal', details: 'Excellent limb strength and weight bearing.' }
    ],
    lesions: [],
    primaryDiagnosis: 'Certified Breeding Bull - Excellent Conformation & Disease Free',
    pregnancyStatus: 'Not Applicable / Male',
    lactationStatus: 'Not Applicable / Male',
    milkYieldImpact: 'N/A - Breeding Sire',
    differentialDiagnoses: [
      {
        disease: 'Healthy Breeding Bull (Negative for TB, JD, Brucellosis)',
        probability: 99.8,
        keyIndications: ['High vigor', 'Clean semen testing record', 'Optimal body score'],
        sourceDataset: 'NDDB Bull Registry'
      }
    ],
    severityGrade: 'Mild',
    ragCitations: [
      {
        source: 'Bharat Pashudhan (NDLM)',
        title: 'National Standards for Indigenous Breeding Bulls and Semen Stations',
        section: 'Section 1.3: Mandatory Semiannual Disease Clearance Protocols',
        relevanceScore: 0.96,
        guidelineSnippet: 'Breeding sires must maintain strict quarantine and biannual certification against Tuberculosis, Paratuberculosis (JD), and Brucellosis.',
        url: 'https://bharatpashudhan.ndlm.co.in/guidelines/bull-biosecurity'
      }
    ],
    immediateRemedies: [
      'Provide regular exercise, fresh green fodder, and high-protein bull ration.'
    ],
    recommendedVeterinaryActions: [
      'Biannual breeding soundness evaluation (BSE) and semen motility testing.',
      'FMD booster vaccination scheduled for 2026-09-10.'
    ],
    biosecurityProtocol: [
      'Maintain isolated bull paddock and strict bio-exclusion.'
    ],
    gpsMetadata: {
      lat: 15.2185,
      lng: 79.9042,
      district: 'Prakasam',
      state: 'Andhra Pradesh'
    },
    audioLanguage: 'te'
  }
];

export const MOCK_OUTBREAK_ALERTS: OutbreakAlert[] = [
  {
    id: 'out-01',
    diseaseName: 'Lumpy Skin Disease (LSD)',
    affectedBreed: 'Gir & Kankrej Cross',
    district: 'Junagadh & Rajkot',
    state: 'Gujarat',
    activeCasesCount: 42,
    riskLevel: 'High',
    centerCoords: { lat: 21.5222, lng: 70.4579 },
    radiusKm: 25,
    lastUpdated: '2 hours ago',
    actionRequired: 'Ring vaccination deployment and vector control spray across dairy clusters.'
  },
  {
    id: 'out-02',
    diseaseName: 'Foot and Mouth Disease (FMD Type-O)',
    affectedBreed: 'Murrah Buffalo & Crossbreds',
    district: 'Hisar & Rohtak',
    state: 'Haryana',
    activeCasesCount: 18,
    riskLevel: 'Severe Epidemic',
    centerCoords: { lat: 29.0588, lng: 76.0856 },
    radiusKm: 15,
    lastUpdated: '35 mins ago',
    actionRequired: 'Immediate livestock market closure and quarantine barricades on state highway.'
  },
  {
    id: 'out-03',
    diseaseName: 'Sub-clinical & Acute Mastitis',
    affectedBreed: 'HF & Jersey Crossbreds',
    district: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    activeCasesCount: 29,
    riskLevel: 'Medium',
    centerCoords: { lat: 19.8762, lng: 75.3433 },
    radiusKm: 30,
    lastUpdated: '6 hours ago',
    actionRequired: 'Milking hygiene audit and somatic cell count (SCC) testing camps.'
  }
];

export const MOCK_RAG_INDEX: RagIndexItem[] = [
  {
    id: 'rag-ndlm-001',
    source: 'Bharat Pashudhan',
    title: 'NDLM Standard Operating Procedure: Bovine Viral Diseases (FMD & LSD)',
    category: 'Viral Infections',
    contentSnippet: 'Foot and Mouth Disease manifests with acute hyperthermia, vesicles on tongue, dental pad, and interdigital cleft. Morbidity reaches up to 100% in susceptible naive herds. Differential diagnosis includes Vesicular Stomatitis and Bovine Viral Diarrhea (BVD).',
    vectorId: 'vec_e5_0981a',
    dimension: 1024,
    lastSynced: '2026-08-21T18:00:00Z',
    similarityScore: 0.96
  },
  {
    id: 'rag-ieee-002',
    source: 'IEEE Dataport',
    title: 'Indian Indigenous Cattle & Buffalo Breed Morphometric Feature Dataset',
    category: 'Breed Biometrics',
    contentSnippet: 'Morphological vectors for 32 indigenous breeds (Gir, Sahiwal, Red Sindhi, Tharparkar, Ongole, Murrah, Nili-Ravi, Jaffarabadi). Horn orientation, dewlap volume, and coat pigmentation patterns yield 96.8% multi-class precision in field lighting.',
    vectorId: 'vec_e5_0411b',
    dimension: 1024,
    lastSynced: '2026-08-20T12:00:00Z',
    similarityScore: 0.91
  },
  {
    id: 'rag-cid-003',
    source: 'CID Dataset',
    title: 'Cattle Identification & Muzzle Biometric Patterns Repository',
    category: 'Breed Biometrics',
    contentSnippet: 'Muzzle bead pattern architecture and unique facial contour ratios establish tamper-proof biometric identification across bovine species, resistant to ear-tag loss and physical tampering.',
    vectorId: 'vec_e5_0782c',
    dimension: 1024,
    lastSynced: '2026-08-19T09:30:00Z',
    similarityScore: 0.89
  },
  {
    id: 'rag-icar-004',
    source: 'ICAR Guidelines',
    title: 'Integrated Ethno-Veterinary Practices for Bovine Mastitis & Dermatitis',
    category: 'Bacterial & Parasitic',
    contentSnippet: 'Validated herbal formulation for bovine mastitis: Aloe vera (250g), Curcuma longa powder (50g), and Lime (15g) blended into a topical paste applied to the affected quarter after complete evacuation, reducing somatic cell count in 3-5 days.',
    vectorId: 'vec_e5_1023d',
    dimension: 1024,
    lastSynced: '2026-08-22T00:00:00Z',
    similarityScore: 0.87
  },
  {
    id: 'rag-ndlm-005',
    source: 'Bharat Pashudhan',
    title: 'Body Condition Scoring (BCS) 5-Point Standard for Tropical Zebu & Crossbreds',
    category: 'Nutritional & BCS',
    contentSnippet: 'BCS 1.0 (Emaciated): Deep cavities around tailhead, individual transverse processes sharp. BCS 3.0 (Ideal): Moderate fat cover over ribs, hook and pin bones rounded. BCS 5.0 (Obese): Tailhead buried in fat, flat dorsal back.',
    vectorId: 'vec_e5_0219e',
    dimension: 1024,
    lastSynced: '2026-08-21T06:00:00Z',
    similarityScore: 0.84
  }
];
