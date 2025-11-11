"use client"

export default function HowItWorks() {
  const steps = [
    { number: 1, title: "Publica", icon: "📦", description: "El vendedor publica un producto" },
    { number: 2, title: "Paga", icon: "⚡", description: "El comprador paga con Lightning (LNbits)" },
    { number: 3, title: "Escrow", icon: "💬", description: "Los fondos quedan en escrow hasta la entrega" },
    { number: 4, title: "Confirma", icon: "✅", description: "Cuando el comprador confirma, los sats se liberan" },
  ]

  return (
    <section id="como-funciona" className="py-20 px-4 bg-card border-t border-border">
      <div className="container mx-auto max-w-5xl">
        <h2 className="text-4xl font-bold text-center mb-4 text-balance">Cómo funciona</h2>
        <p className="text-center text-foreground/70 mb-16 max-w-2xl mx-auto">
          Un proceso transparente y seguro en 4 pasos
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary/70 flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
              <p className="text-sm text-foreground/60">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
