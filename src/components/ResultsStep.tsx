import { useState, useCallback } from 'react';
import type { AnalysisResult } from '../types';

interface Props {
  selfie: string | null;
  analysis: AnalysisResult;
  onStyleSelected: (style: string) => void;
}

const SHAPE_ICONS: Record<string, string> = {
  oval: '🥚',
  round: '🔵',
  square: '🟪',
  heart: '💜',
  oblong: '📐',
  diamond: '💎',
  rectangle: '▬',
  triangle: '🔺',
};

function PreviewImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(() => setFailed(true), []);

  if (failed || !src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface-3">
        <div className="text-center">
          <svg className="w-6 h-6 text-white/15 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <span className="text-[10px] text-white/20">Preview unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={handleError}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
  );
}

export default function ResultsStep({ selfie, analysis, onStyleSelected }: Props) {
  const [customStyle, setCustomStyle] = useState('');

  const icon = SHAPE_ICONS[analysis.faceShape.toLowerCase()] || '✨';

  return (
    <div className="animate-fade-in">
      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        {/* Left: Face analysis card */}
        <div className="space-y-4">
          {selfie && (
            <div className="rounded-2xl overflow-hidden border border-white/5">
              <img
                src={`data:image/jpeg;base64,${selfie}`}
                alt="Your selfie"
                className="w-full aspect-square object-cover"
              />
            </div>
          )}

          <div className="p-5 rounded-2xl bg-surface-2 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{icon}</span>
              <div>
                <h3 className="text-lg font-semibold text-white capitalize">
                  {analysis.faceShape} Face
                </h3>
                <span className="text-xs text-primary-light bg-primary/10 px-2 py-0.5 rounded-full capitalize">
                  {analysis.confidence} confidence
                </span>
              </div>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              {analysis.description}
            </p>
          </div>
        </div>

        {/* Right: Recommendations */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Recommended Haircuts
          </h2>
          <p className="text-white/40 text-sm mb-6">
            Click any style to see how it looks on you
          </p>

          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {analysis.recommendations.map((rec, i) => (
              <button
                key={rec.name}
                onClick={() => onStyleSelected(rec.name)}
                className="text-left rounded-xl bg-surface-2 border border-white/5 hover:border-primary/40
                  hover:bg-surface-3 transition-all group animate-fade-in overflow-hidden"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {/* Preview thumbnail */}
                <div className="relative w-full aspect-[16/9] bg-surface-3 overflow-hidden">
                  <PreviewImage
                    src={rec.imageUrl || ''}
                    alt={`${rec.name} preview`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-2/90 via-transparent to-transparent" />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-white/60 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      Try on me &rarr;
                    </span>
                  </div>
                </div>

                {/* Text content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1.5">
                    <h4 className="font-semibold text-white group-hover:text-primary-light transition-colors">
                      {rec.name}
                    </h4>
                    <svg
                      className="w-4 h-4 text-white/20 group-hover:text-primary-light transition-all group-hover:translate-x-0.5 shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Custom style input */}
          <div className="p-5 rounded-2xl bg-surface-2 border border-white/5">
            <h3 className="text-sm font-semibold text-white/70 mb-3">
              Or try a custom style
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={customStyle}
                onChange={(e) => setCustomStyle(e.target.value)}
                placeholder="e.g. Messy French Crop"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customStyle.trim()) {
                    onStyleSelected(customStyle.trim());
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-white/10 text-white
                  placeholder:text-white/25 focus:outline-none focus:border-primary/50 transition-colors text-sm"
              />
              <button
                onClick={() => {
                  if (customStyle.trim()) onStyleSelected(customStyle.trim());
                }}
                disabled={!customStyle.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-medium text-sm
                  hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Try it
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
