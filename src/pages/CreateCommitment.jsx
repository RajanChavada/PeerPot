import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Coins, Calendar, FileText, Tag, ArrowLeft, Loader2, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { unifold } from "@/adapters/unifold";
import { sendMockSolanaTransaction } from "@/lib/solanaMock";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import CategoryBadge from "@/components/commitments/CategoryBadge";

const CATEGORIES = ["Career", "Fitness", "Learning", "Creative", "Health", "Social", "Finance", "Other"];
const QUICK_STAKES = [10, 25, 50, 100];

export default function CreateCommitment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Career",
    stake_amount: 25,
    deadline: "",
  });
  const [showCustomDate, setShowCustomDate] = useState(false);

  const setDeadlinePreset = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    // Format to YYYY-MM-DDThh:mm
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzoffset)).toISOString().slice(0, 16);
    update("deadline", localISOTime);
    setShowCustomDate(false);
  };

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.deadline || !form.stake_amount) return;
    setLoading(true);
    try {
      const deadlineDate = new Date(form.deadline);

      await base44.entities.Commitment.create({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        stake_amount: Number(form.stake_amount),
        deadline: deadlineDate.toISOString(),
        status: "active",
        creator_name: user?.full_name || user?.email || "You",
        backers: [],
        pool_total: Number(form.stake_amount),
        back_total: 0,
        doubt_total: 0,
      });

      const depositResult = await unifold.deposit(user?.id || "anonymous", Number(form.stake_amount));
      const solanaSignature = await sendMockSolanaTransaction();
      
      toast({ 
        title: "Commitment staked!", 
        description: (
          <div className="flex flex-col gap-1 mt-1">
            <span>Your goal is live!</span>
            <a 
              href={depositResult.mocked ? "#" : `https://dashboard.unifold.io`} 
              target="_blank" 
              rel="noreferrer"
              className="text-amber-500 underline text-xs font-bold flex items-center gap-1"
            >
              Unifold Ref: {depositResult.ref}
            </a>
            <a 
              href={`https://explorer.solana.com/tx/${solanaSignature}?cluster=devnet`} 
              target="_blank" 
              rel="noreferrer"
              className="text-amber-500 underline text-xs font-bold flex items-center gap-1"
            >
              Solana Tx: {solanaSignature.substring(0, 16)}...
            </a>
          </div>
        )
      });
      navigate("/feed");
    } catch (err) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white mb-6 transition-all duration-300"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter">
          Stake on a goal
        </h1>
        <p className="text-slate-500 mt-2 mb-8 text-lg font-medium">
           Put your money where your mouth is. Friends back you or doubt you.
        </p>

        {/* Visibility banner */}
        <div className="flex items-center gap-3 rounded-2xl px-5 py-4 mb-8 text-sm font-medium glass-panel border-sky-200 text-sky-700 shadow-[0_0_20px_rgba(14,165,233,0.1)]">
          <Globe className="w-5 h-5 shrink-0 text-sky-500" />
          <span>Posting to the <strong className="text-slate-800">public feed</strong> — anyone can see and back this goal.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-slate-500 text-xs mb-2">
              <FileText className="w-3.5 h-3.5 text-amber-500" /> What are you committing to?
            </Label>
            <Input
              placeholder="e.g. Ship 5 PRs, finish my homework, run a 5k..."
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              className="h-12 bg-white/60 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl focus-visible:ring-amber-500 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold uppercase tracking-widest text-slate-500 text-xs mb-2 block">Description (optional)</Label>
            <Textarea
              placeholder="What does success look like? Add any context your friends should know."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className="bg-white/60 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl focus-visible:ring-amber-500 resize-none pt-3"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-slate-500 text-xs mb-2">
              <Tag className="w-3.5 h-3.5 text-amber-500" /> Category
            </Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => update("category", cat)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 border ${
                    form.category === cat
                      ? "bg-amber-500 text-white border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                      : "bg-white/50 text-slate-500 border-slate-200 hover:bg-white/80 hover:text-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-slate-500 text-xs mb-2">
                <Coins className="w-3.5 h-3.5 text-amber-500" /> Stake (USDC SPL)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  value={form.stake_amount}
                  onChange={(e) => update("stake_amount", e.target.value)}
                  required
                  className="pr-12 text-lg font-black h-12 bg-white/60 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl focus-visible:ring-amber-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold uppercase">
                  USDC
                </span>
              </div>
              <div className="flex gap-2 pt-2">
                {QUICK_STAKES.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => update("stake_amount", amt)}
                    className="flex-1 rounded-lg py-1.5 text-xs font-bold bg-white/50 border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800 transition-all shadow-sm"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 font-bold uppercase tracking-widest text-slate-500 text-xs mb-2">
                <Calendar className="w-3.5 h-3.5 text-amber-500" /> Deadline
              </Label>
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setDeadlinePreset(1)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all shadow-sm ${
                    !showCustomDate && form.deadline && Math.abs(new Date(form.deadline) - new Date(Date.now() + 86400000)) < 3600000
                      ? "bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)] border-transparent"
                      : "bg-white/50 border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800"
                  }`}
                >
                  24h
                </button>
                <button
                  type="button"
                  onClick={() => setDeadlinePreset(3)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all shadow-sm ${
                    !showCustomDate && form.deadline && Math.abs(new Date(form.deadline) - new Date(Date.now() + 3 * 86400000)) < 3600000
                      ? "bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)] border-transparent"
                      : "bg-white/50 border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800"
                  }`}
                >
                  3d
                </button>
                <button
                  type="button"
                  onClick={() => setDeadlinePreset(7)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all shadow-sm ${
                    !showCustomDate && form.deadline && Math.abs(new Date(form.deadline) - new Date(Date.now() + 7 * 86400000)) < 3600000
                      ? "bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)] border-transparent"
                      : "bg-white/50 border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800"
                  }`}
                >
                  1w
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomDate(true)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all shadow-sm ${
                    showCustomDate
                      ? "bg-slate-800 text-white border-transparent"
                      : "bg-white/50 border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800"
                  }`}
                >
                  Custom
                </button>
              </div>

              {showCustomDate ? (
                <Input
                  type="datetime-local"
                  value={form.deadline}
                  onChange={(e) => update("deadline", e.target.value)}
                  required
                  min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                  className="h-12 bg-white/60 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl focus-visible:ring-amber-500"
                />
              ) : (
                <div className="h-12 bg-white/60 border border-slate-200 rounded-xl flex items-center px-4">
                  {form.deadline ? (
                    <span className="text-slate-800 font-medium">
                      {new Date(form.deadline).toLocaleString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </span>
                  ) : (
                    <span className="text-slate-500">Select a deadline above</span>
                  )}
                </div>
              )}
              <p className="text-xs font-medium text-slate-500 pt-1">
                Pick the exact due date & time. Stake goes to the pool if you miss it.
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-3xl glass-panel p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <CategoryBadge category={form.category} />
                <span className="flex items-center gap-1.5 font-black text-amber-500 text-lg">
                  <Coins className="w-4 h-4" />
                  {form.stake_amount || 0} <span className="text-xs text-slate-500 font-bold uppercase">USDC</span>
                </span>
              </div>
              <p className="font-bold text-lg leading-snug text-slate-800 mb-2 line-clamp-1">
                {form.title || "Your commitment title"}
              </p>
              <p className="text-sm text-slate-500 font-medium line-clamp-2">
                {form.description || "Description preview..."}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border-0 rounded-xl"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing Deposit...</>
            ) : (
              <>Stake {form.stake_amount || 0} USDC & commit</>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}