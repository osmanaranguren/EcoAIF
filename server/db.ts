import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';

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

let dbInstance: any = null;
const DATA_DIR = path.join(process.cwd(), 'data');
const METRICS_DIR = path.join(process.cwd(), 'metrics');
const DB_FILE = path.join(DATA_DIR, 'kiosk.sqlite');
const CSV_FILE = path.join(METRICS_DIR, 'registro_clasificacion.csv');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(METRICS_DIR)) {
  fs.mkdirSync(METRICS_DIR, { recursive: true });
}

// Ensure CSV file has header
if (!fs.existsSync(CSV_FILE)) {
  const csvHeader = 'timestamp,caneca_destino,categoria_residuo,subtipo_resina,porcentaje_confianza,alerta_ley_2232_activa,kiosk_id\n';
  fs.writeFileSync(CSV_FILE, csvHeader, 'utf8');
}

export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    dbInstance = new SQL.Database(fileBuffer);
  } else {
    dbInstance = new SQL.Database();
  }

  // Create table per TRD ERD
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS registro_clasificacion (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      kiosk_id TEXT NOT NULL,
      caneca_destino TEXT NOT NULL,
      categoria_residuo TEXT NOT NULL,
      subtipo_resina TEXT,
      porcentaje_confianza REAL NOT NULL,
      alerta_ley_2232_activa INTEGER NOT NULL,
      sensor_ref TEXT,
      notas TEXT
    );
  `);

  // Seed with initial realistic data if empty
  const countRes = dbInstance.exec(`SELECT COUNT(*) as count FROM registro_clasificacion`);
  const currentCount = countRes[0]?.values[0]?.[0] || 0;

  if (currentCount === 0) {
    seedInitialRecords(dbInstance);
    saveDbToDisk(dbInstance);
  }

  return dbInstance;
}

function saveDbToDisk(db: any) {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite to disk:', err);
  }
}

function appendToCsv(record: ClassificationRecord) {
  try {
    const line = `${record.timestamp},${record.caneca_destino},${record.categoria_residuo},${record.subtipo_resina || 'N/A'},${record.porcentaje_confianza.toFixed(1)},${record.alerta_ley_2232_activa ? 'TRUE' : 'FALSE'},${record.kiosk_id}\n`;
    fs.appendFileSync(CSV_FILE, line, 'utf8');
  } catch (err) {
    console.error('Error appending to CSV logger:', err);
  }
}

function seedInitialRecords(db: any) {
  const samples: ClassificationRecord[] = [
    {
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      kiosk_id: 'Kiosk #4022',
      caneca_destino: 'Blanca',
      categoria_residuo: 'Botella PET-1',
      subtipo_resina: 'PET-1',
      porcentaje_confianza: 98.4,
      alerta_ley_2232_activa: false,
      sensor_ref: 'OPT_SENS_01',
      notas: 'Res. 803/2024 aprovechable'
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      kiosk_id: 'Kiosk #4022',
      caneca_destino: 'Verde',
      categoria_residuo: 'Restos de Fruta (Manzana)',
      subtipo_resina: 'N/A',
      porcentaje_confianza: 96.1,
      alerta_ley_2232_activa: false,
      sensor_ref: 'OPT_SENS_01',
      notas: 'Compostaje institucional'
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      kiosk_id: 'Kiosk #4022',
      caneca_destino: 'Negra',
      categoria_residuo: 'Servilleta de papel usada',
      subtipo_resina: 'N/A',
      porcentaje_confianza: 94.7,
      alerta_ley_2232_activa: false,
      sensor_ref: 'OPT_SENS_01',
      notas: 'Contaminado con grasa'
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      kiosk_id: 'Kiosk #4022',
      caneca_destino: 'Prohibido_Ley2232',
      categoria_residuo: 'Pitillo Plástico (Pajilla)',
      subtipo_resina: 'PP-5',
      porcentaje_confianza: 99.8,
      alerta_ley_2232_activa: true,
      sensor_ref: 'OPT_SENS_01',
      notas: 'Prohibido Ley 2232/2022'
    },
    {
      timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
      kiosk_id: 'Kiosk #4022',
      caneca_destino: 'RAEE_Posconsumo',
      categoria_residuo: 'Batería de Litio',
      subtipo_resina: 'N/A',
      porcentaje_confianza: 97.2,
      alerta_ley_2232_activa: false,
      sensor_ref: 'OPT_SENS_01',
      notas: 'Ley 1672/2013'
    },
    {
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      kiosk_id: 'Kiosk #4022',
      caneca_destino: 'Roja_RESPEL',
      categoria_residuo: 'Envase de Solvente Químico',
      subtipo_resina: 'PEAD-2',
      porcentaje_confianza: 95.8,
      alerta_ley_2232_activa: false,
      sensor_ref: 'OPT_SENS_01',
      notas: 'Dec. 4741/2005'
    },
    {
      timestamp: new Date(Date.now() - 900000).toISOString(),
      kiosk_id: 'Kiosk #4022',
      caneca_destino: 'Blanca',
      categoria_residuo: 'Lata de Aluminio',
      subtipo_resina: 'Metal',
      porcentaje_confianza: 99.1,
      alerta_ley_2232_activa: false,
      sensor_ref: 'OPT_SENS_01',
      notas: 'Aprovechable limpio y seco'
    }
  ];

  for (const s of samples) {
    db.run(
      `INSERT INTO registro_clasificacion 
       (timestamp, kiosk_id, caneca_destino, categoria_residuo, subtipo_resina, porcentaje_confianza, alerta_ley_2232_activa, sensor_ref, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.timestamp,
        s.kiosk_id,
        s.caneca_destino,
        s.categoria_residuo,
        s.subtipo_resina,
        s.porcentaje_confianza,
        s.alerta_ley_2232_activa ? 1 : 0,
        s.sensor_ref || 'OPT_SENS_01',
        s.notas || ''
      ]
    );
    appendToCsv(s);
  }
}

