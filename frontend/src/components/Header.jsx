import { Instagram } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-dark/10 bg-surface/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold tracking-tighter uppercase text-accent">
            WDD
          </span>
          <span className="hidden sm:inline text-[9px] uppercase tracking-[0.2em] text-dark/40 font-semibold">
            Webdesign Downloader
          </span>
        </a>

        {/* Center Nav */}
        <nav className="hidden md:flex justify-center gap-10">
          {[
            { label: "Recursos", href: "#recursos" },
            { label: "Como Funciona", href: "#como-funciona" },
            { label: "API", href: "#api" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="relative group text-xs font-semibold text-dark/70 hover:text-accent transition-colors duration-300 uppercase tracking-[0.15em] py-2 whitespace-nowrap"
            >
              {item.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <a
            href="https://instagram.com/erico.arenato"
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark/50 hover:text-accent transition-colors duration-300"
          >
            <Instagram size={20} />
          </a>
          <a
            href="https://ericorenato.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-dark/50 hover:text-accent transition-colors duration-300 hidden sm:block"
          >
            ericorenato.com.br
          </a>
        </div>
      </div>
    </header>
  );
}
