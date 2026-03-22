interface Props {
  selfie: string | null;
}

export default function AnalyzingStep({ selfie }: Props) {
  return (
    <div className="animate-fade-in text-center">
      <div className="max-w-sm mx-auto">
        {selfie && (
          <div className="relative mb-8">
            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-primary/30 animate-pulse-glow">
              <img
                src={`data:image/jpeg;base64,${selfie}`}
                alt="Your selfie"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 rounded-full border-2 border-primary/20 animate-spin" style={{ animationDuration: '3s' }}>
                <div className="w-3 h-3 bg-primary rounded-full -mt-1.5 ml-[calc(50%-6px)]" />
              </div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Face</h2>
        <p className="text-white/50 mb-6">
          AI is analyzing your face and searching the web for the best styles...
        </p>

        <div className="space-y-3">
          {['Detecting face shape', 'Analyzing proportions', 'Finding recommendations', 'Searching for reference images'].map(
            (label, i) => (
              <div
                key={label}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 animate-fade-in"
                style={{ animationDelay: `${i * 0.4}s` }}
              >
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm text-white/60">{label}</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