export async function insertRecord(record: ClassificationRecord): Promise<ClassificationRecord> {
  const db = await getDb();
  const timestamp = record.timestamp || new Date().toISOString();
  const kiosk_id = record.kiosk_id || 'Kiosk #4022';
  const alertVal = record.alerta_ley_2232_activa ? 1 : 0;

  db.run(
    `INSERT INTO registro_clasificacion 
     (timestamp, kiosk_id, caneca_destino, categoria_residuo, subtipo_resina, porcentaje_confianza, alerta_ley_2232_activa, sensor_ref, notas)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      timestamp,
      kiosk_id,
      record.caneca_destino,
      record.categoria_residuo,
      record.subtipo_resina || 'N/A',
      record.porcentaje_confianza,
      alertVal,
      record.sensor_ref || 'OPT_SENS_01',
      record.notas || ''
    ]
  );

  const idRes = db.exec(`SELECT last_insert_rowid() as id`);
  const newId = idRes[0]?.values[0]?.[0] || 0;

  saveDbToDisk(db);

  const created: ClassificationRecord = {
    ...record,
    id: newId,
    timestamp,
    kiosk_id
  };

  appendToCsv(created);
  return created;
}

export async function getRecords(limit = 100): Promise<ClassificationRecord[]> {
  const db = await getDb();
  const res = db.exec(`
    SELECT id, timestamp, kiosk_id, caneca_destino, categoria_residuo, subtipo_resina, porcentaje_confianza, alerta_ley_2232_activa, sensor_ref, notas
    FROM registro_clasificacion
    ORDER BY id DESC
    LIMIT ${limit}
  `);

  if (!res || res.length === 0 || !res[0].values) {
    return [];
  }

  const cols = res[0].columns;
  return res[0].values.map((row: any[]) => {
    const item: any = {};
    cols.forEach((col: string, idx: number) => {
      item[col] = row[idx];
    });
    item.alerta_ley_2232_activa = Boolean(item.alerta_ley_2232_activa);
    return item as ClassificationRecord;
  });
}

export async function getStats() {
  const db = await getDb();
  const totalRes = db.exec(`SELECT COUNT(*) as total FROM registro_clasificacion`);
  const total = totalRes[0]?.values[0]?.[0] || 0;

  const byCanecaRes = db.exec(`
    SELECT caneca_destino, COUNT(*) as count 
    FROM registro_clasificacion 
    GROUP BY caneca_destino
  `);

  const byCaneca: Record<string, number> = {};
  if (byCanecaRes[0]?.values) {
    for (const [caneca, count] of byCanecaRes[0].values) {
      byCaneca[String(caneca)] = Number(count);
    }
  }

  const alertRes = db.exec(`
    SELECT COUNT(*) as alertCount 
    FROM registro_clasificacion 
    WHERE alerta_ley_2232_activa = 1
  `);
  const alertCount = alertRes[0]?.values[0]?.[0] || 0;

  const resinsRes = db.exec(`
    SELECT subtipo_resina, COUNT(*) as count 
    FROM registro_clasificacion 
    WHERE subtipo_resina != 'N/A' AND subtipo_resina IS NOT NULL
    GROUP BY subtipo_resina
  `);

  const byResin: Record<string, number> = {};
  if (resinsRes[0]?.values) {
    for (const [resin, count] of resinsRes[0].values) {
      byResin[String(resin)] = Number(count);
    }
  }

  return {
    total,
    byCaneca,
    alertCount,
    byResin,
    aprovechablePercentage: total > 0 ? Math.round(((byCaneca['Blanca'] || 0) / total) * 100) : 0
  };
}

export function getCsvFilePath(): string {
  return CSV_FILE;
}
