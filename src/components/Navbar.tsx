"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Activity, Menu, X, Rocket, ShieldCheck } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Tagline */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                EventPilot AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Phase 1
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Plan smarter. Celebrate better.</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a
            href="#features"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            Features
          </a>
          <a
            href="#architecture"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            Architecture
          </a>
          <a
            href="#health"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            Live Health API
          </a>
          <a
            href="#roadmap"
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            Roadmap
          </a>
        </nav>

        {/* Actions & Health Link */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/api/health"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            GET /api/health
          </Link>
          <a
            href="#health"
            className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-md shadow-indigo-600/25 transition-all"
          >
            <Rocket className="w-3.5 h-3.5" />
            Verify Deployment
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drop-down */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-2 pb-6 space-y-3">
          <a
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            Features
          </a>
          <a
            href="#architecture"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            Architecture
          </a>
          <a
            href="#health"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-slate-300 hover:text-white flex items-center gap-2"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            Live Health API
          </a>
          <a
            href="#roadmap"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            Roadmap
          </a>
          <div className="pt-2 border-t border-slate-850 flex flex-col gap-2">
            <Link
              href="/api/health"
              target="_blank"
              className="text-xs font-mono text-center py-2 rounded bg-slate-900 text-slate-300"
            >
              Open /api/health
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
