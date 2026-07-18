import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Coins, TrendingUp, Loader2, Globe, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export default function Leaderboard() {
  const { user } = useAuth();
  const [scope, setScope] = useState("public"); // "public" | session id

  const { data: commitments = [], isLoading } = useQuery({
    queryKey: ["commitments-leaderboard"],
    queryFn: () => base44.entities.Commitment.list("-created_date", 200),
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => base44.entities.Session.list("-created_date", 50),
  });

  const mySessions = sessions.filter((s) => {
    const isHost = s.created_by_id === user?.id;
    const isMember = (s.members || []).some((m) => m.user_id === user?.id);
    return isHost || isMember;
  });

  const scoped = commitments.filter((c) =>
    scope === "public" ? !c.session_id : c.session_id === scope
  );

  // Build scoreboard from backers
  const scoreboard = {};
  scoped.forEach((c) => {
    (c.backers || []).forEach((b) => {
      if (!scoreboard[b.name]) scoreboard[b.name] = { name: b.name, back: 0, doubt: 0, count: 0 };
      scoreboard[b.name][b.side] += b.amount;
      scoreboard[b.name].count += 1;
    });
  });

  // Factor in resolution: backers win on success, doubters win on fail
  const winnings = {};
  scoped.forEach((c) => {
    if (c.status !== "succeeded" && c.status !== "failed") return;
    const pool = c.pool_total || c.stake_amount || 0;
    const backers = (c.backers || []).filter((b) => b.side === "back");
    const doubters = (c.backers || []).filter((b) => b.side === "doubt");
    const winners = c.status === "succeeded" ? backers : doubters;
    const losers = c.status === "succeeded" ? doubters : backers;
    const winnerTotal = winners.reduce((s, b) => s + b.amount, 0);
    const loserPool = losers.reduce((s, b) => s + b.amount, 0) + (c.status === "failed" ? c.stake_amount : 0);
    winners.forEach((b) => {
      winnings[b.name] = (winnings[b.name] || 0) + (winnerTotal > 0 ? (b.amount / winnerTotal) * loserPool : 0);
    });
    losers.forEach((b) => {
      winnings[b.name] = (winnings[b.name] || 0) - b.amount;
    });
  });

  const rows = Object.values(scoreboard).map((s) => ({
    ...s,
    net: (winnings[s.name] || 0),
  }));
  rows.sort((a, b) => b.net - a.net || b.count - a.count);

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-10">
      <div className="flex items-center gap-2 mb-1">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Leaderboard</h1>
      </div>
      <p className="text-slate-500 mb-5">Top predictors across resolved commitments.</p>

      {/* Scope tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setScope("public")}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
            scope === "public"
              ? "bg-primary text-primary-foreground ring-primary"
              : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Public feed
        </button>
        {mySessions.map((s) => (
          <button
            key={s.id}
            onClick={() => setScope(s.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
              scope === s.id
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> {s.title}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No predictions resolved yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((row, i) => (
            <motion.div
              key={row.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`flex items-center gap-4 rounded-2xl px-5 py-4 ring-1 ${
                i === 0
                  ? "bg-amber-50 ring-amber-200"
                  : "bg-white ring-slate-200/70"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i === 0 ? "bg-amber-400 text-white" :
                i === 1 ? "bg-slate-300 text-slate-700" :
                i === 2 ? "bg-orange-300 text-white" :
                "bg-slate-100 text-slate-500"
              }`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{row.name}</p>
                <p className="text-xs text-slate-500">
                  {row.count} predictions · {row.back} backed · {row.doubt} doubted
                </p>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${row.net >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                  {row.net >= 0 ? "+" : ""}{row.net.toFixed(1)} USDC
                </p>
                <p className="text-xs text-slate-400">net P/L</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-slate-50 ring-1 ring-slate-200/70 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Coins className="w-4 h-4 text-amber-500" />
          <h3 className="font-semibold text-slate-900 text-sm">How scoring works</h3>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">
          When a commitment succeeds, backers split the doubters' stakes. When it fails,
          doubters split the pool (including the creator's original stake). Net P/L tracks
          winnings minus losses across resolved commitments.
        </p>
      </div>
    </div>
  );
}