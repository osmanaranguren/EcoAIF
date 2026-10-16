import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RefreshCw,
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  Zap,
  RotateCw,
  Eye,
  Crosshair,
  CheckCircle2,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import { WASTE_SAMPLES } from '../data/normativas.ts';

interface StandbyViewProps {
  onQuickSimulate: (id: string) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  webcamStream: MediaStream | null;
  isRealWebcamActive: boolean;
  onActivateWebcam: () => void;
  onCaptureFrame: () => void;
  onUploadImage: (file: File) => void;
  isAnalyzing: boolean;
  cameraErrorMessage?: string | null;
  unrecognizedMessage?: string | null;
  shutterFlash?: boolean;
  facingMode?: 'environment' | 'user';
  onToggleFacingMode?: () => void;
}

export const StandbyView: React.FC<StandbyViewProps> = ({
  onQuickSimulate,
  videoRef,
  webcamStream,
  isRealWebcamActive,
  onActivateWebcam,
  onCaptureFrame,
  onUploadImage,
  isAnalyzing,
  cameraErrorMessage,
  unrecognizedMessage,
  shutterFlash,
  facingMode = 'environment',
  onToggleFacingMode
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  const [detectProgress, setDetectProgress] = useState(0); // 0 to 100
  const [detectState, setDetectState] = useState<'idle' | 'locked' | 'capturing'>('idle');
  const [localFlash, setLocalFlash] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPixelsRef = useRef<Uint8ClampedArray | null>(null);
  const steadyFramesRef = useRef(0);
  const autoCaptureCooldownRef = useRef(false);

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('es-CO', { hour12: true }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Ensure webcam stream is attached whenever available
  useEffect(() => {
    const video = internalVideoRef.current || videoRef.current;
    if (video && webcamStream) {
      if (video.srcObject !== webcamStream) {
        video.srcObject = webcamStream;
        video.play().catch(() => {});
      }
    }
  }, [webcamStream, isRealWebcamActive]);

  // Handle manual capture trigger with shutter flash
  const handleTriggerCapture = useCallback(() => {
    if (isAnalyzing) return;
    setLocalFlash(true);
    setTimeout(() => setLocalFlash(false), 200);
    onCaptureFrame();
  }, [isAnalyzing, onCaptureFrame]);

  // Spacebar and Enter key listener for instant capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ' || e.code === 'Enter') {
        // Prevent default scrolling on space
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (isRealWebcamActive) {
            handleTriggerCapture();
          } else {
            onActivateWebcam();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRealWebcamActive, handleTriggerCapture, onActivateWebcam]);

  // Intelligent Optical Auto-Detection Loop
  useEffect(() => {
    if (!isRealWebcamActive || !autoDetectEnabled || isAnalyzing) {
      setDetectProgress(0);
      setDetectState('idle');
      return;
    }

    const interval = setInterval(() => {
      if (autoCaptureCooldownRef.current || isAnalyzing) return;

      const video = internalVideoRef.current || videoRef.current;
      if (!video || video.readyState < 2 || video.videoWidth === 0) return;

      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
        canvasRef.current.width = 32;
        canvasRef.current.height = 32;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Draw center crop of video
      const cropSize = Math.min(video.videoWidth, video.videoHeight) * 0.5;
      const sx = (video.videoWidth - cropSize) / 2;
      const sy = (video.videoHeight - cropSize) / 2;
      ctx.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, 32, 32);

      const frameData = ctx.getImageData(0, 0, 32, 32);
      const currentPixels = frameData.data;

      if (lastPixelsRef.current) {
        let diffSum = 0;
        for (let i = 0; i < currentPixels.length; i += 4) {
          const rDiff = Math.abs(currentPixels[i] - lastPixelsRef.current[i]);
          const gDiff = Math.abs(currentPixels[i + 1] - lastPixelsRef.current[i + 1]);
          const bDiff = Math.abs(currentPixels[i + 2] - lastPixelsRef.current[i + 2]);
          diffSum += (rDiff + gDiff + bDiff);
        }
        const avgDiff = diffSum / (32 * 32 * 3);

        // If an object is presented and held reasonably stable (difference between 4 and 35)
        // or steady object in focus
        if (avgDiff > 3.5 && avgDiff < 40) {
          steadyFramesRef.current += 1;
          const progress = Math.min(100, Math.round((steadyFramesRef.current / 3) * 100));
          setDetectProgress(progress);
          setDetectState('locked');

          if (steadyFramesRef.current >= 3) {
            // Auto capture locked!
            setDetectState('capturing');
            autoCaptureCooldownRef.current = true;
            handleTriggerCapture();
            setTimeout(() => {
              steadyFramesRef.current = 0;
              setDetectProgress(0);
              setDetectState('idle');
              autoCaptureCooldownRef.current = false;
            }, 4000);
          }
        } else {
          // Motion reset
          if (steadyFramesRef.current > 0) {
            steadyFramesRef.current = Math.max(0, steadyFramesRef.current - 1);
            setDetectProgress(Math.round((steadyFramesRef.current / 3) * 100));
          } else {
            setDetectState('idle');
            setDetectProgress(0);
          }
        }
      }

      lastPixelsRef.current = new Uint8ClampedArray(currentPixels);
    }, 350);

    return () => clearInterval(interval);
  }, [isRealWebcamActive, autoDetectEnabled, isAnalyzing, handleTriggerCapture, videoRef]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadImage(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadImage(e.dataTransfer.files[0]);
    }
  };

  const showFlash = shutterFlash || localFlash;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative w-full h-full flex flex-col justify-between overflow-y-auto bg-slate-950 text-slate-100 selection:bg-indigo-600"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial-gradient from-slate-900/60 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="scanline-overlay pointer-events-none" />

      {/* Optical Shutter Flash Effect */}
      {showFlash && (
        <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-xs transition-opacity duration-200 pointer-events-none" />
      )}

      {/* Drag and Drop Active Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-indigo-950/95 border-4 border-dashed border-indigo-400 flex flex-col items-center justify-center gap-3 backdrop-blur-md">
          <Upload className="w-16 h-16 text-indigo-400 animate-bounce" />
          <p className="text-xl font-bold text-white">Suelte la foto del residuo aquí</p>
          <p className="text-sm text-indigo-200">El sistema clasificará el residuo con IA en tiempo real</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Status & Controls Header */}
      <div className="relative z-20 px-4 py-3 sm:px-6 flex items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        {/* Left: Optical Sensor Mode */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isRealWebcamActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-bold uppercase tracking-wider text-slate-200">
              {isRealWebcamActive ? 'CÁMARA_ACTIVA' : 'SISTEMA_STANDBY'}
            </span>
          </div>

          {isRealWebcamActive && (
            <button
              onClick={() => setAutoDetectEnabled(!autoDetectEnabled)}
              title="Activar/Desactivar detección automática por presencia"
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors border cursor-pointer ${
                autoDetectEnabled
                  ? 'bg-indigo-950/80 border-indigo-700 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${autoDetectEnabled ? 'text-indigo-400 fill-indigo-400' : ''}`} />
              <span>AUTO_CAPTURA: {autoDetectEnabled ? 'ON' : 'OFF'}</span>
            </button>
          )}
        </div>

        {/* Right: Camera Switcher & Clock */}
        <div className="flex items-center gap-2.5">
          {isRealWebcamActive && onToggleFacingMode && (
            <button
              onClick={onToggleFacingMode}
              title="Cambiar entre cámara frontal y trasera"
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">CAM: {facingMode === 'environment' ? 'TRASERA' : 'FRONTAL'}</span>
            </button>
          )}

          <div className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="font-semibold text-white">{timeStr || '12:00:00 PM'}</span>
          </div>
        </div>
      </div>

      {/* Center Viewport: Scanner & Camera Feed */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-3 sm:p-6 my-auto max-w-4xl mx-auto w-full">
        {/* Unrecognized / Retry Notification Banner */}
        {unrecognizedMessage && (
          <div className="w-full max-w-xl mb-3 px-4 py-3 rounded-xl bg-amber-950/90 border-2 border-amber-500/60 text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-amber-300">Objeto no identificado con certeza</p>
              <p className="text-xs text-amber-200/90 mt-0.5">{unrecognizedMessage}</p>
            </div>
          </div>
        )}

        {/* Camera Permission / Error Warning */}
        {cameraErrorMessage && (
          <div className="w-full max-w-xl mb-3 px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-600/50 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{cameraErrorMessage}</span>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs whitespace-nowrap cursor-pointer"
            >
              Subir Foto
            </button>
          </div>
        )}

        {/* The Main High-Tech Scanner Frame */}
        <div className="relative w-full max-w-xl aspect-[4/3] max-h-[50vh] sm:max-h-[55vh] rounded-2xl overflow-hidden border-2 border-indigo-500/50 bg-slate-950 shadow-2xl flex items-center justify-center group">
          {/* Corner Guides */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-indigo-400 z-20 pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-indigo-400 z-20 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-indigo-400 z-20 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-indigo-400 z-20 pointer-events-none" />

          {/* Real Camera Video Feed */}
          {isRealWebcamActive ? (
            <video
              ref={(el) => {
                if (videoRef) {
                  (videoRef as React.MutableRefObject<HTMLVideoElement | null>).current = el;
                }
                internalVideoRef.current = el;
                if (el && webcamStream && el.srcObject !== webcamStream) {
                  el.srcObject = webcamStream;
                  el.play().catch(() => {});
                }
              }}
              autoPlay
              playsInline
              muted
              onClick={handleTriggerCapture}
              title="Haga clic para capturar instantáneamente"
              className="w-full h-full object-cover filter contrast-110 brightness-100 cursor-pointer"
            />
          ) : (
            /* Standby Placeholder with Activate Call to Action */
            <div
              onClick={onActivateWebcam}
              className="w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer bg-gradient-to-b from-slate-900 to-slate-950 hover:from-slate-850 transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">
                Cámara Web en Espera
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mb-4">
                Haga clic para encender el visor óptico o acerque un residuo para clasificarlo según la normativa colombiana.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onActivateWebcam();
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Iniciar Cámara del Kiosk
              </button>
            </div>
          )}

          {/* Center Targeting Reticle (Targeting Box) */}
          {isRealWebcamActive && !isAnalyzing && (
            <div
              onClick={handleTriggerCapture}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div
                className={`relative w-48 sm:w-56 h-48 sm:h-56 rounded-xl border-2 transition-all duration-300 flex items-center justify-center ${
                  detectState === 'capturing'
                    ? 'border-emerald-400 bg-emerald-500/20 scale-105 shadow-[0_0_20px_#34d399]'
                    : detectState === 'locked'
                    ? 'border-amber-400 bg-amber-500/10 scale-100 shadow-[0_0_15px_#fbbf24]'
                    : 'border-indigo-400/80 bg-indigo-500/5'
                }`}
              >
                {/* Crosshair lines */}
                <div className="absolute w-4 h-0.5 bg-indigo-400/80 -top-1" />
                <div className="absolute w-4 h-0.5 bg-indigo-400/80 -bottom-1" />
                <div className="absolute h-4 w-0.5 bg-indigo-400/80 -left-1" />
                <div className="absolute h-4 w-0.5 bg-indigo-400/80 -right-1" />

                {/* Laser Scan line */}
                <div className="absolute left-0 w-full h-[2px] bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-scan-line pointer-events-none" />

                {/* Detection feedback badge */}
                <div className="absolute -bottom-8 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] font-mono font-bold tracking-wider uppercase text-slate-300 whitespace-nowrap shadow-md">
                  {detectState === 'capturing' ? (
                    <span className="text-emerald-400 animate-pulse">¡CAPTURANDO RESIDUO!</span>
                  ) : detectState === 'locked' ? (
                    <span className="text-amber-300">OBJETO EN MIRA: FIJANDO ({detectProgress}%)</span>
                  ) : (
                    <span>CENTRE EL RESIDUO AQUÍ</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analyzing AI Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border-2 border-indigo-500 flex items-center justify-center animate-pulse">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-white">Analizando residuo con IA...</h3>
              <p className="text-xs text-indigo-200 max-w-sm font-mono">
                Identificando material, polímero y caneca bajo Res. 2184/2019 y Ley 2232
              </p>
            </div>
          )}

          {/* Quick HUD Readout overlay at bottom of video */}
          {isRealWebcamActive && (
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-400 bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded-md border border-slate-800/80 pointer-events-none">
              <div className="flex items-center gap-1.5">
                <span className="text-indigo-400 font-bold">IA_SENSOR:</span>
                <span>GEMINI 2.5 FLASH</span>
              </div>
              <div className="text-slate-400 hidden sm:block">
                ESPACIO / CLICK: CAPTURAR
              </div>
            </div>
          )}
        </div>

        {/* Primary Capture Action Hub */}
        <div className="w-full max-w-xl mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5">
          {isRealWebcamActive ? (
            <button
              onClick={handleTriggerCapture}
              disabled={isAnalyzing}
              className="flex-1 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Camera className="w-5 h-5 text-white" />
              <span>CAPTURAR OBJETO AHORA</span>
              <span className="text-xs font-mono opacity-75 font-normal hidden sm:inline">(Espacio)</span>
            </button>
          ) : (
            <button
              onClick={onActivateWebcam}
              className="flex-1 py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Camera className="w-5 h-5 text-white" />
              <span>ACTIVAR CÁMARA</span>
            </button>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="py-3.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-slate-200 border border-slate-700 font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Subir Foto</span>
          </button>
        </div>

        {/* Quick Pre-calibrated Waste Samples Selection */}
        <div className="w-full max-w-xl mt-4 pt-3.5 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              O pruebe con residuos pre-calibrados:
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline font-mono">1-CLIC TEST</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {WASTE_SAMPLES.map((sample) => {
              const isProhibited = sample.isLey2232Prohibited;
              return (
                <button
                  key={sample.id}
                  onClick={() => onQuickSimulate(sample.id)}
                  disabled={isAnalyzing}
                  className={`px-3 py-2 rounded-lg text-left font-medium transition-all flex items-center gap-2 border cursor-pointer ${
                    isProhibited
                      ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border-rose-800/80'
                      : sample.caneca === 'Blanca'
                      ? 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-600'
                      : sample.caneca === 'Verde'
                      ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 border-emerald-800/80'
                      : sample.caneca === 'Roja_RESPEL'
                      ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-200 border-rose-800/80'
                      : sample.caneca === 'RAEE_Posconsumo'
                      ? 'bg-sky-950/40 hover:bg-sky-900/60 text-sky-200 border-sky-800/80'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        sample.caneca === 'Blanca'
                          ? '#ffffff'
                          : sample.caneca === 'Verde'
                          ? '#10b981'
                          : sample.caneca === 'Negra'
                          ? '#64748b'
                          : sample.caneca === 'Roja_RESPEL' || isProhibited
                          ? '#f43f5e'
                          : '#0ea5e9'
                    }}
                  />
                  <span className="truncate">{sample.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Technical Status Bar */}
      <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between gap-2 text-xs font-mono text-slate-400 border-t border-slate-850 bg-slate-950/80">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase text-slate-500 font-bold">FILTRO_ANTI-REBOTE:</span>
          <span className="text-emerald-400 font-bold">ACTIVO (1.2s)</span>
        </div>

        <div className="text-[11px] text-slate-500 hidden sm:block">
          REGLAMENTO: RES. 2184/2019 · LEY 2232/2022 · RES. 803/2024
        </div>
      </div>
    </div>
  );
};
