import React, { useState, useEffect } from 'react';
import { ClassificationRecord, KioskStats } from '../types.ts';
import {
  X,
  Download,
  Database,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileSpreadsheet,
  PieChart
} from 'lucide-react';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecordAddedSignal?: number; // to re-fetch when new record added
}

export const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  onRecordAddedSignal
}) => {
  const [records, setRecords] = useState<ClassificationRecord[]>([]);
  const [stats, setStats] = useState<KioskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCaneca, setSelectedCaneca] = useState<string>('all');
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recordsRes, statsRes] = await Promise.all([
        fetch('/api/records?limit=200'),
        fetch('/api/records/stats')
      ]);

      if (!recordsRes.ok) {
        throw new Error(`Error ${recordsRes.status}: ${recordsRes.statusText}`);
      }
      if (!statsRes.ok) {
        throw new Error(`Error ${statsRes.status}: ${statsRes.statusText}`);
      }

      const recordsData = await recordsRes.json();
      const statsData = await statsRes.json();

      setRecords(recordsData.records || []);
      setStats(statsData);
    } catch (err: any) {
      console.error('Audit fetch error:', err);
      setError(err.message || 'Error al conectar con la base de datos local SQLite');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, onRecordAddedSignal]);

  if (!isOpen) return null;

  // Filtering
  const filteredRecords = records.filter((r) => {
    if (onlyAlerts && !r.alerta_ley_2232_activa) return false;
    if (selectedCaneca !== 'all' && r.caneca_destino !== selectedCaneca) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.categoria_residuo.toLowerCase().includes(q);
      const matchResin = (r.subtipo_resina || '').toLowerCase().includes(q);
      const matchCaneca = r.caneca_destino.toLowerCase().includes(q);
      return matchName || matchResin || matchCaneca;
    }
    return true;
  });

  const getCanecaBadge = (caneca: string) => {
    switch (caneca) {
      case 'Blanca':
        return 'bg-white text-slate-800 border border-slate-300 font-semibold';
      case 'Verde':
        return 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold';
      case 'Negra':
        return 'bg-slate-900 text-white font-semibold';
      case 'Roja_RESPEL':
        return 'bg-rose-50 text-rose-800 border border-rose-300 font-semibold';
      case 'RAEE_Posconsumo':
        return 'bg-indigo-50 text-indigo-800 border border-indigo-300 font-semibold';
      case 'Prohibido_Ley2232':
        return 'bg-rose-100 text-rose-800 border border-rose-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900">
        {/* Top Header */}
        <div className="p-5 md:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  Auditoría Ambiental & Persistencia SQLite
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  SQLite + CSV Logger Activo
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Trazabilidad completa según PRD / TRD · Archivo en disco: <code className="font-mono text-slate-700">metrics/registro_clasificacion.csv</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/records/export-csv"
              download="registro_clasificacion.csv"
              className="px-3.5 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="Descargar archivo CSV compatible con IDEAM / RUA"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </a>
            <button
              onClick={fetchData}
              className="p-2 rounded-md bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KPI / Stats Ribbon */}
        {stats && (
          <div className="p-4 md:p-6 bg-white border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                Total Registros
              </span>
              <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                {stats.total}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                Tasa Aprovechables
              </span>
              <div className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                {stats.aprovechablePercentage}%
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                Alertas Ley 2232
              </span>
              <div className="text-2xl font-bold text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                {stats.alertCount}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                Resinas Trazadas
              </span>
              <div className="text-xs font-bold text-slate-800 flex flex-wrap gap-1 mt-1 font-mono">
                {Object.keys(stats.byResin).length > 0 ? (
                  Object.entries(stats.byResin).map(([resin, cnt]) => (
                    <span key={resin} className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-800 text-[11px]">
                      {resin}: {cnt}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 font-normal">Sin resinas registradas</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar residuo o resina..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              <Filter className="w-3.5 h-3.5" />
              <span>Caneca:</span>
            </div>
            <select
              value={selectedCaneca}
              onChange={(e) => setSelectedCaneca(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
            >
              <option value="all">Todas las canecas</option>
              <option value="Blanca">Blanca (Aprovechables)</option>
              <option value="Verde">Verde (Orgánicos)</option>
              <option value="Negra">Negra (No aprovechables)</option>
              <option value="Roja_RESPEL">Roja (RESPEL)</option>
              <option value="RAEE_Posconsumo">Azul (RAEE)</option>
              <option value="Prohibido_Ley2232">Prohibidos Ley 2232</option>
            </select>

            <button
              onClick={() => setOnlyAlerts(!onlyAlerts)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors border cursor-pointer ${
                onlyAlerts
                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Solo Ley 2232
            </button>
          </div>
        </div>

        {/* Data Table / Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-[250px]">
          {/* Loading State */}
          {loading && (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-500">
              <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
              <p className="text-xs font-mono">Consultando base de datos SQLite y auditoría CSV...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-center p-6 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-8 h-8 text-rose-600" />
              <h4 className="text-base font-bold text-rose-900">Error de Conexión a Base de Datos</h4>
              <p className="text-xs text-rose-700 max-w-md">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 px-3 py-1.5 bg-rose-600 text-white rounded-md text-xs font-medium cursor-pointer"
              >
                Reintentar consulta
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredRecords.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-center p-6 border border-dashed border-slate-300 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800">No se encontraron registros</h4>
              <p className="text-xs text-slate-500 max-w-md">
                {searchQuery || selectedCaneca !== 'all' || onlyAlerts
                  ? 'No hay eventos que coincidan con los filtros aplicados. Intenta restablecer los filtros de búsqueda.'
                  : 'Aún no se han completado ciclos de persistencia. Acerque residuos al visor del kiosco para registrarlos.'}
              </p>
            </div>
          )}

          {/* Data Table */}
          {!loading && !error && filteredRecords.length > 0 && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs text-slate-800">
                <thead className="text-[11px] font-mono uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Fecha y Hora</th>
                    <th className="py-3 px-3">Caneca Destino</th>
                    <th className="py-3 px-3">Categoría / Residuo</th>
                    <th className="py-3 px-3">Resina</th>
                    <th className="py-3 px-3">Confianza</th>
                    <th className="py-3 px-3">Ley 2232</th>
                    <th className="py-3 px-3">Sensor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredRecords.map((r) => (
                    <tr
                      key={r.id || `${r.timestamp}-${Math.random()}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono text-slate-500">#{r.id || '-'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">
                        {new Date(r.timestamp).toLocaleString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] uppercase tracking-wide inline-block ${getCanecaBadge(
                            r.caneca_destino
                          )}`}
                        >
                          {r.caneca_destino.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {r.categoria_residuo}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-indigo-600 font-medium">
                        {r.subtipo_resina || 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span
                          className={
                            r.porcentaje_confianza >= 90
                              ? 'text-emerald-600'
                              : r.porcentaje_confianza >= 75
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }
                        >
                          {r.porcentaje_confianza.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {r.alerta_ley_2232_activa ? (
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 font-mono text-[10px] font-bold">
                            ⚠️ PROHIBIDO
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-mono text-[10px] flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> OK
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                        {r.sensor_ref || 'OPT_SENS_01'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <span className="font-mono">
            Mostrando {filteredRecords.length} de {records.length} registros registrados en SQLite
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-white hover:bg-slate-100 text-slate-800 font-semibold border border-slate-300 shadow-xs transition-colors cursor-pointer"
            >
              Cerrar Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
