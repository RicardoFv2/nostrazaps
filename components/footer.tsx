"use client"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold text-primary mb-4">
              <span className="text-2xl">⚡</span>
              TurboZaps
            </div>
            <p className="text-sm text-foreground/70">Comercio seguro para El Salvador</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm text-foreground/70 hover:text-primary transition-colors">
                  Características
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Comunidad</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground/70 hover:text-primary transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground/70 hover:text-primary transition-colors"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-foreground/60">
          <p>© 2025 TurboZaps. Comercio local con Lightning Network.</p>
        </div>
      </div>
    </footer>
  )
}
