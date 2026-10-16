import React, { useState, useEffect, useRef } from 'react';
import { KioskState, NormativeCaneca, WasteItemSample } from './types.ts';
import { WASTE_SAMPLES, NORMATIVAS_INFO } from './data/normativas.ts';
import { TopAppBar } from './components/TopAppBar.tsx';
import { FooterNormativeBar } from './components/FooterNormativeBar.tsx';
import { StandbyView } from './components/StandbyView.tsx';
import { ClassifyingView } from './components/ClassifyingView.tsx';
import { ConfirmedView } from './components/ConfirmedView.tsx';
import { ProhibitedAlertView } from './components/ProhibitedAlertView.tsx';
import { CameraErrorView } from './components/CameraErrorView.tsx';
import { LowConfidenceToast } from './components/LowConfidenceToast.tsx';
import { NormativasModal } from './components/NormativasModal.tsx';
import { AuditModal } from './components/AuditModal.tsx';
import { SimulatorBar } from './components/SimulatorBar.tsx';

// Synthetic sound effects using Web Audio API
const playFeedbackSound = (type: 'beep' | 'success' | 'alert' | 'click' | 'shutter') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'shutter') {
      // Crisp mechanical camera shutter sound
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
      return;
    }
  } catch {
    // AudioContext may be restricted before user interaction
  }
};

