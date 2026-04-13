export default function TokenPreview({ tokens }) {
  const { colors = [], fonts = [], fontSizes = [] } = tokens;

  return (
    <div className="space-y-12">
      {/* Colors */}
      {colors.length > 0 && (
        <div className="border border-dark/10 p-8">
          <h3 className="font-display text-lg font-semibold uppercase tracking-tight mb-6">
            Paleta de Cores
          </h3>
          <div className="flex flex-wrap gap-3">
            {colors.slice(0, 24).map((color, i) => (
              <div key={i} className="group flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 border border-dark/10 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: color.value || color }}
                />
                <span className="text-[10px] font-mono text-dark/40 group-hover:text-dark transition-colors">
                  {color.value || color}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Typography */}
      {fonts.length > 0 && (
        <div className="border border-dark/10 p-8">
          <h3 className="font-display text-lg font-semibold uppercase tracking-tight mb-6">
            Tipografia
          </h3>
          <div className="space-y-4">
            {fonts.map((font, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-dark/5 last:border-0"
              >
                <span className="text-sm text-dark/80" style={{ fontFamily: font.family }}>
                  {font.family || font}
                </span>
                <span className="text-xs text-dark/30 font-mono">
                  {font.weight || "400"} / {font.count || 1}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Font Sizes */}
      {fontSizes.length > 0 && (
        <div className="border border-dark/10 p-8">
          <h3 className="font-display text-lg font-semibold uppercase tracking-tight mb-6">
            Escala
          </h3>
          <div className="flex flex-wrap gap-4">
            {fontSizes.slice(0, 12).map((size, i) => (
              <div
                key={i}
                className="px-4 py-2 border border-dark/10 text-xs font-mono text-dark/50"
              >
                {size.value || size}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
