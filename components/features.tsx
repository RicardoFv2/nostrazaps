"use client"

export default function Features() {
  const features = [
    {
      title: "Escrow automático con LNbits",
      icon: "🔒",
      description: "Tus fondos protegidos hasta que confirmes la entrega",
    },
    {
      title: "Pagos instantáneos con Lightning",
      icon: "⚡",
      description: "Transacciones rápidas y con mínimas comisiones",
    },
    { title: "Confianza sin intermediarios", icon: "🤝", description: "Control total de tus transacciones" },
    { title: "Ideal para comercio local", icon: "🛒", description: "Perfecto para entregas y comercio P2P con TurboZaps" },
  ]

  return (
    <section id="features" className="py-20 px-4 bg-background border-t border-border">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-4xl font-bold text-center mb-4 text-balance">Características principales</h2>
        <p className="text-center text-foreground/70 mb-16 max-w-2xl mx-auto">
          Todo lo que necesitas para comerciar con seguridad
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg group"
            >
              <div className="text-4xl mb-4 group-hover:scale-125 transition-transform origin-left">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
