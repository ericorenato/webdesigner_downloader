import { motion } from "framer-motion";
import { Download, RotateCcw } from "lucide-react";
import TokenPreview from "./TokenPreview";

const fadeInUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: "easeOut", delay },
  }),
};

export default function ResultsPanel({ result, onReset }) {
  const { zipUrl, manifest = {}, tokens = {} } = result;

  const stats = [
    { label: "Assets", value: manifest.totalAssets || 0 },
    { label: "Tamanho", value: manifest.totalSize || "—" },
    { label: "Cores", value: tokens.colors?.length || 0 },
    { label: "Fontes", value: tokens.fonts?.length || 0 },
  ];

  return (
    <section className="py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="h-px w-10 bg-accent/40" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-dark/40">
              Concluído
            </span>
            <span className="h-px w-10 bg-accent/40" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tighter uppercase">
            Download <span className="text-accent">Pronto</span>
          </h2>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.2}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-dark/10 mb-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface p-8 text-center">
              <p className="font-display text-4xl md:text-5xl font-semibold tracking-tighter text-dark">
                {stat.value}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-dark/40 mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          custom={0.4}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href={zipUrl}
            download
            className="bg-dark text-white px-10 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors duration-300 flex items-center gap-3"
          >
            <Download size={16} />
            Baixar ZIP
          </a>
          <button
            onClick={onReset}
            className="border border-dark/20 text-dark px-10 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-accent hover:border-accent hover:text-white transition-all duration-300 flex items-center gap-3"
          >
            <RotateCcw size={16} />
            Nova Extração
          </button>
        </motion.div>

        {/* Manifest info */}
        {manifest.url && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.5}
            className="mt-16 border border-dark/10 p-8"
          >
            <h3 className="font-display text-lg font-semibold uppercase tracking-tight mb-4">
              Manifesto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-dark/40 text-xs uppercase tracking-[0.1em]">
                  URL de Origem
                </span>
                <p className="text-dark/80 mt-1 font-mono text-xs break-all">
                  {manifest.url}
                </p>
              </div>
              <div>
                <span className="text-dark/40 text-xs uppercase tracking-[0.1em]">
                  Extraído em
                </span>
                <p className="text-dark/80 mt-1 font-mono text-xs">
                  {manifest.date || new Date().toISOString()}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Token preview */}
        {tokens.colors?.length > 0 && (
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.6}
            className="mt-12"
          >
            <TokenPreview tokens={tokens} />
          </motion.div>
        )}
      </div>
    </section>
  );
}
