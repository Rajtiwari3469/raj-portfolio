"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit3, Save, X, IndianRupee } from "lucide-react";
import GlassPanel from "@/components/ui/GlassPanel";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

interface PricingItem {
  id: string;
  projectName: string;
  totalPrice: number;
  advancePrice: number;
  billingType: string;
  description: string | null;
  active: boolean;
  order: number;
  createdAt: string;
}

export default function PricingPage() {
  const { toast } = useToast();
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [form, setForm] = useState({
    projectName: "",
    totalPrice: "",
    advancePrice: "",
    billingType: "one-time",
    description: "",
  });

  const fetchPricing = async () => {
    try {
      const res = await fetch("/api/admin/pricing");
      if (res.ok) setPricing(await res.json());
    } catch {
      toast("Failed to load pricing", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handleSubmit = async () => {
    if (!form.projectName || !form.totalPrice || !form.advancePrice) {
      toast("Please fill all required fields", "error");
      return;
    }

    const total = parseInt(form.totalPrice);
    const advance = parseInt(form.advancePrice);

    if (advance > total) {
      toast("Advance cannot exceed total price", "error");
      return;
    }

    try {
      const method = editingId ? "PUT" : "POST";
      const res = await fetch("/api/admin/pricing", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId && { id: editingId }),
          projectName: form.projectName,
          totalPrice: total,
          advancePrice: advance,
          billingType: form.billingType,
          description: form.description || null,
        }),
      });

      if (res.ok) {
        toast(editingId ? "Pricing updated" : "Pricing added");
        setShowForm(false);
        setEditingId(null);
        setForm({ projectName: "", totalPrice: "", advancePrice: "", billingType: "one-time", description: "" });
        fetchPricing();
      } else {
        const data = await res.json();
        toast(data.error || "Failed to save", "error");
      }
    } catch {
      toast("Failed to save pricing", "error");
    }
  };

  const handleEdit = (item: PricingItem) => {
    setForm({
      projectName: item.projectName,
      totalPrice: String(item.totalPrice),
      advancePrice: String(item.advancePrice),
      billingType: item.billingType || "one-time",
      description: item.description || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/pricing?id=${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast("Pricing deleted");
        fetchPricing();
      }
    } catch {
      toast("Failed to delete", "error");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const toggleActive = async (item: PricingItem) => {
    try {
      await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, active: !item.active }),
      });
      fetchPricing();
    } catch {
      toast("Failed to update", "error");
    }
  };

  const formatCurrency = (amount: number, billingType?: string) => {
    const formatted = `₹${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
    if (billingType && billingType !== "one-time") {
      return `${formatted}/${billingType}`;
    }
    return formatted;
  };

  const formatCurrencyFull = (amount: number, billingType?: string) => {
    const formatted = `₹${amount.toLocaleString("en-IN")}`;
    if (billingType && billingType !== "one-time") {
      return `${formatted}/${billingType}`;
    }
    return formatted;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pricing Management</h1>
          <p className="text-foreground/40 mt-1">
            Set project prices — AI will use these when chatting with visitors
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setForm({ projectName: "", totalPrice: "", advancePrice: "", billingType: "one-time", description: "" });
            setEditingId(null);
            setShowForm(true);
          }}
        >
          <Plus size={16} className="mr-1" />
          Add Pricing
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassPanel className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {editingId ? "Edit Pricing" : "Add New Pricing"}
              </h3>
              <button
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="p-1 rounded-lg hover:bg-white/5 text-foreground/40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-foreground/40 mb-1.5">Project Name *</label>
                <input
                  type="text"
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                  placeholder="e.g. Web Development"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground/40 mb-1.5">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. React, Next.js, Node.js"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground/40 mb-1.5">Total Price (₹) *</label>
                <input
                  type="number"
                  value={form.totalPrice}
                  onChange={(e) => setForm({ ...form, totalPrice: e.target.value })}
                  placeholder="e.g. 25000"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground/40 mb-1.5">Advance Price (₹) *</label>
                <input
                  type="number"
                  value={form.advancePrice}
                  onChange={(e) => setForm({ ...form, advancePrice: e.target.value })}
                  placeholder="e.g. 15000"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/30 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-foreground/40 mb-1.5">Billing Period</label>
                <div className="relative">
                  <select
                    value={form.billingType}
                    onChange={(e) => setForm({ ...form, billingType: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary/30 transition-colors appearance-none"
                  >
                    <option value="one-time" style={{ background: "#0a0a1f" }}>One-time</option>
                    <option value="month" style={{ background: "#0a0a1f" }}>/month</option>
                    <option value="year" style={{ background: "#0a0a1f" }}>/year</option>
                    <option value="week" style={{ background: "#0a0a1f" }}>/week</option>
                    <option value="day" style={{ background: "#0a0a1f" }}>/day</option>
                    <option value="hour" style={{ background: "#0a0a1f" }}>/hour</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-2.5 h-2.5 border-r-2 border-b-2 border-foreground/30 rotate-45" />
                  </div>
                </div>
              </div>
            </div>

            {form.totalPrice && form.advancePrice && (
              <div className="flex gap-4 text-sm">
                <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  Total: {formatCurrency(parseInt(form.totalPrice) || 0, form.billingType)}
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-gold">
                  Advance: {formatCurrency(parseInt(form.advancePrice) || 0, form.billingType)}
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary">
                  Pending: {formatCurrency((parseInt(form.totalPrice) || 0) - (parseInt(form.advancePrice) || 0), form.billingType)}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => { setShowForm(false); setEditingId(null); }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                <Save size={16} className="mr-1" />
                {editingId ? "Update" : "Save"}
              </Button>
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {pricing.length === 0 ? (
        <GlassPanel className="text-center py-12">
          <IndianRupee size={48} className="mx-auto mb-4 text-foreground/30" />
          <p className="text-foreground/60">No pricing added yet</p>
          <p className="text-foreground/40 text-sm mt-1">
            Add project types with prices — AI will use them in chat
          </p>
        </GlassPanel>
      ) : (
        <div className="space-y-3">
          {pricing.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassPanel className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center">
                    <IndianRupee size={20} className="text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{item.projectName}</p>
                      {!item.active && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-foreground/10 text-foreground/40">
                          Inactive
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-foreground/40 text-sm">{item.description}</p>
                    )}
                    <div className="flex gap-3 mt-1.5 text-sm">
                      <span className="text-primary font-medium">
                        Total: {formatCurrencyFull(item.totalPrice, item.billingType)}
                      </span>
                      <span className="text-gold">
                        Advance: {formatCurrencyFull(item.advancePrice, item.billingType)}
                      </span>
                      <span className="text-secondary">
                        Pending: {formatCurrencyFull(item.totalPrice - item.advancePrice, item.billingType)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      item.active
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-foreground/5 text-foreground/40 border border-foreground/10"
                    }`}
                  >
                    {item.active ? "Active" : "Inactive"}
                  </button>
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 rounded-lg hover:bg-white/5 text-foreground/40 hover:text-primary transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteId(item.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-foreground/40 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Pricing"
        message="Are you sure you want to delete this pricing item?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={isDeleting}
      />
    </div>
  );
}
