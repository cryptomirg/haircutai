import { useState, useCallback } from 'react';
import type { AnalysisResult, GenerationResult, AppStep } from './types';
import UploadStep from './components/UploadStep';
import AnalyzingStep from './components/AnalyzingStep';
import ResultsStep from './components/ResultsStep';
import GeneratingStep from './components/GeneratingStep';
import PreviewStep from './components/PreviewStep';

export default function App() {
  const [step, setStep] = useState<AppStep>('upload');
  const [selfie, setSelfie] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [generation, setGeneration] = useState<GenerationResult | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = useCallback(
    async (base64: string, mime: string) => {
      setSelfie(base64);
      setMimeType(mime);
      setStep('analyzing');
      setError(null);

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: mime }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Analysis failed');
        }

        const data: AnalysisResult = await res.json();
        setAnalysis(data);
        setStep('results');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setStep('upload');
      }
    },
    []
  );

  const handleStyleSelected = useCallback(
    async (style: string) => {
      if (!selfie) return;
      setSelectedStyle(style);
      setStep('generating');
      setError(null);

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: selfie,
            mimeType,
            haircutStyle: style,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Generation failed');
        }

        const data: GenerationResult = await res.json();
        setGeneration(data);
        setStep('preview');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Generation failed');
        setStep('results');
      }
    },
    [selfie, mimeType]
  );

  const handleReset = useCallback(() => {
    setStep('upload');
    setSelfie(null);
    setAnalysis(null);
    setGeneration(null);
    setSelectedStyle('');
    setError(null);
  }, []);

  const handleBackToResults = useCallback(() => {
    setGeneration(null);
    setSelectedStyle('');
    setStep('results');
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-white/5 bg-surface-2/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <h1 className="text-lg font-semibold text-white group-hover:text-primary-light transition-colors">
              StyleLens
            </h1>
          </button>
          {step !== 'upload' && (
            <button
              onClick={handleReset}
              className="text-sm text-white/40 hover:text-white transition-colors"
            >
              Start over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-fade-in">
            {error}
          </div>
        )}

        {step === 'upload' && <UploadStep onImageSelected={handleImageSelected} />}
        {step === 'analyzing' && <AnalyzingStep selfie={selfie} />}
        {step === 'results' && analysis && (
          <ResultsStep
            selfie={selfie}
            analysis={analysis}
            onStyleSelected={handleStyleSelected}
          />
        )}
        {step === 'generating' && (
          <GeneratingStep selfie={selfie} style={selectedStyle} />
        )}
        {step === 'preview' && generation && (
          <PreviewStep
            generation={generation}
            style={selectedStyle}
            onBack={handleBackToResults}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
