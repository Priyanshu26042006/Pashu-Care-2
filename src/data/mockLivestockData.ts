import { AnimalProfile, DiagnosticAssessment, OutbreakAlert, RagIndexItem } from '../types';

export const SAMPLE_CATTLE_PRESETS = [
  {
    id: 'preset-gir-lumpy',
    title: 'Gir Cow - Suspected Nodular Lesions (Lumpy Skin)',
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
    title: 'Murrah Buffalo - Suspected Oral & Foot Lesions (FMD)',
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
    id: 'preset-sahiwal-healthy',
    title: 'Sahiwal Dairy Cow - Optimal BCS & Posture',
    breed: 'Sahiwal (Zebu Cattle)',
    species: 'Cattle',
    earTag: 'IN-PB-2024-1189',
    imageUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=1000&q=80',
    description: 'Reddish-dun smooth coat, prominent hump, well-developed symmetrical udder. Normal straight spine and alert posture.',
    symptoms: 'Routine herd health check, high milk yield, normal rumination',
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
    id: 'preset-crossbred-mastitis',
    title: 'HF Crossbred Cow - Udder Swelling (Acute Mastitis)',
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
    quarantineStatus: 'Recommended'
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=600&q=80',
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
    audioLanguage: 'hi'
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
