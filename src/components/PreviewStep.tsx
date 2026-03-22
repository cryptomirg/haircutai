import { useState } from 'react';
import type { GenerationResult } from '../types';

interface Props {
  generation: GenerationResult;
  style: string;
  onBack: () => void;
  onReset: () => void;
}

export default function PreviewStep({ generation, style, onBack, onReset }: Props) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const singleImage = generation.images.length === 1;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent">{style}</span> Look
        </h2>
        {generation.text && (
          <p className="text-white/50 text-sm max-w-xl mx-auto">
            {generation.text}
          </p>
        )}
      </div>

      {/* Images */}
      <div className={`max-w-3xl mx-auto mb-8 ${singleImage ? 'flex justify-center' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}`}>
        {generation.images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelectedImage(selectedImage === i ? null : i)}
            className={`rounded-2xl overflow-hidden border-2 transition-all animate-fade-in
              ${singleImage ? 'max-w-2xl w-full' : ''}
              ${
                selectedImage === i
                  ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'border-white/5 hover:border-white/15'
              }`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <img
              src={img}
              alt={`${style} - angle ${i + 1}`}
              className="w-full h-auto object-contain"
            />
          </button>
        ))}
      </div>

      {/* Enlarged view */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl w-full max-h-[90vh] animate-fade-in">
            <img
              src={generation.images[selectedImage]}
              alt={`${style} - enlarged`}
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-surface-2 border border-white/10 text-white/70 hover:text-white
            hover:border-white/20 transition-all"
        >
          Try another style
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold
            hover:shadow-lg hover:shadow-primary/25 transition-all"
        >
          New photo
        </button>
      </div>
    </div>
  );
}