export default function App() {
  const [currentState, setCurrentState] = useState<KioskState>('standby');
  const [currentItem, setCurrentItem] = useState<WasteItemSample | null>(null);
  const [persistenceProgress, setPersistenceProgress] = useState(0);

  // Modals and drawers
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isNormativasOpen, setIsNormativasOpen] = useState(false);
  const [selectedNormativaFilter, setSelectedNormativaFilter] = useState<NormativeCaneca | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [recordAddedSignal, setRecordAddedSignal] = useState(0);

  // AI Classification loading and error states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cameraErrorMessage, setCameraErrorMessage] = useState<string | null>(null);

  // Low confidence toast
  const [lowConfidenceInfo, setLowConfidenceInfo] = useState<{ visible: boolean; confidence: number }>({
    visible: false,
    confidence: 0
  });

  // Real webcam state
  const [isRealWebcamActive, setIsRealWebcamActive] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [shutterFlash, setShutterFlash] = useState(false);
  const [unrecognizedMessage, setUnrecognizedMessage] = useState<string | null>(null);
  const [isRetryingCamera, setIsRetryingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);

  // Persistence progress timer ref
  const persistenceIntervalRef = useRef<any>(null);

  // Stop real webcam helper
  const stopWebcam = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
    }
    setWebcamStream(null);
    setIsRealWebcamActive(false);
  };

  // Start real webcam with fallback
  const startWebcam = async (modeToUse?: 'environment' | 'user') => {
    const targetMode = modeToUse || facingMode;
    try {
      setCameraErrorMessage(null);
      setUnrecognizedMessage(null);

      // Clean up previous tracks
      if (webcamStreamRef.current) {
        webcamStreamRef.current.getTracks().forEach((t) => t.stop());
        webcamStreamRef.current = null;
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: targetMode },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
            audio: false
          });
        } catch (constraintErr) {
          console.warn('FacingMode constraint fallback:', constraintErr);
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }

        webcamStreamRef.current = stream;
        setWebcamStream(stream);
        setIsRealWebcamActive(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } else {
        setCameraErrorMessage('El navegador no soporta captura de cámara en este marco. Puede subir una foto del residuo.');
      }
    } catch (err: any) {
      console.warn('Webcam permission not granted or unavailable:', err);
      setIsRealWebcamActive(false);
      setWebcamStream(null);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraErrorMessage('Acceso a cámara denegado. Permita el uso de cámara o use "Subir Foto" o las muestras.');
      } else {
        setCameraErrorMessage('Cámara web no accesible en este visor. Puede usar el botón "Subir Foto" o seleccionar una muestra.');
      }
    }
  };

  // Toggle front / back camera
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startWebcam(nextMode);
  };

  const handleToggleWebcam = () => {
    if (isRealWebcamActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  // Attempt auto-starting camera on mount
  useEffect(() => {
    startWebcam();
    return () => {
      stopWebcam();
    };
  }, []);

  // Persist record to backend SQLite and CSV logger
  const saveRecordToDb = async (item: WasteItemSample) => {
    try {
      const payload = {
        caneca_destino: item.caneca,
        categoria_residuo: item.name,
        subtipo_resina: item.resinType,
        porcentaje_confianza: item.confidence,
        alerta_ley_2232_activa: item.isLey2232Prohibited,
        sensor_ref: 'OPT_SENS_01',
        kiosk_id: 'Kiosk #4022',
        notas: item.disposalAdvice
      };

      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setRecordAddedSignal((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error auto-saving record to SQLite:', err);
    }
  };

  // Shared execution pipeline for any classified item (sample or real visual capture)
  const executeClassification = (sample: WasteItemSample) => {
    // Reset any ongoing timer
    if (persistenceIntervalRef.current) {
      clearInterval(persistenceIntervalRef.current);
    }

    // Low confidence scenario (<85%)
    if (sample.confidence < 85) {
      playFeedbackSound('alert');
      setLowConfidenceInfo({ visible: true, confidence: sample.confidence });
      setCurrentItem(sample);
      setCurrentState('standby');
      return;
    }

    setLowConfidenceInfo({ visible: false, confidence: 0 });
    setCurrentItem(sample);

    // If prohibited by Ley 2232
    if (sample.isLey2232Prohibited) {
      playFeedbackSound('alert');
      setCurrentState('prohibited_alert');
      saveRecordToDb(sample); // Log prohibited event for compliance
      return;
    }

    // Normal waste classification flow with persistence filter
    playFeedbackSound('beep');
    setCurrentState('classifying');
    setPersistenceProgress(0);

    // Anti-rebote persistence progress simulation (~1.2s steady optical confirmation)
    let progress = 0;
    const interval = setInterval(() => {
      progress += 9;
      if (progress >= 100) {
        clearInterval(interval);
        setPersistenceProgress(100);
        playFeedbackSound('success');
        setCurrentState('confirmed');
        saveRecordToDb(sample);
      } else {
        setPersistenceProgress(progress);
      }
    }, 100);

    persistenceIntervalRef.current = interval;
  };

  // Trigger preset item scanning
  const handleSelectSample = (sampleId: string) => {
    const sample = WASTE_SAMPLES.find((s) => s.id === sampleId);
    if (!sample) return;
    executeClassification(sample);
  };

  // Capture frame from webcam and classify with AI
  const handleCaptureFrame = async () => {
    setCameraErrorMessage(null);
    setUnrecognizedMessage(null);

    const video = videoRef.current;
    if (!video) {
      setCameraErrorMessage('Cámara no activa. Active la cámara o suba una foto del residuo.');
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraErrorMessage('Iniciando sensor de cámara... por favor intente en un instante.');
      return;
    }

    // Play shutter sound & trigger optical flash
    playFeedbackSound('shutter');
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 220);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.88);

      await processWasteImage(base64Image, 'image/jpeg');
    } catch (err: any) {
      console.error('Error capturing camera frame:', err);
    }
  };

  // Upload an image file and classify with AI
  const handleUploadImage = (file: File) => {
    setCameraErrorMessage(null);
    setUnrecognizedMessage(null);
    playFeedbackSound('shutter');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        await processWasteImage(base64, file.type || 'image/jpeg');
      }
    };
    reader.readAsDataURL(file);
  };

  // Send image to backend Gemini Vision classification API
  const processWasteImage = async (base64Data: string, mimeType = 'image/jpeg') => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data, mimeType })
      });

      if (!res.ok) {
        throw new Error(`Servidor devolvió error ${res.status}`);
      }

      const data = await res.json();

      // If nothing recognizable was placed in front of the lens
      const nameLower = (data.name || '').toLowerCase();
      if (
        nameLower.includes('no identificable') ||
        nameLower.includes('sin residuo') ||
        data.category === 'Desconocido'
      ) {
        playFeedbackSound('alert');
        setUnrecognizedMessage(
          data.disposalAdvice ||
          'No se distinguió un objeto claro en el visor. Acerque el residuo al centro con buena iluminación y vuelva a capturar.'
        );
        return;
      }

      const analyzedItem: WasteItemSample = {
        id: 'real_scan_' + Date.now(),
        name: data.name || 'Residuo detectado',
        category: data.category || 'Clasificación Visual',
        caneca: data.caneca,
        resinType: data.resinType || 'N/A',
        confidence: Number(data.confidence) || 94,
        isLey2232Prohibited: Boolean(data.isLey2232Prohibited || data.caneca === 'Prohibido_Ley2232'),
        normReference: data.normReference || (data.caneca === 'Prohibido_Ley2232' ? 'Ley 2232/2022' : 'Res. 2184/2019'),
        disposalAdvice: data.disposalAdvice || 'Depositar en la caneca correspondiente según código de colores.',
        sensorOverlay: {
          optSensor: 'OPT_RGB_SPECTRAL: ACTIVE',
          specAnalysis: 'NORM: ' + (data.normReference || 'Res. 2184/2019'),
          irReflectance: 'CONF: ' + (data.confidence?.toFixed(1) || '94.0') + '%'
        },
        sampleImage: base64Data,
        boundingBox: { x: 100, y: 100, width: 300, height: 300 }
      };

      executeClassification(analyzedItem);
    } catch (err: any) {
      console.error('Error in AI waste classification:', err);
      // Fallback to sample if offline
      handleSelectSample('pet_bottle');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear area (return to standby)
  const handleClearArea = () => {
    if (persistenceIntervalRef.current) {
      clearInterval(persistenceIntervalRef.current);
    }
    setPersistenceProgress(0);
    setCurrentItem(null);
    setCurrentState('standby');
    setLowConfidenceInfo({ visible: false, confidence: 0 });
  };

  // Trigger Camera Error
  const handleTriggerCameraError = () => {
    if (persistenceIntervalRef.current) {
      clearInterval(persistenceIntervalRef.current);
    }
    stopWebcam();
    playFeedbackSound('alert');
    setCurrentState('camera_error');
  };

  // Restore camera
  const handleRestoreCamera = () => {
    setIsRetryingCamera(true);
    setTimeout(() => {
      setIsRetryingCamera(false);
      playFeedbackSound('beep');
      setCurrentState('standby');
    }, 1200);
  };

  // Handle click on normative category in footer
  const handleSelectNormativa = (norm: NormativeCaneca) => {
    setSelectedNormativaFilter(norm);
    setIsNormativasOpen(true);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (persistenceIntervalRef.current) {
        clearInterval(persistenceIntervalRef.current);
      }
      stopWebcam();
    };
  }, []);

  const activeNormativa = currentItem ? NORMATIVAS_INFO[currentItem.caneca] : NORMATIVAS_INFO.Blanca;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans flex flex-col select-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px]">
      {/* Top Application Bar */}
      <TopAppBar
        onOpenAudit={() => setIsAuditOpen(true)}
        onOpenNormativas={() => {
          setSelectedNormativaFilter(null);
          setIsNormativasOpen(true);
        }}
        onToggleSimulator={() => setIsSimulatorOpen(!isSimulatorOpen)}
        isSimulatorOpen={isSimulatorOpen}
        kioskId="Kiosk #4022"
        isOffline={true}
      />

      {/* Main Kiosk Viewport Area (padding for Top Bar and Footer Bar) */}
      <main className="flex-1 w-full pt-20 pb-14 relative overflow-hidden flex items-center justify-center">
        {/* STANDBY VIEW */}
        {currentState === 'standby' && (
          <StandbyView
            onQuickSimulate={handleSelectSample}
            videoRef={videoRef}
            webcamStream={webcamStream}
            isRealWebcamActive={isRealWebcamActive}
            onActivateWebcam={() => startWebcam()}
            onCaptureFrame={handleCaptureFrame}
            onUploadImage={handleUploadImage}
            isAnalyzing={isAnalyzing}
            cameraErrorMessage={cameraErrorMessage}
            unrecognizedMessage={unrecognizedMessage}
            shutterFlash={shutterFlash}
            facingMode={facingMode}
            onToggleFacingMode={handleToggleFacingMode}
          />
        )}

        {/* CLASSIFYING VIEW (Mockup 4) */}
        {currentState === 'classifying' && currentItem && (
          <ClassifyingView
            item={currentItem}
            normativa={activeNormativa}
            persistenceProgress={persistenceProgress}
            onCancelScan={handleClearArea}
            videoRef={videoRef}
            isRealWebcamActive={isRealWebcamActive}
          />
        )}

        {/* CONFIRMED VIEW (Mockup 2) */}
        {currentState === 'confirmed' && currentItem && (
          <ConfirmedView
            item={currentItem}
            normativa={activeNormativa}
            onAreaCleared={handleClearArea}
            videoRef={videoRef}
            isRealWebcamActive={isRealWebcamActive}
          />
        )}

        {/* PROHIBITED LEY 2232 ALERT VIEW (Mockup 3) */}
        {currentState === 'prohibited_alert' && currentItem && (
          <ProhibitedAlertView
            item={currentItem}
            onDismissAlert={handleClearArea}
            videoRef={videoRef}
            isRealWebcamActive={isRealWebcamActive}
          />
        )}

        {/* CAMERA ERROR VIEW (Mockup 5) */}
        {currentState === 'camera_error' && (
          <CameraErrorView
            onRetryConnection={handleRestoreCamera}
            isRetrying={isRetryingCamera}
          />
        )}

        {/* LOW CONFIDENCE TOAST NOTIFICATION (PRD 4.2) */}
        {lowConfidenceInfo.visible && (
          <LowConfidenceToast
            confidence={lowConfidenceInfo.confidence}
            onDismiss={() => setLowConfidenceInfo({ visible: false, confidence: 0 })}
            onRetry={() => {
              setLowConfidenceInfo({ visible: false, confidence: 0 });
              handleSelectSample('pet_bottle');
            }}
          />
        )}
      </main>

      {/* Simulator HUD Controls Toolbar */}
      <SimulatorBar
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        currentState={currentState}
        onSelectSample={handleSelectSample}
        onClearArea={handleClearArea}
        onTriggerCameraError={handleTriggerCameraError}
        onRestoreCamera={handleRestoreCamera}
        isRealWebcamActive={isRealWebcamActive}
        onToggleWebcam={handleToggleWebcam}
      />

      {/* Footer Normative Bar */}
      <FooterNormativeBar onSelectNormativa={handleSelectNormativa} />

      {/* Normativas Modal Guide */}
      <NormativasModal
        isOpen={isNormativasOpen}
        onClose={() => setIsNormativasOpen(false)}
        selectedCategory={selectedNormativaFilter}
      />

      {/* SQLite and CSV Audit Records Modal */}
      <AuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        onRecordAddedSignal={recordAddedSignal}
      />
    </div>
  );
}
