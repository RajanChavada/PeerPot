import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Coins, Calendar, FileText, Tag, ArrowLeft, Loader2, Globe, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
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
  const sessionId = new URLSearchParams(window.location.search).get("session");
  const [loading, setLoading] = useState(false);

  const { data: session } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => base44.entities.Session.get(sessionId),
    enabled: !!sessionId,
  });
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Career",
    stake_amount: 25,
    deadline: "",
  });

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
        session_id: sessionId || "",
      });
      toast({ title: "Commitment staked!", description: "Your goal is live. Go make it happen." });
      navigate(sessionId ? `/session/${sessionId}` : "/feed");
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
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Stake on a goal
        </h1>
        <p className="text-slate-500 mt-1 mb-6">
           Put your money where your mouth is. Friends back you or doubt you.
        </p>

        {/* Visibility banner */}
        <div
          className={`flex items-center gap-2.5 rounded-xl px-4 py-3 mb-8 text-sm ${
            sessionId
              ? "bg-violet-50 text-violet-800 ring-1 ring-violet-200"
              : "bg-sky-50 text-sky-800 ring-1 ring-sky-200"
          }`}
        >
          {sessionId ? (
            <>
              <Lock className="w-4 h-4 shrink-0" />
              <span>
                Posting to private session
                {session?.title ? <strong> “{session.title}”</strong> : null}. Only session members will see this.
              </span>
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 shrink-0" />
              <span>Posting to the <strong>public feed</strong> — anyone can see and back this goal.</span>
            </>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> What are you committing to?
            </Label>
            <Input
              placeholder="e.g. Ship 5 PRs, finish my homework, run a 5k..."
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="What does success look like? Add any context your friends should know."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
            </Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => update("category", cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-all ${
                    form.category === cat
                      ? "bg-emerald-700 text-white ring-emerald-700"
                      : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-500" /> Stake (USDC)
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  value={form.stake_amount}
                  onChange={(e) => update("stake_amount", e.target.value)}
                  required
                  className="pr-12 text-base font-semibold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                  USDC
                </span>
              </div>
              <div className="flex gap-1.5 pt-1">
                {QUICK_STAKES.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => update("stake_amount", amt)}
                    className="flex-1 rounded-lg py-1 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Deadline
              </Label>
              <Input
                type="datetime-local"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
                required
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                className="text-base"
              />
              <p className="text-xs text-slate-400 pt-1">
                Pick the exact due date & time. Stake goes to the pool if you miss it.
              </p>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-2xl bg-slate-50 ring-1 ring-slate-200/70 p-5">
            <div className="flex items-center justify-between mb-2">
              <CategoryBadge category={form.category} />
              <span className="flex items-center gap-1 font-semibold text-slate-900">
                <Coins className="w-4 h-4 text-amber-500" />
                {form.stake_amount || 0} <span className="text-xs text-slate-400 font-normal">USDC</span>
              </span>
            </div>
            <p className="font-medium leading-snug text-slate-900">
              {form.title || "Your commitment title"}
            </p>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
              {form.description || "Description preview..."}
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Staking...</>
            ) : (
              <>Stake {form.stake_amount || 0} USDC & commit</>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}