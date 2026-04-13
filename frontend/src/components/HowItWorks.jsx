import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: "easeOut", delay },
  }),
};

const steps = [
  {
    num: "01",
    title: "Renderizar",
    desc: "O Playwright abre um Chromium headless, renderiza a página com execução completa de JavaScript e rola até o final para carregar conteúdo lazy.",
  },
  {
    num: "02",
    title: "Extrair",
    desc: "Interceptação de rede captura cada asset. Cheerio analisa o DOM. CSS-tree processa as folhas de estilo para fontes e tokens.",
  },
  {
    num: "03",
    title: "Reescrever",
    desc: "As URLs são reescritas para visualização offline. Scripts são limpos. Design tokens são extraídos em JSON estruturado.",
  },
  {
    num: "04",
    title: "Empacotar",
    desc: "Tudo é empacotado em um ZIP com capturas de tela, manifesto e uma estrutura de pastas pronta para análise.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 lg:py-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            custom={0}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <span className="h-px w-10 bg-accent/40" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-dark/40">
              Processo
            </span>
            <span className="h-px w-10 bg-accent/40" />
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-10%" }}
            custom={0.1}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tighter uppercase text-dark"
          >
            Como <span className="text-accent">funciona</span>
          </motion.h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-10%" }}
              custom={i * 0.15}
              className="group relative"
            >
              {/* Step number */}
              <span className="font-display text-6xl font-semibold text-dark/[0.06] tracking-tighter leading-none">
                {step.num}
              </span>

              {/* Divider */}
              <div className="h-px bg-dark/10 mb-6 mt-2 group-hover:bg-accent/40 transition-colors duration-500">
                <div className="h-px w-0 bg-accent group-hover:w-full transition-all duration-700" />
              </div>

              <h3 className="font-display text-lg font-semibold uppercase tracking-tight mb-3 group-hover:text-accent transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-dark/50 text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* API Section */}
        <motion.div
          id="api"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-10%" }}
          custom={0}
          className="mt-16 bg-deep text-white p-8 lg:p-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="h-px w-6 bg-accent/70" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">
              Endpoint da API
            </span>
          </div>

          <div className="font-mono text-sm text-white/70 space-y-1">
            <p>
              <span className="text-accent font-semibold">POST</span>{" "}
              /api/download
            </p>
            <pre className="mt-4 text-white/40 text-xs leading-relaxed overflow-x-auto">{`{
  "url": "https://exemplo.com",
  "options": {
    "extractDesignTokens": true,
    "screenshots": true,
    "scrollToBottom": true,
    "timeout": 30000
  }
}`}</pre>
          </div>

          <p className="text-white/30 text-xs mt-6 uppercase tracking-[0.1em]">
            Retorna stream SSE com progresso em tempo real + link para download do ZIP
          </p>
        </motion.div>
      </div>
    </section>
  );
}
