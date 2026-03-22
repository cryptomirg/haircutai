interface Props {
  selfie: string | null;
  style: string;
}

export default function GeneratingStep({ selfie, style }: Props) {
  return (
    <div className="animate-fade-in text-center max-w-lg mx-auto">
      {selfie && (
        <div className="relative mb-8 inline-block">
          <div className="w-40 h-40 rounded-2xl overflow-hidden border-2 border-primary/30 animate-pulse-glow">
            <img
              src={`data:image/jpeg;base64,${selfie}`}
              alt="Your selfie"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-white mb-2">
        Generating Your Look
      </h2>
      <p className="text-white/50 mb-8">
        Creating a <span className="text-primary-light font-medium">{style}</span> preview with Nano Banana 2...
      </p>

      <div className="grid grid-cols-2 gap-3">
        {['Front View', 'Left Side', 'Right Side', 'Back View'].map((angle, i) => (
          <div
            key={angle}
            className="aspect-square rounded-xl bg-surface-2 border border-white/5 shimmer flex items-center justify-center animate-fade-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <span className="text-xs text-white/20">{angle}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-white/30 mt-6">
        This may take 15-30 seconds...
      </p>
    </div>
  );
}
