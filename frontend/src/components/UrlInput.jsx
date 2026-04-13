import { useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

export default function UrlInput({ onSubmit }) {
  const [url, setUrl] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    extractDesignTokens: true,
    screenshots: true,
    scrollToBottom: true,
    timeout: 30000,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit(url.trim(), options);
  };

  const toggleOption = (key) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Main input row */}
      <div className="flex flex-col sm:flex-row gap-0">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://exemplo.com"
          required
          className="flex-1 bg-deep border border-white/10 px-6 py-5 text-sm text-white placeholder:text-white/30 tracking-[0.05em] focus:outline-none focus:border-accent transition-colors duration-300"
        />
        <button
          type="submit"
          className="bg-accent text-white px-8 py-5 text-xs font-semibold uppercase tracking-widest hover:bg-dark transition-colors duration-300 flex items-center justify-center gap-3 whitespace-nowrap"
        >
          Extrair
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Options toggle */}
      <button
        type="button"
        onClick={() => setShowOptions(!showOptions)}
        className="mt-3 text-xs text-dark/40 hover:text-accent transition-colors duration-300 uppercase tracking-[0.15em] flex items-center gap-1.5"
      >
        Opções
        {showOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Options panel */}
      <div
        className={clsx(
          "overflow-hidden transition-all duration-500 ease-out",
          showOptions ? "max-h-60 opacity-100 mt-4" : "max-h-0 opacity-0"
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border border-dark/10 bg-muted">
          {[
            { key: "extractDesignTokens", label: "Design Tokens" },
            { key: "screenshots", label: "Capturas de Tela" },
            { key: "scrollToBottom", label: "Rolar Página" },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div
                className={clsx(
                  "w-4 h-4 border transition-all duration-300",
                  options[key]
                    ? "bg-accent border-accent"
                    : "border-dark/30 group-hover:border-accent"
                )}
              />
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-dark/60 group-hover:text-dark transition-colors">
                {label}
              </span>
              <input
                type="checkbox"
                checked={options[key]}
                onChange={() => toggleOption(key)}
                className="sr-only"
              />
            </label>
          ))}
        </div>
      </div>
    </form>
  );
}
