"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut } from "lucide-react"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface DashboardLayoutProps {
  role: "buyer" | "seller"
  navItems: NavItem[]
  children: React.ReactNode
}

export function DashboardLayout({ role, navItems, children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between h-16">
          {sidebarOpen && (
            <Link href="/" className="flex items-center gap-2 font-bold hover:text-yellow-400 transition-colors">
              <span className="text-2xl">⚡</span>
              <span>TurboZaps</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  pathname === item.href
                    ? "bg-yellow-400 text-gray-900 font-semibold"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-800">
              <LogOut className="w-4 h-4" />
              {sidebarOpen && <span className="ml-2">Salir</span>}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-border h-16 flex items-center px-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground capitalize">
            {role === "buyer" ? "Panel del Comprador" : "Panel del Vendedor"}
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/30">{children}</div>
      </div>
    </div>
  )
}
