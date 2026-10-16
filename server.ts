import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { getRecords, insertRecord, getStats, getCsvFilePath, getDb } from './server/db.ts';
import { analyzeWasteImage } from './server/classifier.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // Initialize SQLite database
  await getDb();

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      mode: 'offline-standalone',
      kiosk_id: 'Kiosk #4022',
      normativas: ['Res. 2184/2019', 'Ley 2232/2022', 'Res. 803/2024', 'Dec. 4741/2005', 'Ley 1672/2013'],
      timestamp: new Date().toISOString()
    });
  });

  // Multimodal AI Waste Classification endpoint (Gemini Vision)
  app.post('/api/classify', async (req, res) => {
    try {
      const { image, mimeType } = req.body;
      if (!image) {
        return res.status(400).json({ error: 'Image data is required in base64 format' });
      }

      const result = await analyzeWasteImage(image, mimeType || 'image/jpeg');
      res.json(result);
    } catch (err: any) {
      console.error('Error during waste classification:', err);
      res.status(500).json({ error: 'Classification failed', details: err.message });
    }
  });

  // Get historical classification records
  app.get('/api/records', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
      const records = await getRecords(limit);
      res.json({ records, count: records.length });
    } catch (err: any) {
      console.error('Error fetching records:', err);
      res.status(500).json({ error: 'Failed to fetch records', details: err.message });
    }
  });

  // Post classification record (anti-rebote persistence trigger)
  app.post('/api/records', async (req, res) => {
    try {
      const {
        caneca_destino,
        categoria_residuo,
        subtipo_resina,
        porcentaje_confianza,
        alerta_ley_2232_activa,
        sensor_ref,
        notas,
        kiosk_id
      } = req.body;

      if (!caneca_destino || !categoria_residuo || porcentaje_confianza === undefined) {
        return res.status(400).json({ error: 'Missing required classification fields' });
      }

      const record = await insertRecord({
        timestamp: new Date().toISOString(),
        kiosk_id: kiosk_id || 'Kiosk #4022',
        caneca_destino,
        categoria_residuo,
        subtipo_resina: subtipo_resina || 'N/A',
        porcentaje_confianza: Number(porcentaje_confianza),
        alerta_ley_2232_activa: Boolean(alerta_ley_2232_activa),
        sensor_ref: sensor_ref || 'OPT_SENS_01',
        notas: notas || ''
      });

      res.status(201).json({ success: true, record });
    } catch (err: any) {
      console.error('Error inserting record:', err);
      res.status(500).json({ error: 'Failed to save record', details: err.message });
    }
  });

  // Get statistics for circular economy & compliance audit
  app.get('/api/records/stats', async (req, res) => {
    try {
      const stats = await getStats();
      res.json(stats);
    } catch (err: any) {
      console.error('Error getting stats:', err);
      res.status(500).json({ error: 'Failed to get stats', details: err.message });
    }
  });

  // Download raw CSV audit log as specified by PRD
  app.get('/api/records/export-csv', (req, res) => {
    try {
      const csvPath = getCsvFilePath();
      if (!fs.existsSync(csvPath)) {
        return res.status(404).send('CSV file not created yet');
      }
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="registro_clasificacion.csv"');
      const fileStream = fs.createReadStream(csvPath);
      fileStream.pipe(res);
    } catch (err: any) {
      console.error('Error exporting CSV:', err);
      res.status(500).json({ error: 'Failed to export CSV' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Punto Ecológico Inteligente] Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
