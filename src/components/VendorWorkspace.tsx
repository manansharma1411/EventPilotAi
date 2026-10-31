"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building,
  DollarSign,
  Filter,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/budget/calculations";
import type { EventRecord, EventVendorRecord, VendorRecord, EventVendorSelectionStatus } from "@/types";
import type { ExtractedQuotation } from "@/app/api/events/[id]/vendors/extract/route";

interface VendorWorkspaceProps {
  event: EventRecord;
  eventVendors: EventVendorRecord[];
  onVendorsChange: () => void;
}

export function VendorWorkspace({
  event,
  eventVendors,
  onVendorsChange,
}: VendorWorkspaceProps) {
  // Modal states
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [isUploadingQuote, setIsUploadingQuote] = useState(false);

  // Custom vendor entry state
  const [vName, setVName] = useState("");
  const [vCategory, setVCategory] = useState("catering");
  const [vLocation, setVLocation] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vWebsite, setVWebsite] = useState("");
  const [vQuotedPrice, setVQuotedPrice] = useState<number>(0);
  const [vStatus, setVStatus] = useState<EventVendorSelectionStatus>("inquired");
  const [vNotes, setVNotes] = useState("");
  const [isSubmittingVendor, setIsSubmittingVendor] = useState(false);

  // Edit vendor state
  const [editingEvId, setEditingEvId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<EventVendorSelectionStatus>("inquired");
  const [editNotes, setEditNotes] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Quote Extraction state
  const [rawQuoteText, setRawQuoteText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedQuote, setExtractedQuote] = useState<ExtractedQuotation | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Filter & sorting
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Handle Add Custom Vendor
  const handleAddCustomVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName.trim() || !vCategory.trim()) return;

    try {
      setIsSubmittingVendor(true);
      const res = await fetch(`/api/events/${event.id}/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: vName.trim(),
          category: vCategory.trim(),
          location: vLocation.trim() || event.location,
          contact_info: {
            phone: vPhone.trim() || undefined,
            email: vEmail.trim() || undefined,
            website: vWebsite.trim() || undefined,
          },
          quoted_price: Number(vQuotedPrice),
          selection_status: vStatus,
          notes: vNotes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add vendor");
      }

      setVName("");
      setVLocation("");
      setVPhone("");
      setVEmail("");
      setVWebsite("");
      setVQuotedPrice(0);
      setVNotes("");
      setIsAddingCustom(false);
      onVendorsChange();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error saving vendor");
    } finally {
      setIsSubmittingVendor(false);
    }
  };

  // Handle Quote Extraction
  const handleExtractQuote = async () => {
    if (!rawQuoteText.trim()) return;
    setIsExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch(`/api/events/${event.id}/vendors/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: rawQuoteText.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to extract quotation");

      setExtractedQuote(data.extracted);
    } catch (err: unknown) {
      setExtractError(err instanceof Error ? err.message : "Error extracting quote");
    } finally {
      setIsExtracting(false);
    }
  };

  // Save Extracted Quote as Vendor
  const handleSaveExtractedVendor = async () => {
    if (!extractedQuote) return;

    try {
      const res = await fetch(`/api/events/${event.id}/vendors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: extractedQuote.vendor_name,
          category: extractedQuote.category,
          location: event.location,
          contact_info: {
            validity_period: extractedQuote.validity_period,
            payment_terms: extractedQuote.payment_terms,
          },
          quoted_price: extractedQuote.quoted_total,
          selection_status: "quoted",
          notes: `Extracted terms: ${extractedQuote.payment_terms}. Inclusions: ${extractedQuote.inclusions.join(", ")}`,
        }),
      });

      if (!res.ok) throw new Error("Failed to save extracted quotation");

      setExtractedQuote(null);
      setRawQuoteText("");
      setIsUploadingQuote(false);
      onVendorsChange();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error saving vendor");
    }
  };

  // Start Edit
  const startEditing = (ev: EventVendorRecord) => {
    setEditingEvId(ev.id);
    setEditPrice(Number(ev.quoted_price || 0));
    setEditStatus(ev.selection_status);
    setEditNotes(ev.notes || "");
  };

  // Save Edit
  const handleSaveEdit = async (eventVendorId: string) => {
    try {
      setIsSavingEdit(true);
      const res = await fetch(`/api/events/${event.id}/vendors`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventVendorId,
          quoted_price: Number(editPrice),
          selection_status: editStatus,
          notes: editNotes,
        }),
      });

      if (!res.ok) throw new Error("Failed updating vendor");

      setEditingEvId(null);
      onVendorsChange();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error saving edit");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete Event Vendor
  const handleDelete = async (eventVendorId: string) => {
    if (!confirm("Remove this vendor from your event?")) return;

    try {
      const res = await fetch(`/api/events/${event.id}/vendors?eventVendorId=${eventVendorId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed deleting vendor");
      onVendorsChange();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting vendor");
    }
  };

  // Filtered vendors
  const filteredVendors = eventVendors.filter((ev) => {
    const v = ev.vendor;
    if (!v) return true;
    if (categoryFilter !== "all" && v.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;
    if (statusFilter !== "all" && ev.selection_status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. HEADER & ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-600" />
            <span>Vendor Directory & Quotation Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Compare service quotes, negotiate contracts, and track selection milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsUploadingQuote(!isUploadingQuote)}
            className="gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Extract Quotation</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddingCustom(!isAddingCustom)}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vendor</span>
          </Button>
        </div>
      </div>

      {/* 2. QUOTATION EXTRACTION PANEL */}
      {isUploadingQuote && (
        <Card className="p-6 border-indigo-200 bg-indigo-50/20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>AI Quotation Extractor</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Paste raw vendor quotation emails or text proposals. Gemini will extract itemized costs and terms.
              </p>
            </div>
            <button onClick={() => setIsUploadingQuote(false)} className="text-slate-400 hover:text-navy-900">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <textarea
              rows={4}
              placeholder="Paste quotation document text here (e.g. 'Golden Lens Studio - Full day wedding photography: $3,200. Includes 2 shooters, drone footage. Excludes printed album...')"
              value={rawQuoteText}
              onChange={(e) => setRawQuoteText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" isLoading={isExtracting} onClick={handleExtractQuote} className="gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Analyze & Extract</span>
              </Button>
            </div>
          </div>

          {extractError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {extractError}
            </div>
          )}

          {extractedQuote && (
            <Card className="p-5 border-emerald-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Extracted Quotation Summary</span>
                </span>
                <span className="text-xs font-mono font-bold text-navy-900">
                  {formatCurrency(extractedQuote.quoted_total, extractedQuote.currency)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Vendor Name:</span>
                  <span className="font-semibold text-navy-900">{extractedQuote.vendor_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Category:</span>
                  <span className="font-semibold capitalize text-navy-900">{extractedQuote.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Validity:</span>
                  <span className="text-slate-600">{extractedQuote.validity_period}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Payment Terms:</span>
                  <span className="text-slate-600">{extractedQuote.payment_terms}</span>
                </div>
              </div>

              {extractedQuote.itemized_costs.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">Itemized Costs:</span>
                  <div className="space-y-1">
                    {extractedQuote.itemized_costs.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs">
                        <span className="text-slate-600">{item.item}</span>
                        <span className="font-mono">{formatCurrency(item.cost, extractedQuote.currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[10px] text-amber-700 italic">
                {extractedQuote.confidence_warning}
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setExtractedQuote(null)}>
                  Discard
                </Button>
                <Button size="sm" onClick={handleSaveExtractedVendor}>
                  Save Extracted Vendor to Event
                </Button>
              </div>
            </Card>
          )}
        </Card>
      )}

      {/* 3. ADD CUSTOM VENDOR PANEL */}
      {isAddingCustom && (
        <Card className="p-6 border-brand-200 bg-brand-50/30">
          <form onSubmit={handleAddCustomVendor} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-navy-900">Add Service Provider</h3>
              <button onClick={() => setIsAddingCustom(false)} className="text-slate-400 hover:text-navy-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Input
                label="Vendor Name"
                placeholder="e.g. Sonoma Glass Pavilion"
                value={vName}
                onChange={(e) => setVName(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">Category</label>
                <select
                  value={vCategory}
                  onChange={(e) => setVCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                >
                  <option value="venue">Venue</option>
                  <option value="catering">Catering & Bar</option>
                  <option value="photography">Photography & Video</option>
                  <option value="entertainment">Music & Entertainment</option>
                  <option value="decor">Floral & Decor</option>
                  <option value="logistics">Logistics & Rentals</option>
                  <option value="other">Other Service</option>
                </select>
              </div>

              <Input
                label="Location / Region"
                placeholder="e.g. Napa Valley, CA"
                value={vLocation}
                onChange={(e) => setVLocation(e.target.value)}
              />

              <Input
                label={`Quoted Price (${event.currency})`}
                type="number"
                min="0"
                step="0.01"
                value={vQuotedPrice}
                onChange={(e) => setVQuotedPrice(Number(e.target.value))}
              />

              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1.5">Selection Status</label>
                <select
                  value={vStatus}
                  onChange={(e) => setVStatus(e.target.value as EventVendorSelectionStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                >
                  <option value="inquired">Inquired</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="quoted">Quoted</option>
                  <option value="contract_signed">Contract Signed</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <Input
                label="Phone / Contact"
                placeholder="e.g. +1 555-0192"
                value={vPhone}
                onChange={(e) => setVPhone(e.target.value)}
              />
            </div>

            <Input
              label="Notes & Proposal Scope"
              placeholder="e.g. Includes setup, teardown, and 6 staff members"
              value={vNotes}
              onChange={(e) => setVNotes(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingCustom(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={isSubmittingVendor}>
                Save Vendor
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* 4. FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Categories</option>
            <option value="venue">Venue</option>
            <option value="catering">Catering</option>
            <option value="photography">Photography</option>
            <option value="entertainment">Entertainment</option>
            <option value="decor">Decor</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="inquired">Inquired</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="quoted">Quoted</option>
            <option value="contract_signed">Contract Signed</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {filteredVendors.length} of {eventVendors.length} Vendors
        </span>
      </div>

      {/* 5. VENDORS COMPARISON TABLE / CARDS */}
      <div className="space-y-3">
        {filteredVendors.length === 0 ? (
          <Card className="p-8 text-center space-y-2">
            <Building className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-navy-900">No Vendors Logged Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add vendors manually or extract quotation proposals using the AI extractor above.
            </p>
          </Card>
        ) : (
          filteredVendors.map((ev) => {
            const v = ev.vendor;
            const isEditing = editingEvId === ev.id;

            if (isEditing) {
              return (
                <Card key={ev.id} className="p-4 border-brand-300 ring-1 ring-brand-300 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input
                      label={`Quoted Price (${event.currency})`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                    />
                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1.5">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as EventVendorSelectionStatus)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                      >
                        <option value="inquired">Inquired</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="quoted">Quoted</option>
                        <option value="contract_signed">Contract Signed</option>
                        <option value="declined">Declined</option>
                      </select>
                    </div>
                    <Input
                      label="Notes"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingEvId(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" isLoading={isSavingEdit} onClick={() => handleSaveEdit(ev.id)}>
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Save Changes
                    </Button>
                  </div>
                </Card>
              );
            }

            return (
              <Card
                key={ev.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-subtle transition-all"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-navy-900">{v?.name || "Direct Vendor"}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-100 text-slate-700 capitalize">
                      {v?.category || "Service"}
                    </span>
                    <Badge variant={ev.selection_status === "contract_signed" ? "indigo" : "outline"} size="sm" className="capitalize">
                      {ev.selection_status.replace("_", " ")}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500">
                    {v?.location || event.location} &bull; Source: <span className="capitalize">{v?.source || "Direct Entry"}</span>
                  </p>

                  {ev.notes && (
                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg mt-1">
                      {ev.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block">Quoted Price</span>
                    <span className="text-sm font-mono font-bold text-navy-900">
                      {formatCurrency(ev.quoted_price, ev.currency || event.currency)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => startEditing(ev)}
                      title="Edit Vendor"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDelete(ev.id)}
                      title="Remove Vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
