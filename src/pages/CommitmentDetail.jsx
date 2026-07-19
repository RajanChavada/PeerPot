import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Coins, Clock, Users, TrendingUp, TrendingDown,
  CheckCircle2, XCircle, Loader2, Shield, Flame, Globe, Wallet
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { unifold } from "@/adapters/unifold";
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
      const depositResult = await unifold.deposit(user?.id || "anonymous", Number(amount));
      
      const backer = {
        name: name.trim(),
        amount: Number(amount),
        side,
        signature: depositResult.ref,
        mocked: depositResult.mocked,
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
        title: depositResult.mocked ? `Staked (Mock Mode)` : `Staked via Unifold!`,
        description: (
          <div className="flex flex-col gap-1 mt-1">
            <span>Successfully backed {side}.</span>
            <a 
              href={depositResult.mocked ? "#" : `https://dashboard.unifold.io`} 
              target="_blank" 
              rel="noreferrer"
              className="text-amber-500 underline text-xs font-bold"
            >
              View Reference: {depositResult.ref}
            </a>
          </div>
        ),
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
      const depositResult = await unifold.deposit(user?.id || "anonymous", Number(commitment.pool_total || 1));
      const updated = await base44.entities.Commitment.update(commitment.id, {
        status: success ? "succeeded" : "failed",
        settlement_signature: depositResult.ref,
        settlement_mocked: depositResult.mocked,
      });
      setCommitment(updated);
      toast({
        title: success ? "Goal achieved! 🎉" : "Goal missed 💀",
        description: (
          <div className="flex flex-col gap-1 mt-1">
            <span>{success ? "Payout settled via Unifold." : "Pool settled via Unifold."}</span>
            <a 
              href={depositResult.mocked ? "#" : `https://dashboard.unifold.io`} 
              target="_blank" 
              rel="noreferrer"
              className="text-amber-500 underline text-xs font-bold"
            >
              View Reference: {depositResult.ref}
            </a>
          </div>
        ),
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
  const isExpired = new Date(commitment.deadline) < new Date();
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
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white mb-6 transition-all duration-300"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-3">
          <CategoryBadge category={commitment.category} />
          <StatusBadge status={commitment.status} />
          {commitment.settlement_signature && (
            commitment.settlement_signature.startsWith("mock") || commitment.settlement_signature.startsWith("pi_") || commitment.settlement_signature.startsWith("unifold") ? (
              <a
                href={commitment.settlement_mocked ? "#" : `https://dashboard.unifold.io`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-1"
              >
                <Wallet className="w-3 h-3" /> View settlement on Unifold ↗
              </a>
            ) : (
              <a
                href={`https://explorer.solana.com/tx/${commitment.settlement_signature}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline flex items-center gap-1"
              >
                <Globe className="w-3 h-3" /> View settlement on Solana ↗
              </a>
            )
          )}
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter leading-tight">
          {commitment.title}
        </h1>
        {commitment.description && (
          <p className="text-slate-500 mt-4 leading-relaxed text-lg max-w-2xl">{commitment.description}</p>
        )}

        <div className="flex items-center gap-3 mt-6 text-sm text-slate-500">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-xs font-bold shadow-[0_0_10px_rgba(139,92,246,0.3)]">
            {(commitment.creator_name || "U").charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-slate-800">{commitment.creator_name || "Anonymous"}</span>
          <span className="opacity-50">·</span>
          <span className={`flex items-center gap-1.5 font-semibold ${urgent ? "text-rose-500" : "text-amber-500"}`}>
            <Clock className="w-4 h-4" />
            {formatDeadline(commitment.deadline)}
            {isActive && days > 0 && ` (${days}d left)`}
          </span>
        </div>
      </motion.div>

      {/* Visualization + pool */}
      <div className="mt-8 rounded-3xl glass-panel p-6 md:p-8 text-slate-800 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs text-slate-500 uppercase font-semibold tracking-widest">The Pot</span>
          {isActive && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
            </span>
          )}
        </div>

        <div className="flex flex-col items-center justify-center mb-10 mt-4 relative z-10">
          <div className="flex items-center gap-3 font-black text-6xl md:text-8xl text-amber-500 drop-shadow-md tracking-tighter">
            <Coins className="w-12 h-12 md:w-16 md:h-16 opacity-90" />
            {totalPool} <span className="text-2xl md:text-4xl text-slate-400 font-bold mt-4 md:mt-8 tracking-wide">USDC</span>
          </div>
        </div>

        <BlobVisualization
          pool={totalPool}
          back={backTotal}
          doubt={doubtTotal}
          title={commitment.title}
        />

        <div className="grid grid-cols-3 gap-3 mt-4 relative z-10 bg-white/60 rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Escrow</p>
            <p className="text-xl font-black text-slate-800 flex items-center justify-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" />
              {commitment.stake_amount}
            </p>
          </div>
          <div className="text-center border-l border-slate-200">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Backing</p>
            <p className="text-xl font-black text-emerald-600 flex items-center justify-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              {backTotal}
            </p>
          </div>
          <div className="text-center border-l border-slate-200">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Doubt</p>
            <p className="text-xl font-black text-rose-600 flex items-center justify-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              {doubtTotal}
            </p>
          </div>
        </div>
      </div>

      {/* Back / Doubt actions */}
      {isActive && !isExpired && (
        <div className="mt-8 rounded-3xl glass-panel p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          {isCreator ? (
            <div className="text-center py-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-md">
                <Shield className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">This is your commitment</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8">You cannot back or doubt your own goal. Share this page to get your friends to stake on you.</p>
              <Button onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({ title: "Link copied!" });
              }} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md border-0 h-12 px-8 text-base font-bold rounded-xl">
                Share Link
              </Button>
            </div>
          ) : (
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Take a side</h3>
              <p className="text-slate-500 mb-6 font-medium">
                Back them to succeed, or doubt them to fail. If they fail, doubters split the pool.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Your name</Label>
                  <Input
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 bg-white/60 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl focus-visible:ring-amber-500"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Amount (USDC)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 bg-white/60 border-slate-200 text-slate-800 placeholder:text-slate-400 rounded-xl focus-visible:ring-amber-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleStake("back")}
                  disabled={!name.trim() || !amount || actionLoading === "back"}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 h-14 text-white font-bold text-base rounded-xl shadow-md border-0"
                >
                  {actionLoading === "back" ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <TrendingUp className="w-5 h-5 mr-2" />
                  )}
                  {actionLoading === "back" ? "Confirming..." : "Back them"}
                </Button>
                <Button
                  onClick={() => handleStake("doubt")}
                  disabled={!name.trim() || !amount || actionLoading === "doubt"}
                  className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 h-14 text-white font-bold text-base rounded-xl shadow-md border-0"
                >
                  {actionLoading === "doubt" ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <TrendingDown className="w-5 h-5 mr-2" />
                  )}
                  {actionLoading === "doubt" ? "Confirming..." : "Doubt them"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {isActive && isExpired && (
        <div className="mt-8 rounded-3xl glass-panel p-6 shadow-xl text-center">
          <Clock className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Time's Up!</h3>
          <p className="text-slate-500 font-medium">The deadline has passed. No more stakes can be placed.</p>
        </div>
      )}

      {/* Resolve actions */}
      {isActive && (
        <div className="mt-8 flex items-center justify-center gap-4 glass-panel p-4 rounded-2xl w-fit mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 pr-4 border-r border-slate-200">
            <Shield className="w-4 h-4 text-amber-500" /> Creator Action
          </span>
          <Button
            size="sm"
            onClick={() => resolve(true)}
            disabled={!!actionLoading}
            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 rounded-lg"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Succeeded
          </Button>
          <Button
            size="sm"
            onClick={() => resolve(false)}
            disabled={!!actionLoading}
            className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg"
          >
            <XCircle className="w-4 h-4 mr-1.5" /> Failed
          </Button>
        </div>
      )}

      {/* Backers list */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-500" />
          Backers & Doubters
          <span className="text-sm font-semibold text-slate-600 ml-2 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {backers.length}
          </span>
        </h3>
        {backers.length === 0 ? (
          <div className="glass-panel rounded-3xl py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-md">
              <Flame className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-lg font-bold text-slate-800 mb-1 tracking-tight">No activity yet</p>
            <p className="text-slate-500">Be the first to take a side.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backers.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl glass-panel px-5 py-4 border-l-4"
                style={{ borderLeftColor: b.side === "back" ? '#10b981' : '#f43f5e' }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md ${
                    b.side === "back"
                      ? "bg-gradient-to-br from-emerald-400 to-teal-500"
                      : "bg-gradient-to-br from-rose-400 to-pink-500"
                  }`}>
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-800">{b.name}</p>
                    <p className="text-sm text-slate-500 font-medium">
                      {b.side === "back" ? <span className="text-emerald-600">Backed</span> : <span className="text-rose-600">Doubted</span>} · {formatDeadline(b.created_date)}
                    </p>
                    {b.signature && (
                      <div className="flex gap-2">
                        {b.signature.startsWith("mock") || b.signature.startsWith("pi_") || b.signature.startsWith("unifold") ? (
                          <a 
                            href={b.mocked ? "#" : `https://dashboard.unifold.io`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-mono text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          >
                            <Wallet className="w-3.5 h-3.5 text-blue-500" />
                            Unifold: {b.signature.substring(0, 16)}...
                          </a>
                        ) : (
                          <a 
                            href={`https://explorer.solana.com/tx/${b.signature}?cluster=devnet`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[10px] font-mono text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          >
                            <Globe className="w-3.5 h-3.5 text-amber-500" />
                            Solana: {b.signature.substring(0, 16)}...
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-lg font-black ${
                  b.side === "back" ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {b.side === "back" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
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