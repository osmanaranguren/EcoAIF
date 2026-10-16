import { NormativeCaneca, WasteCategoryInfo, WasteItemSample } from '../types.ts';

export const NORMATIVAS_INFO: Record<NormativeCaneca, WasteCategoryInfo> = {
  Blanca: {
    id: 'Blanca',
    title: 'Caneca Blanca',
    badgeLabel: 'Aprovechables',
    colorHex: '#FFFFFF',
    textHex: '#121212',
    borderHex: '#B0BEC5',
    baseNorm: 'Res. 2184 de 2019 & Res. 803 de 2024',
    allowedItems: [
      'Plásticos rígidos y flexibles (PET-1, PEAD-2, PEBD-4, PP-5, PS-6)',
      'Botellas de vidrio y frascos',
      'Metales y latas de aluminio / hojalata',
      'Envases multicapa (Tetra Pak)',
      'Papel de archivo, periódico y cartón secos y limpios'
    ],
    instructions: 'Residuo aprovechable limpio y seco · Res. 803/2024',
    iconName: 'delete',
    subIndicator: 'Economía Circular / Trazabilidad de Resina Plástica'
  },
  Verde: {
    id: 'Verde',
    title: 'Caneca Verde',
    badgeLabel: 'Orgánicos Aprovechables',
    colorHex: '#2E7D32',
    textHex: '#FFFFFF',
    borderHex: '#4CAF50',
    baseNorm: 'Res. 2184 de 2019',
    allowedItems: [
      'Restos de comida cruda o preparada',
      'Cáscaras de frutas y verduras',
      'Hojas secas, poda de jardines y restos vegetales',
      'Residuos agrícolas y orgánicos biodegradables'
    ],
    instructions: 'Residuo orgánico aprovechable para compostaje y biogás',
    iconName: 'eco',
    subIndicator: 'Compostaje / Valorización Orgánica'
  },
  Negra: {
    id: 'Negra',
    title: 'Caneca Negra',
    badgeLabel: 'No Aprovechables',
    colorHex: '#1A1A1A',
    textHex: '#E5E2E1',
    borderHex: '#424242',
    baseNorm: 'Res. 2184 de 2019',
    allowedItems: [
      'Papel higiénico y pañuelos desechables',
      'Servilletas usadas y toallas de cocina contaminadas',
      'Papeles y cartones con grasa o comida',
      'Empaques metalizados de snacks',
      'Icopor (poliestireno expandido) contaminado'
    ],
    instructions: 'Residuo ordinario no aprovechable · Disposición final a relleno sanitario',
    iconName: 'trash',
    subIndicator: 'Disposición a Relleno Sanitario'
  },
  Roja_RESPEL: {
    id: 'Roja_RESPEL',
    title: 'Contenedor Rojo (RESPEL)',
    badgeLabel: 'Peligrosos - RESPEL',
    colorHex: '#D32F2F',
    textHex: '#FFFFFF',
    borderHex: '#FF5252',
    baseNorm: 'Decreto 4741 de 2005 & Res. 839 de 2023',
    allowedItems: [
      'Aceites lubricantes usados y filtros',
      'Envases de disolventes, pinturas y aerosoles',
      'Recipientes con agroquímicos o plaguicidas',
      'Residuos hospitalarios o con riesgo biológico'
    ],
    instructions: 'Alerta RESPEL: Disposición especial obligatoria · Reporte RUA / IDEAM',
    iconName: 'warning',
    subIndicator: 'Gestor Autorizado / Reporte RUA - IDEAM'
  },
  RAEE_Posconsumo: {
    id: 'RAEE_Posconsumo',
    title: 'Puntos Posconsumo RAEE',
    badgeLabel: 'RAEE Posconsumo',
    colorHex: '#0288D1',
    textHex: '#FFFFFF',
    borderHex: '#29B6F6',
    baseNorm: 'Ley 1672 de 2013 & Res. 851 de 2022',
    allowedItems: [
      'Pilas y acumuladores de litio, alcalinas y níquel',
      'Teléfonos móviles, tabletas y componentes electrónicos',
      'Bombillas fluorescentes, ahorradoras y luminarias LED',
      'Cables, cargadores y periféricos de cómputo'
    ],
    instructions: 'Disposición exclusiva en canal posconsumo RAEE autorizado',
    iconName: 'devices',
    subIndicator: 'Canal Posconsumo Nacional Autorizado'
  },
  Prohibido_Ley2232: {
    id: 'Prohibido_Ley2232',
    title: 'Plásticos Prohibidos (Ley 2232)',
    badgeLabel: 'PROHIBIDO LEY 2232',
    colorHex: '#D50000',
    textHex: '#FFFFFF',
    borderHex: '#FF1744',
    baseNorm: 'Ley 2232 de 2022',
    allowedItems: [
      'Pitillos plásticos (pajillas)',
      'Mezcladores plásticos de café/bebidas',
      'Soportes plásticos para inflar globos',
      'Copitos de algodón con vástago de plástico',
      'Bolsas de punto de pago plásticas de un solo uso'
    ],
    instructions: 'Artículo prohibido en Colombia. NO debe depositarse en canecas comunes. Retorne al proveedor o deposite en punto RESPEL.',
    iconName: 'block',
    subIndicator: 'Infracción Normativa Ambiental Ley 2232'
  }
};

