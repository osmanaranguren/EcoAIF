export type KioskState =
  | 'standby'
  | 'classifying'
  | 'confirmed'
  | 'prohibited_alert'
  | 'low_confidence'
  | 'camera_error';

export type NormativeCaneca =
  | 'Blanca'
  | 'Verde'
  | 'Negra'
  | 'Roja_RESPEL'
  | 'RAEE_Posconsumo'
  | 'Prohibido_Ley2232';

export interface WasteCategoryInfo {
  id: NormativeCaneca;
  title: string;
  badgeLabel: string;
  colorHex: string;
  textHex: string;
  borderHex: string;
  baseNorm: string;
  allowedItems: string[];
  instructions: string;
  iconName: string;
  subIndicator?: string;
}

export interface WasteItemSample {
  id: string;
  name: string;
  category: string;
  caneca: NormativeCaneca;
  resinType: string;
  confidence: number;
  isLey2232Prohibited: boolean;
  normReference: string;
  disposalAdvice: string;
  sensorOverlay: {
    optSensor: string;
    specAnalysis: string;
    irReflectance: string;
  };
  sampleImage: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ClassificationRecord {
  id?: number;
  timestamp: string;
  kiosk_id: string;
  caneca_destino: string;
  categoria_residuo: string;
  subtipo_resina: string;
  porcentaje_confianza: number;
  alerta_ley_2232_activa: boolean;
  sensor_ref?: string;
  notas?: string;
}

export interface KioskStats {
  total: number;
  byCaneca: Record<string, number>;
  alertCount: number;
  byResin: Record<string, number>;
  aprovechablePercentage: number;
}
