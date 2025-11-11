"use client"

import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import HowItWorks from "@/components/how-it-works"
import Features from "@/components/features"
import WhyTurboZaps from "@/components/why-turbozaps"
import CTA from "@/components/cta"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <WhyTurboZaps />
      <CTA />
      <Footer />
    </main>
  )
}
