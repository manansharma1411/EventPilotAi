"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Server, Cpu, Database, Shield } from "lucide-react";
import type { SystemHealthResponse } from "@/types";

export function HealthChecker() {
  const [data, setData] = useState<SystemHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  async function checkHealth() {
    setIsLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
      }
      const json: SystemHealthResponse = await res.json();
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to fetch health check";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div id="health" className="scroll-mt-24 w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-xl font-bold text-white">Live System Health Verification</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time ping to <code className="text-violet-400 font-mono">GET /api/health</code>. Validates server responsiveness and architecture readiness.
          </p>
        </div>

        <button
          onClick={checkHealth}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
          {isLoading ? "Checking..." : "Re-test Endpoint"}
        </button>
      </div>

      {/* Health status summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Core API Status */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Next.js Server</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-center gap-2">
            {data?.status === "ok" ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <span className="text-base font-semibold text-emerald-300">Healthy (200 OK)</span>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span className="text-base font-semibold text-rose-300">Unreachable</span>
              </>
            ) : (
              <span className="text-sm text-slate-400">Verifying...</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            {latencyMs !== null ? `Latency: ${latencyMs}ms` : "Pinging..."}
          </div>
        </div>

        {/* Environment */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Runtime Environment</span>
            <Cpu className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-base font-semibold text-white capitalize">
            {data?.environment ?? "Detecting..."}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Uptime: {data ? `${data.uptimeSeconds}s` : "..."}
          </div>
        </div>

        {/* Supabase PostgreSQL Readiness */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Supabase PostgreSQL</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                data?.services.supabase === "configured"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
              }`}
            >
              {data?.services.supabase === "configured"
                ? "Connected & Live"
                : "Phase 2 Setup Ready"}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            PostgreSQL client architecture ready
          </div>
        </div>

        {/* Gemini AI Readiness */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Gemini AI Engine</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                data?.services.gemini === "configured"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
              }`}
            >
              {data?.services.gemini === "configured"
                ? "Active"
                : "Phase 3 Ready"}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Structured prompt schemas prepared
          </div>
        </div>
      </div>

      {/* Raw Payload Inspector */}
      {data && (
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>Actual Server Response (Verified):</span>
            <span className="text-slate-500">{data.timestamp}</span>
          </div>
          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-2 bg-slate-900/80 rounded border border-slate-800/60">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <strong>Health verification error:</strong> {error}
        </div>
      )}
    </div>
  );
}
