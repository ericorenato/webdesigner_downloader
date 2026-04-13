import { Instagram, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-deep border-t-4 border-accent text-white py-16">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo + Project name */}
          <div className="flex items-center gap-4">
            <span className="font-display text-2xl font-semibold tracking-tighter uppercase text-accent">
              WDD
            </span>
            <span className="h-4 w-px bg-white/20" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
              Webdesign Downloader
            </span>
          </div>

          {/* Author info */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
              Desenvolvido por Erico Renato
            </span>
            <div className="flex items-center gap-4">
              <a
                href="https://ericorenato.com.br"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-accent transition-colors duration-300 flex items-center gap-2 text-xs uppercase tracking-[0.15em]"
              >
                <Globe size={14} />
                ericorenato.com.br
              </a>
              <a
                href="https://instagram.com/erico.arenato"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-accent transition-colors duration-300 flex items-center gap-2 text-xs uppercase tracking-[0.15em]"
              >
                <Instagram size={14} />
                @erico.arenato
              </a>
            </div>
          </div>

          {/* Year */}
          <span className="text-white/20 text-xs">
            {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
