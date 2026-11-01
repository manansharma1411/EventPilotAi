"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/budget/calculations";
import type { EventRecord } from "@/types";
import type { StructuredChangeProposal } from "@/lib/copilot/schemas";

interface AICopilotPanelProps {
  event: EventRecord;
  onChangesApplied: () => void;
}

export function AICopilotPanel({ event, onChangesApplied }: AICopilotPanelProps) {
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Proposal review state
  const [proposal, setProposal] = useState<StructuredChangeProposal | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccessMsg, setAppliedSuccessMsg] = useState<string | null>(null);
  const toast = useToast();

  const examplePrompts = [
    `Reduce the budget by ${event.currency} 5,000 without sacrificing food quality`,
    "Increase the guest count to 150 and adjust budgets",
    "Make this event family-friendly with activities for kids",
    "Suggest a simpler minimalist decor theme",
    "Move the event date by 2 weeks",
  ];

  const handlePropose = async (promptText: string) => {
    if (!promptText.trim()) return;
    setErrorMsg(null);
    setAppliedSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/events/${event.id}/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "propose",
          userRequest: promptText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze proposal");

      setProposal(data.proposal);
      setUserPrompt("");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error analyzing request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyApproved = async () => {
    if (!proposal) return;
    setIsApplying(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/events/${event.id}/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply",
          approvedProposal: proposal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed applying changes");

      const successText = `Success! Plan revision snapshot (v${data.version}) applied.`;
      setAppliedSuccessMsg(successText);
      toast.success("AI Proposal Applied", successText);
      setProposal(null);
      onChangesApplied();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error applying approved changes";
      setErrorMsg(msg);
      toast.error("Error applying changes", msg);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 border-brand-200 bg-gradient-to-br from-white via-brand-50/20 to-indigo-50/20 shadow-sm">
      {/* 1. COPILOT BANNER */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
              <span>EventPilot AI Copilot</span>
              <Badge variant="indigo" size="sm">Active Session</Badge>
            </h3>
            <p className="text-xs text-slate-500">
              Conversational planning assistant that analyzes trade-offs and generates structured before-and-after proposals.
            </p>
          </div>
        </div>
      </div>

      {/* 2. CHAT / INSTRUCTION INPUT */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handlePropose(userPrompt);
        }}
        className="space-y-3"
      >
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Reduce the budget by ₹5,000 without changing food quality..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-white"
          />
          <Button type="submit" size="md" isLoading={isLoading} className="gap-1.5 flex-shrink-0">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Copilot</span>
          </Button>
        </div>

        {/* Quick Example Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Try:</span>
          {examplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUserPrompt(p);
                handlePropose(p);
              }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-slate-600 hover:text-brand-700 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </form>

      {/* 3. ERROR & SUCCESS NOTIFICATIONS */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 shadow-subtle">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Copilot Notice</p>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {appliedSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 shadow-subtle">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="font-bold">{appliedSuccessMsg}</p>
        </div>
      )}

      {/* 4. STRUCTURED CHANGE PROPOSAL REVIEW CARD */}
      {proposal && (
        <Card className="p-6 space-y-5 border-2 border-brand-300 bg-white shadow-md">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <h4 className="text-sm font-bold text-navy-900">Structured Change Proposal</h4>
                <Badge variant={proposal.is_feasible ? "indigo" : "outline"} size="sm">
                  {proposal.is_feasible ? "Feasible" : "Trade-off Warning"}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 font-semibold mt-1">
                &ldquo;{proposal.user_intent_summary}&rdquo;
              </p>
            </div>
            <button
              onClick={() => setProposal(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Trade-offs & Analysis */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
            <span className="font-bold text-navy-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Trade-offs & Operational Impact</span>
            </span>
            <p className="text-slate-600 leading-relaxed">
              {proposal.trade_offs_explanation}
            </p>
            {proposal.infeasibility_reason && (
              <p className="text-rose-600 font-semibold">
                Constraint: {proposal.infeasibility_reason}
              </p>
            )}
          </div>

          {/* Before & After Comparison Tables */}
          {/* a) Event Parameters */}
          {proposal.event_field_changes.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block">
                Event Parameter Adjustments
              </span>
              <div className="space-y-1.5">
                {proposal.event_field_changes.map((ch, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-white flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-navy-900 capitalize">{ch.field.replace("_", " ")}</span>
                      <p className="text-[11px] text-slate-400">{ch.reason}</p>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="line-through text-slate-400">{String(ch.old_value ?? "None")}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-brand-600" />
                      <span className="font-bold text-brand-700">{String(ch.new_value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* b) Budget Line Item Changes */}
          {proposal.budget_changes.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block">
                Proposed Budget Line Item Changes
              </span>
              <div className="space-y-1.5">
                {proposal.budget_changes.map((bc, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-white flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-900">{bc.category}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                          bc.action === "add" ? "bg-emerald-50 text-emerald-700" : bc.action === "delete" ? "bg-rose-50 text-rose-700" : "bg-brand-50 text-brand-700"
                        }`}>
                          {bc.action}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{bc.reason}</p>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      {bc.old_estimated_cost !== undefined && (
                        <span className="line-through text-slate-400">
                          {formatCurrency(bc.old_estimated_cost, event.currency)}
                        </span>
                      )}
                      {bc.new_estimated_cost !== undefined && (
                        <>
                          <ArrowRight className="w-3.5 h-3.5 text-brand-600" />
                          <span className="font-bold text-navy-900">
                            {formatCurrency(bc.new_estimated_cost, event.currency)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* c) Proposed New Tasks */}
          {proposal.task_changes.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-navy-900 uppercase tracking-wider block">
                Proposed Task Milestones
              </span>
              <div className="space-y-1.5">
                {proposal.task_changes.map((tc, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-slate-100 bg-white flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-navy-900">{tc.title}</span>
                      <p className="text-[11px] text-slate-400">{tc.reason}</p>
                    </div>
                    {tc.priority && (
                      <Badge variant="outline" size="sm" className="capitalize">
                        {tc.priority}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400 italic">
              Unrelated user edits are strictly preserved.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setProposal(null)}>
                Decline
              </Button>
              <Button size="sm" isLoading={isApplying} onClick={handleApplyApproved} className="gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve & Apply Changes</span>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </Card>
  );
}
