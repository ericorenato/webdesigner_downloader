import { motion } from "framer-motion";
import { Image, Palette, Type, FileCode, Camera, Package } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: "easeOut", delay },
  }),
};

const features = [
  {
    icon: Image,
    title: "Imagens & SVGs",
    desc: "Todas as imagens, ícones, favicons e assets Open Graph — incluindo conteúdo carregado via lazy-load.",
  },
  {
    icon: FileCode,
    title: "CSS & HTML",
    desc: "DOM renderizado com URLs reescritas. Funciona offline, sem requisições externas.",
  },
  {
    icon: Type,
    title: "Fontes",
    desc: "Todos os arquivos @font-face — WOFF2, TTF, OTF — extraídos e organizados.",
  },
  {
    icon: Palette,
    title: "Design Tokens",
    desc: "Cores, tipografia, espaçamentos, breakpoints, sombras — em JSON estruturado.",
  },
  {
    icon: Camera,
    title: "Capturas de Tela",
    desc: "Capturas full-page e viewport da página renderizada.",
  },
  {
    icon: Package,
    title: "Pacote ZIP",
    desc: "Tudo empacotado em uma estrutura limpa com metadados de manifesto.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="recursos" className="relative bg-deep text-white py-16 lg:py-20">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section header */}
        <div className="text-center mb-12">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            custom={0}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <span className="h-px w-10 bg-accent/70" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">
              Recursos
            </span>
            <span className="h-px w-10 bg-accent/70" />
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            custom={0.1}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tighter uppercase"
          >
            Tudo que você <span className="text-accent">precisa</span>
          </motion.h2>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              custom={i * 0.1}
              className="group bg-deep p-10 hover:bg-white/[0.03] transition-colors duration-500"
            >
              <feat.icon
                size={24}
                className="text-accent mb-6 group-hover:scale-110 transition-transform duration-500"
              />
              <h3 className="font-display text-lg font-semibold uppercase tracking-tight mb-3">
                {feat.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
