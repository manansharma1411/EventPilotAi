import Link from "next/link";
import { Sparkles, ExternalLink, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200/90 bg-white py-12 text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-navy-900 text-sm">EventPilot AI</p>
              <p className="text-xs text-slate-500">Plan smarter. Celebrate better.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
            <Link
              href="/events/new"
              className="text-brand-600 hover:text-brand-700 transition-colors font-semibold"
            >
              Plan My Event
            </Link>
            <a href="#features" className="hover:text-navy-900 transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-navy-900 transition-colors">
              Interactive Preview
            </a>
            <a href="#sample-plan" className="hover:text-navy-900 transition-colors">
              Sample Plan
            </a>
            <Link
              href="/api/health"
              target="_blank"
              className="hover:text-navy-900 transition-colors flex items-center gap-1 font-mono text-emerald-700"
            >
              /api/health
              <ExternalLink className="w-3 h-3" />
            </Link>
            <a
              href="https://github.com/manansharma1411/EventPilotAi"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-navy-900 transition-colors flex items-center gap-1"
            >
              GitHub
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Prompt Wars Challenge 5
          </p>
        </div>
      </div>
    </footer>
  );
}
