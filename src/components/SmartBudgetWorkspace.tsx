"use client";

import { useState } from "react";
import {
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Save,
  X,
  PieChart as PieChartIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateBudgetMetrics, formatCurrency } from "@/lib/budget/calculations";
import type { BudgetItemRecord } from "@/types";

interface SmartBudgetWorkspaceProps {
  eventId: string;
  totalBudget: number;
  currency: string;
  items: BudgetItemRecord[];
  onItemsChange: () => void;
}

export function SmartBudgetWorkspace({
  eventId,
  totalBudget,
  currency,
  items,
  onItemsChange,
}: SmartBudgetWorkspaceProps) {
  // Add item form state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEstimated, setNewEstimated] = useState<number>(0);
  const [newActual, setNewActual] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit item inline state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEstimated, setEditEstimated] = useState<number>(0);
  const [editActual, setEditActual] = useState<number>(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Filter/Sort state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  const metrics = calculateBudgetMetrics(totalBudget, items);

  // Handle Add Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/events/${eventId}/budget`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newCategory.trim(),
          description: newDescription.trim(),
          estimated_cost: Number(newEstimated),
          actual_cost: Number(newActual),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add budget line item");
      }

      setNewCategory("");
      setNewDescription("");
      setNewEstimated(0);
      setNewActual(0);
      setIsAddingItem(false);
      onItemsChange();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error creating budget item");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start inline editing
  const startEditing = (item: BudgetItemRecord) => {
    setEditingItemId(item.id);
    setEditCategory(item.category);
    setEditDescription(item.description || "");
    setEditEstimated(Number(item.estimated_cost));
    setEditActual(Number(item.actual_cost));
  };

  // Save inline edit
  const handleSaveEdit = async (itemId: string) => {
    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/events/${eventId}/budget`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          category: editCategory,
          description: editDescription,
          estimated_cost: Number(editEstimated),
          actual_cost: Number(editActual),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update item");
      }

      setEditingItemId(null);
      onItemsChange();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error saving edit");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to remove this budget line item?")) return;

    try {
      const res = await fetch(`/api/events/${eventId}/budget?itemId=${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete item");
      }

      onItemsChange();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting budget item");
    }
  };

  const filteredItems = selectedCategoryFilter === "all"
    ? items
    : items.filter((i) => i.category.toLowerCase().trim() === selectedCategoryFilter.toLowerCase().trim());

  return (
    <div className="space-y-6">
      {/* 1. TOP FINANCIAL METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Approved Budget</span>
          <p className="text-lg sm:text-xl font-extrabold text-navy-900 font-mono">
            {formatCurrency(metrics.totalBudget, currency)}
          </p>
          <span className="text-[10px] text-slate-400 block">Total budget cap</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Total Estimated</span>
          <p className="text-lg sm:text-xl font-extrabold text-brand-600 font-mono">
            {formatCurrency(metrics.totalEstimated, currency)}
          </p>
          <span className="text-[10px] text-slate-400 block">
            {metrics.allocationPercent}% allocated
          </span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-500">Actual Spending</span>
          <p className="text-lg sm:text-xl font-extrabold text-navy-900 font-mono">
            {formatCurrency(metrics.totalActual, currency)}
          </p>
          <span className="text-[10px] text-slate-400 block">
            {metrics.actualSpentPercent}% committed
          </span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-medium text-slate-500">
            {metrics.isOverBudget ? "Overspending" : "Remaining Funds"}
          </span>
          <p className={`text-lg sm:text-xl font-extrabold font-mono ${
            metrics.isOverBudget ? "text-rose-600" : "text-emerald-600"
          }`}>
            {metrics.isOverBudget
              ? `-${formatCurrency(metrics.overspendAmount, currency)}`
              : formatCurrency(metrics.remainingBudget, currency)}
          </p>
          <span className="text-[10px] text-slate-400 block">
            {metrics.isOverBudget ? "Exceeds approved cap" : "Available to allocate"}
          </span>
        </Card>

        <Card className="p-4 space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[11px] font-medium text-slate-500">Contingency Reserve</span>
          <p className="text-lg sm:text-xl font-extrabold text-slate-700 font-mono">
            {formatCurrency(metrics.contingencyReserve, currency)}
          </p>
          <span className="text-[10px] text-slate-400 block">Emergency buffer</span>
        </Card>
      </div>

      {/* 2. OVERSPENDING OR UNALLOCATED WARNING BANNERS */}
      {metrics.isOverBudget && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center justify-between gap-3 shadow-subtle">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Budget Overspend Detected</p>
              <p className="text-rose-700 mt-0.5">
                Current commitments exceed the total budget by {formatCurrency(metrics.overspendAmount, currency)}. Rebalance line items or increase budget cap.
              </p>
            </div>
          </div>
        </div>
      )}

      {metrics.unallocatedBudget > 0 && !metrics.isOverBudget && items.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 shadow-subtle">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              <strong>{formatCurrency(metrics.unallocatedBudget, currency)}</strong> unallocated remaining in approved budget.
            </span>
          </div>
        </div>
      )}

      {/* 3. VISUAL CATEGORY ALLOCATION BAR (Deterministic Chart) */}
      {metrics.categoryBreakdown.length > 0 && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-navy-900 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-brand-600" />
              <span>Category Allocation Breakdown</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">
              {items.length} Line Items
            </span>
          </div>

          {/* Stacked Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
            {metrics.categoryBreakdown.map((cat, idx) => (
              <div
                key={idx}
                title={`${cat.category}: ${formatCurrency(cat.estimatedTotal, currency)} (${cat.percentageOfBudget}%)`}
                style={{
                  width: `${Math.max(1, cat.percentageOfBudget)}%`,
                  backgroundColor: cat.color,
                }}
                className="h-full transition-all duration-300"
              />
            ))}
          </div>

          {/* Interactive Legend Tags */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setSelectedCategoryFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedCategoryFilter === "all"
                  ? "bg-navy-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Categories ({items.length})
            </button>
            {metrics.categoryBreakdown.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategoryFilter(cat.category)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategoryFilter.toLowerCase() === cat.category.toLowerCase()
                    ? "ring-2 ring-brand-500 text-navy-900 font-bold bg-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <span>{cat.category}</span>
                <span className="font-mono text-[10px] text-slate-400">({cat.percentageOfBudget}%)</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* 4. BUDGET ITEMS LEDGER TABLE */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-navy-900">Itemized Financial Ledger</h3>
            <p className="text-xs text-slate-500">Inline edit estimated and actual costs directly in real-time.</p>
          </div>

          <Button
            size="sm"
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Line Item</span>
          </Button>
        </div>

        {/* Add Item Panel */}
        {isAddingItem && (
          <Card className="p-5 border-brand-200 bg-brand-50/30">
            <form onSubmit={handleAddItem} className="space-y-4">
              <h4 className="text-xs font-bold text-navy-900">New Budget Category Item</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  label="Category Name"
                  placeholder="e.g. Venue, Catering, Music"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                />
                <Input
                  label="Description / Scope"
                  placeholder="e.g. 4-course banquet & staff"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
                <Input
                  label={`Estimated Cost (${currency})`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={newEstimated}
                  onChange={(e) => setNewEstimated(Number(e.target.value))}
                  required
                />
                <Input
                  label={`Actual Spent (${currency})`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={newActual}
                  onChange={(e) => setNewActual(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingItem(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={isSubmitting}>
                  Save Item
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Item Rows */}
        {filteredItems.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <DollarSign className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-navy-900">No Budget Items Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add a line item manually or generate a plan using the AI Blueprint Generator.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const isEditing = editingItemId === item.id;
              const isOverspent = Number(item.actual_cost) > Number(item.estimated_cost) && Number(item.actual_cost) > 0;

              if (isEditing) {
                return (
                  <Card key={item.id} className="p-4 border-brand-300 ring-1 ring-brand-300 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <Input
                        label="Category"
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        required
                      />
                      <Input
                        label="Description"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                      <Input
                        label={`Estimated (${currency})`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={editEstimated}
                        onChange={(e) => setEditEstimated(Number(e.target.value))}
                        required
                      />
                      <Input
                        label={`Actual (${currency})`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={editActual}
                        onChange={(e) => setEditActual(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingItemId(null)}>
                        Cancel
                      </Button>
                      <Button size="sm" isLoading={isSavingEdit} onClick={() => handleSaveEdit(item.id)}>
                        <Save className="w-3.5 h-3.5 mr-1" />
                        Save Changes
                      </Button>
                    </div>
                  </Card>
                );
              }

              return (
                <Card
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-subtle transition-all"
                >
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy-900">{item.category}</span>
                      {isOverspent && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Over estimated</span>
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-500">{item.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block">Estimated</span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {formatCurrency(item.estimated_cost, currency)}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block">Actual</span>
                      <span className={`text-xs font-mono font-bold ${
                        isOverspent ? "text-rose-600" : "text-navy-900"
                      }`}>
                        {formatCurrency(item.actual_cost, currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => startEditing(item)}
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                        onClick={() => handleDeleteItem(item.id)}
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
