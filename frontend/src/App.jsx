import Header from "./components/Header";
import Hero from "./components/Hero";
import FeaturesSection from "./components/FeaturesSection";
import HowItWorks from "./components/HowItWorks";
import ProgressStream from "./components/ProgressStream";
import ResultsPanel from "./components/ResultsPanel";
import Footer from "./components/Footer";
import useDownload from "./hooks/useDownload";

export default function App() {
  const { status, progress, result, error, start, reset } = useDownload();

  return (
    <div className="min-h-screen bg-surface text-dark antialiased overflow-x-hidden">
      {/* Grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.9%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22256%22%20height%3D%22256%22%20filter%3D%22url(%23n)%22%20opacity%3D%220.5%22%2F%3E%3C%2Fsvg%3E')]" />

      <Header />

      <main>
        {status === "idle" && (
          <>
            <Hero onSubmit={start} />
            <FeaturesSection />
            <HowItWorks />
          </>
        )}

        {status === "streaming" && (
          <ProgressStream progress={progress} />
        )}

        {status === "complete" && result && (
          <ResultsPanel result={result} onReset={reset} />
        )}

        {status === "error" && (
          <section className="min-h-[60vh] flex items-center justify-center px-6">
            <div className="text-center max-w-lg">
              <p className="font-display text-3xl font-semibold uppercase tracking-tighter mb-4">
                Algo deu errado
              </p>
              <p className="text-dark/60 mb-8">{error}</p>
              <button
                onClick={reset}
                className="bg-dark text-white px-10 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors duration-300"
              >
                Tentar Novamente
              </button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
