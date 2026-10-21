"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Menu, X, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-amber-500 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brand-600 group-hover:text-amber-500 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-navy-900 tracking-tight">
                EventPilot AI
              </span>
              <Badge variant="indigo" size="sm" className="hidden sm:inline-flex">
                Challenge 5
              </Badge>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">Plan smarter. Celebrate better.</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a
            href="#features"
            className="hover:text-navy-900 transition-colors"
          >
            Features
          </a>
          <a
            href="#preview"
            className="hover:text-navy-900 transition-colors"
          >
            Dashboard Preview
          </a>
          <a
            href="#how-it-works"
            className="hover:text-navy-900 transition-colors"
          >
            How It Works
          </a>
          <a
            href="#sample-plan"
            className="hover:text-navy-900 transition-colors"
          >
            Sample Plan
          </a>
          <Link
            href="/api/health"
            target="_blank"
            className="hover:text-navy-900 transition-colors flex items-center gap-1 font-mono text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            API Health
          </Link>
        </nav>

        {/* Primary CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/plan">
            <Button size="md" className="gap-2">
              <span>Plan My Event</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <a
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
          >
            Features
          </a>
          <a
            href="#preview"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
          >
            Dashboard Preview
          </a>
          <a
            href="#how-it-works"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
          >
            How It Works
          </a>
          <a
            href="#sample-plan"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
          >
            Sample Plan
          </a>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/plan" onClick={() => setIsOpen(false)}>
              <Button className="w-full">Plan My Event</Button>
            </Link>
            <Link
              href="/api/health"
              target="_blank"
              className="text-xs font-mono text-center py-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-200"
            >
              GET /api/health
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
