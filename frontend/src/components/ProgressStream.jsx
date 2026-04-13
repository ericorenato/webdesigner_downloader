import { motion, AnimatePresence } from "framer-motion";
import { Loader } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.3 },
  },
};

export default function ProgressStream({ progress }) {
  const { steps = [], currentStep = "", percent = 0, message = "" } = progress;

  return (
    <section className="relative min-h-[80vh] bg-deep text-white flex items-center py-24">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-[1100px] mx-auto px-6 lg:px-12 w-full">
        {/* Eyebrow */}
        <div className="flex items-center gap-4 mb-12">
          <span className="h-px w-10 bg-accent/70" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40 flex items-center gap-2">
            <Loader size={12} className="animate-spin" />
            Processando
          </span>
          <span className="h-px w-10 bg-accent/70" />
        </div>

        {/* Big percentage */}
        <motion.div
          key={percent}
          initial={{ opacity: 0.5, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-display text-7xl md:text-[8rem] font-semibold tracking-tighter leading-none text-white/10 mb-8"
        >
          {percent}%
        </motion.div>

        {/* Current step */}
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="font-display text-xl md:text-2xl font-semibold uppercase tracking-tight text-white mb-2"
          >
            {currentStep}
          </motion.p>
        </AnimatePresence>

        <p className="text-white/40 text-sm mb-12">{message}</p>

        {/* Progress bar */}
        <div className="h-px bg-white/10 w-full mb-12">
          <motion.div
            className="h-px bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Step log */}
        <div className="space-y-3">
          <AnimatePresence>
            {steps.map((step, i) => (
              <motion.div
                key={`step-${i}-${step.step}`}
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-4 text-sm"
              >
                <span className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
                <span className="text-white/30 font-mono text-xs w-12">
                  {step.percent}%
                </span>
                <span className="text-white/60">{step.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
