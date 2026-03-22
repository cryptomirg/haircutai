import { useRef, useState, useCallback, useEffect } from 'react';

interface Props {
  onImageSelected: (base64: string, mimeType: string) => void;
}

export default function UploadStep({ onImageSelected }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  }, [stream]);

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        onImageSelected(base64, file.type);
      };
      reader.readAsDataURL(file);
    },
    [onImageSelected]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) processFile(file);
    },
    [processFile]
  );

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 50);
    } catch {
      alert('Could not access camera. Please upload a photo instead.');
    }
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64 = dataUrl.split(',')[1];
    stopCamera();
    onImageSelected(base64, 'image/jpeg');
  }, [onImageSelected, stopCamera]);

  if (cameraActive) {
    return (
      <div className="animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Take a Selfie</h2>
          <p className="text-white/50">Position your face in the center</p>
        </div>
        <div className="max-w-lg mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[3/4]">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <div className="absolute inset-0 border-2 border-white/20 rounded-2xl pointer-events-none" />
            <div className="absolute inset-[15%] border-2 border-dashed border-white/10 rounded-full pointer-events-none" />
          </div>
          <div className="flex gap-4 mt-6 justify-center">
            <button
              onClick={stopCamera}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={capturePhoto}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold
                hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-95"
            >
              Capture
            </button>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-3">
          Find Your Perfect Haircut
        </h2>
        <p className="text-lg text-white/50 max-w-md mx-auto">
          Upload a selfie and let AI analyze your face shape to recommend the best styles
        </p>
      </div>

      <div className="max-w-lg mx-auto space-y-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all
            ${
              dragOver
                ? 'border-primary bg-primary/10'
                : 'border-white/10 hover:border-white/25 hover:bg-white/[0.02]'
            }`}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-white font-medium mb-1">
            Drop your selfie here or click to browse
          </p>
          <p className="text-sm text-white/40">JPG, PNG up to 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-sm text-white/30">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          onClick={startCamera}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-semibold
            hover:shadow-lg hover:shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          Take a Selfie
        </button>
      </div>
    </div>
  );
}
