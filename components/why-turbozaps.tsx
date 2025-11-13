"use client"

export default function WhyTurboZaps() {
  return (
    <section className="py-20 px-4 bg-card border-t border-border">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-4xl font-bold mb-8 text-balance">Por qué TurboZaps</h2>

        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 p-8 md:p-12">
          <p className="text-lg text-foreground/80 leading-relaxed mb-6">
            El comercio local en El Salvador suele usar "pago contra entrega" por falta de confianza. Los vendedores
            tienen miedo de no recibir el dinero, y los compradores tienen miedo de ser estafados.
          </p>

          <p className="text-lg text-foreground/80 leading-relaxed">
            <strong>TurboZaps lo resuelve con escrow Lightning.</strong> Los fondos se mantienen seguros hasta que ambas
            partes confirmen la transacción. Sin intermediarios, sin comisiones altas, solo comercio seguro y rápido.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">0%</div>
              <p className="text-sm text-foreground/70">Comisiones ocultas</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">⚡</div>
              <p className="text-sm text-foreground/70">Pagos instantáneos</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">🔒</div>
              <p className="text-sm text-foreground/70">Totalmente seguro</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