export const WASTE_SAMPLES: WasteItemSample[] = [
  {
    id: 'pet_bottle',
    name: 'Botella PET-1',
    category: 'Botella Plástica',
    caneca: 'Blanca',
    resinType: 'PET-1',
    confidence: 96.4,
    isLey2232Prohibited: false,
    normReference: 'Res. 2184/2019 & Res. 803/2024',
    disposalAdvice: 'Residuo aprovechable limpio y seco · Res. 803/2024',
    sensorOverlay: {
      optSensor: 'OPT_SENS_01: ACTIVE',
      specAnalysis: 'SPEC_ANALYSIS: COMPLETE',
      irReflectance: 'IR_REFLECTANCE: 0.82'
    },
    sampleImage: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    boundingBox: { x: 120, y: 50, width: 360, height: 420 }
  },
  {
    id: 'plastic_straw',
    name: 'Pitillo Plástico (Pajilla)',
    category: 'Plástico de Un Solo Uso',
    caneca: 'Prohibido_Ley2232',
    resinType: 'PP-5',
    confidence: 99.8,
    isLey2232Prohibited: true,
    normReference: 'Ley 2232 de 2022',
    disposalAdvice: 'Este artículo está clasificado como Plástico de Un Solo Uso (Ley 2232) y NO DEBE ser depositado en los contenedores comunes.',
    sensorOverlay: {
      optSensor: 'SCAN_ACTV | CONF 99.8%',
      specAnalysis: 'PROHIBITED_POLYMER_DETECTED',
      irReflectance: 'POLY_SPECTRA: PP_SINGLE_USE'
    },
    sampleImage: 'https://images.unsplash.com/photo-1584727638096-042c45049ebe?auto=format&fit=crop&w=800&q=80',
    boundingBox: { x: 100, y: 110, width: 380, height: 320 }
  },
  {
    id: 'apple_core',
    name: 'Restos de Fruta (Manzana)',
    category: 'Residuo Orgánico',
    caneca: 'Verde',
    resinType: 'N/A',
    confidence: 97.5,
    isLey2232Prohibited: false,
    normReference: 'Res. 2184 de 2019',
    disposalAdvice: 'Residuo orgánico biodegradable apto para procesos de compostaje y lombricultura institucional.',
    sensorOverlay: {
      optSensor: 'OPT_SENS_01: ACTIVE',
      specAnalysis: 'BIO_ORGANIC: HIGH_MOISTURE',
      irReflectance: 'ORGANIC_SIG: 0.94'
    },
    sampleImage: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80',
    boundingBox: { x: 140, y: 90, width: 320, height: 340 }
  },
  {
    id: 'dirty_napkin',
    name: 'Servilleta Usada con Grasa',
    category: 'No Aprovechable Ordinario',
    caneca: 'Negra',
    resinType: 'N/A',
    confidence: 95.1,
    isLey2232Prohibited: false,
    normReference: 'Res. 2184 de 2019',
    disposalAdvice: 'Papel contaminado con grasa o fluidos biológicos no apto para reciclaje. Destino relleno sanitario.',
    sensorOverlay: {
      optSensor: 'OPT_SENS_01: ACTIVE',
      specAnalysis: 'CONTAMINATED_FIBER: TRUE',
      irReflectance: 'GREASE_INDICATOR: HIGH'
    },
    sampleImage: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&w=800&q=80',
    boundingBox: { x: 130, y: 80, width: 340, height: 350 }
  },
  {
    id: 'lithium_battery',
    name: 'Batería de Litio / Pila',
    category: 'Posconsumo RAEE',
    caneca: 'RAEE_Posconsumo',
    resinType: 'N/A',
    confidence: 98.9,
    isLey2232Prohibited: false,
    normReference: 'Ley 1672 de 2013 & Res. 851 de 2022',
    disposalAdvice: 'Residuo de aparato eléctrico/electrónico. Disposición en contenedor azul de recolección selectiva posconsumo.',
    sensorOverlay: {
      optSensor: 'OPT_SENS_01: ACTIVE',
      specAnalysis: 'METALLIC_CORE: LI_ION_DETECTED',
      irReflectance: 'DANGER_HAZARD: MODERATE'
    },
    sampleImage: 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=800&q=80',
    boundingBox: { x: 160, y: 120, width: 280, height: 260 }
  },
  {
    id: 'solvent_can',
    name: 'Envase de Solvente Químico',
    category: 'Residuo Peligroso (RESPEL)',
    caneca: 'Roja_RESPEL',
    resinType: 'PEAD-2',
    confidence: 96.8,
    isLey2232Prohibited: false,
    normReference: 'Decreto 4741 de 2005 & Res. 839 de 2023',
    disposalAdvice: 'Contenedor con restos químicos peligrosos. Requiere disposición en celda de seguridad y reporte RUA.',
    sensorOverlay: {
      optSensor: 'OPT_SENS_01: ACTIVE',
      specAnalysis: 'HAZCHEM_SIG: HYDROCARBON_RESIDUE',
      irReflectance: 'RISK_INDEX: HIGH_RESPEL'
    },
    sampleImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
    boundingBox: { x: 140, y: 60, width: 320, height: 380 }
  },
  {
    id: 'ambiguous_item',
    name: 'Objeto Difuso / No Identificado',
    category: 'Indeterminado',
    caneca: 'Negra',
    resinType: 'N/A',
    confidence: 42.1,
    isLey2232Prohibited: false,
    normReference: 'Inspección Requerida',
    disposalAdvice: 'Residuo no identificado con certeza suficiente.',
    sensorOverlay: {
      optSensor: 'OPT_SENS_01: ACTIVE',
      specAnalysis: 'LOW_CONFIDENCE_DIFFUSE',
      irReflectance: 'CONF_SCORE: 42.1% (SUB-THRESHOLD)'
    },
    sampleImage: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    boundingBox: { x: 120, y: 100, width: 360, height: 300 }
  }
];
