import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Coins, Clock, Users, TrendingUp, TrendingDown,
  CheckCircle2, XCircle, Loader2, Shield, Flame, Globe
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { sendMockSolanaTransaction } from "@/lib/solanaMock";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import CategoryBadge from "@/components/commitments/CategoryBadge";
import StatusBadge from "@/components/commitments/StatusBadge";
import BlobVisualization from "@/components/commitments/BlobVisualization";
import { formatDeadline, daysRemaining, isUrgent } from "@/utils/commitments";

export default function CommitmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [commitment, setCommitment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(10);

  const load = async () => {
    try {
      const data = await base44.entities.Commitment.get(id);
      setCommitment(data);
    } catch {
      setCommitment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleStake = async (side) => {
    if (!name.trim() || !amount) return;
    setActionLoading(side);
    try {
      const signature = await sendMockSolanaTransaction();
      
      const backer = {
        name: name.trim(),
        amount: Number(amount),
        side,
        signature,
        created_date: new Date().toISOString(),
      };
      const backers = [...(commitment.backers || []), backer];
      const updates = {
        backers,
        back_total: side === "back" ? (commitment.back_total || 0) + Number(amount) : commitment.back_total || 0,
        doubt_total: side === "doubt" ? (commitment.doubt_total || 0) + Number(amount) : commitment.doubt_total || 0,
        pool_total: (commitment.pool_total || commitment.stake_amount || 0) + Number(amount),
      };
      const updated = await base44.entities.Commitment.update(commitment.id, updates);
      setCommitment(updated);
      setAmount(10);
      
      toast({
        title: `Staked on Solana!`,
        description: `Successfully backed ${side}. Signature: ${signature.substring(0, 8)}...`,
      });
    } catch (err) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const resolve = async (success) => {
    setActionLoading(success ? "succeed" : "fail");
    try {
      const signature = await sendMockSolanaTransaction();
      const updated = await base44.entities.Commitment.update(commitment.id, {
        status: success ? "succeeded" : "failed",
        settlement_signature: signature,
      });
      setCommitment(updated);
      toast({
        title: success ? "Goal achieved! 🎉" : "Goal missed 💀",
        description: success
          ? `Payout settled on Solana. Signature: ${signature.substring(0, 8)}...`
          : `Pool settled on Solana. Signature: ${signature.substring(0, 8)}...`,
      });
    } catch (err) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!commitment) {
    return (
      <div className="text-center py-32">
        <p className="text-slate-500">Commitment not found.</p>
        <Button variant="link" onClick={() => navigate("/")}>Back to feed</Button>
      </div>
    );
  }

  const urgent = isUrgent(commitment.deadline);
  const days = daysRemaining(commitment.deadline);
  const isActive = commitment.status === "active";
  const backers = commitment.backers || [];
  const totalPool = commitment.pool_total || commitment.stake_amount || 0;
  const backTotal = commitment.back_total || 0;
  const doubtTotal = commitment.doubt_total || 0;
  const { user } = useAuth();
  const isCreator = user?.id === commitment.created_by_id;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-3">
          <CategoryBadge category={commitment.category} />
          <StatusBadge status={commitment.status} />
          {commitment.settlement_signature && (
            <a
              href={`https://explorer.solana.com/tx/${commitment.settlement_signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline"
            >
              View settlement on Solana ↗
            </a>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
          {commitment.title}
        </h1>
        {commitment.description && (
          <p className="text-slate-600 mt-3 leading-relaxed">{commitment.description}</p>
        )}

        <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-semibold">
            {(commitment.creator_name || "U").charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-slate-700">{commitment.creator_name || "Anonymous"}</span>
          <span>·</span>
          <span className={`flex items-center gap-1 ${urgent ? "text-rose-500 font-medium" : ""}`}>
            <Clock className="w-3.5 h-3.5" />
            {formatDeadline(commitment.deadline)}
            {isActive && days > 0 && ` (${days}d left)`}
          </span>
        </div>
      </motion.div>

      {/* Visualization + pool */}
      <div className="mt-6 rounded-2xl bg-[#0a0e14] p-6 md:p-8 text-white overflow-hidden shadow-xl shadow-amber-500/5">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-slate-400 uppercase font-semibold tracking-widest">The Pot</span>
          {isActive && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
            </span>
          )}
        </div>

        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center gap-2 font-bold text-6xl md:text-7xl text-amber-400 drop-shadow-xl tracking-tight">
            <Coins className="w-10 h-10 md:w-14 md:h-14 opacity-90" />
            {totalPool} <span className="text-2xl md:text-3xl text-slate-400 font-normal mt-4 md:mt-6">USDC</span>
          </div>
        </div>

        <BlobVisualization
          pool={totalPool}
          back={backTotal}
          doubt={doubtTotal}
          title={commitment.title}
        />

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3 mt-2">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Escrow</p>
            <p className="text-lg font-bold text-white flex items-center justify-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              {commitment.stake_amount}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Backing</p>
            <p className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {backTotal}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-1">Doubt</p>
            <p className="text-lg font-bold text-rose-400 flex items-center justify-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              {doubtTotal}
            </p>
          </div>
        </div>
      </div>

      {/* Back / Doubt actions */}
      {isActive && (
        <div className="mt-6 rounded-2xl bg-white ring-1 ring-slate-200/70 p-5 md:p-6 shadow-sm">
          {isCreator ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">This is your commitment</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">You cannot back or doubt your own goal. Share this page to get your friends to stake on you.</p>
              <Button onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({ title: "Link copied!" });
              }} className="bg-primary hover:bg-primary/90">
                Share Link
              </Button>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-slate-900 mb-1">Take a side</h3>
              <p className="text-sm text-slate-500 mb-4">
                Back them to succeed, or doubt them to fail. If they fail, doubters split the pool.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <Label className="text-xs text-slate-500">Your name</Label>
                  <Input
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Amount (USDC SPL)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleStake("back")}
                  disabled={!name.trim() || !amount || actionLoading === "back"}
                  className="bg-emerald-600 hover:bg-emerald-700 h-11"
                >
                  {actionLoading === "back" ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4 mr-1.5" />
                  )}
                  {actionLoading === "back" ? "Confirming..." : "Back them"}
                </Button>
                <Button
                  onClick={() => handleStake("doubt")}
                  disabled={!name.trim() || !amount || actionLoading === "doubt"}
                  variant="outline"
                  className="h-11 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  {actionLoading === "doubt" ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1.5" />
                  )}
                  {actionLoading === "doubt" ? "Confirming..." : "Doubt them"}
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Resolve actions (simplified — in real app, creator resolves) */}
      {isActive && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Creator: resolve outcome
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => resolve(true)}
            disabled={!!actionLoading}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" /> Succeeded
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => resolve(false)}
            disabled={!!actionLoading}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <XCircle className="w-4 h-4 mr-1" /> Failed
          </Button>
        </div>
      )}

      {/* Backers list */}
      <div className="mt-8">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          Backers & Doubters
          <span className="text-sm text-slate-400 font-normal">({backers.length})</span>
        </h3>
        {backers.length === 0 ? (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 py-10 text-center">
            <Flame className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No one has backed or doubted this yet.</p>
            <p className="text-xs text-slate-400 mt-0.5">Be the first to take a side.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backers.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between rounded-xl bg-white ring-1 ring-slate-200/70 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold ${
                    b.side === "back"
                      ? "bg-gradient-to-br from-emerald-400 to-teal-500"
                      : "bg-gradient-to-br from-rose-400 to-pink-500"
                  }`}>
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{b.name}</p>
                    <p className="text-xs text-slate-400">
                      {b.side === "back" ? "Backed" : "Doubted"} · {formatDeadline(b.created_date)}
                    </p>
                    {b.signature && (
                      <a 
                        href={`https://explorer.solana.com/tx/${b.signature}?cluster=devnet`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-mono text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        Tx: {b.signature.substring(0, 12)}...
                      </a>
                    )}
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  b.side === "back" ? "text-emerald-600" : "text-rose-500"
                }`}>
                  {b.side === "back" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {b.amount} USDC
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}