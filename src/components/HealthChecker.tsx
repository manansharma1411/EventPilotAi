"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Server, Cpu, Database, Shield } from "lucide-react";
import type { SystemHealthResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    <div id="health" className="scroll-mt-24 w-full rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-xl font-bold text-navy-900">Live System Health Verification</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time ping to <code className="text-brand-600 font-mono bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200/60">GET /api/health</code>. Validates server responsiveness and runtime metrics.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={checkHealth}
          disabled={isLoading}
          className="self-start sm:self-auto gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-brand-600" : ""}`} />
          <span>{isLoading ? "Pinging..." : "Re-test Endpoint"}</span>
        </Button>
      </div>

      {/* Health status summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Core API Status */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Next.js Server</span>
            <Server className="w-4 h-4 text-brand-600" />
          </div>
          <div className="flex items-center gap-2">
            {data?.status === "ok" ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="text-sm font-bold text-emerald-800">Healthy (200 OK)</span>
              </>
            ) : error ? (
              <>
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span className="text-sm font-bold text-rose-800">Unreachable</span>
              </>
            ) : (
              <span className="text-xs text-slate-400">Verifying...</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            {latencyMs !== null ? `Latency: ${latencyMs}ms` : "Pinging..."}
          </div>
        </div>

        {/* Environment */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Runtime Environment</span>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-sm font-bold text-navy-900 capitalize">
            {data?.environment ?? "Detecting..."}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 font-mono">
            Uptime: {data ? `${data.uptimeSeconds}s` : "..."}
          </div>
        </div>

        {/* Supabase PostgreSQL Readiness */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Supabase PostgreSQL</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={data?.services.supabase === "configured" ? "success" : "warning"}
              size="sm"
            >
              {data?.services.supabase === "configured" ? "Connected & Live" : "Phase 3 Ready"}
            </Badge>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            PostgreSQL relational client stub ready
          </div>
        </div>

        {/* Gemini AI Readiness */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Gemini AI Engine</span>
            <Shield className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={data?.services.gemini === "configured" ? "success" : "indigo"}
              size="sm"
            >
              {data?.services.gemini === "configured" ? "Active" : "Phase 3 Ready"}
            </Badge>
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            Structured prompt schemas prepared
          </div>
        </div>
      </div>

      {/* Raw Payload Inspector */}
      {data && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
            <span>Live Response (GET /api/health):</span>
            <span>{data.timestamp}</span>
          </div>
          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-2 bg-slate-950/70 rounded-xl border border-slate-800">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          <strong>Health verification error:</strong> {error}
        </div>
      )}
    </div>
  );
}
