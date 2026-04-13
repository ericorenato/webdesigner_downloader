import { motion } from "framer-motion";
import UrlInput from "./UrlInput";

const fadeInUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: "easeOut", delay },
  }),
};

export default function Hero({ onSubmit }) {
  return (
    <section className="relative w-full pt-10 pb-16 lg:pt-14 lg:pb-20 overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #2d322f 1px, transparent 1px), linear-gradient(to bottom, #2d322f 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface z-[1]" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
          {/* Badge */}
          <motion.span
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.1}
            className="inline-block border border-dark/20 bg-accent px-3 py-1 text-[9px] font-semibold uppercase text-white tracking-[0.35em] mb-5"
          >
            Extrator de Assets de Design
          </motion.span>

          {/* Main heading */}
          <h1 className="flex flex-col items-center">
            <motion.span
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0.15}
              className="font-display uppercase font-semibold tracking-tighter leading-[0.88] text-dark text-4xl md:text-5xl lg:text-[4.5rem]"
            >
              EXTRAIA
            </motion.span>
            <motion.span
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0.3}
              className="font-display uppercase font-semibold tracking-tighter leading-[0.88] text-dark text-4xl md:text-5xl lg:text-[5rem]"
            >
              DESIGN
            </motion.span>
            <motion.span
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              custom={0.45}
              className="font-display uppercase font-semibold tracking-tighter leading-[0.88] text-accent text-4xl md:text-5xl lg:text-[4.5rem]"
            >
              ASSETS
            </motion.span>
          </h1>

          {/* Tagline */}
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.6}
            className="font-accent italic text-base md:text-lg text-accent mt-5 mb-1"
          >
            Onde design systems começam.
          </motion.p>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.7}
            className="text-dark/50 text-xs max-w-md mt-2 mb-8 leading-relaxed"
          >
            Baixe todos os assets visuais de qualquer site — HTML, CSS, imagens, fontes, SVGs — organizados e prontos para análise de design system.
          </motion.p>

          {/* URL Input */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={0.8}
            className="w-full max-w-xl"
          >
            <UrlInput onSubmit={onSubmit} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
