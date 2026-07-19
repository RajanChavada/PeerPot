import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coins, Clock, TrendingUp, TrendingDown, Users, Globe, Wallet } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import StatusBadge from "./StatusBadge";
import BlobVisualization from "./BlobVisualization";
import { formatDeadline, isUrgent } from "@/utils/commitments";

export default function CommitmentCard({ commitment }) {
  const urgent = isUrgent(commitment.deadline);
  const backersCount = (commitment.backers || []).length;
  const backTotal = commitment.back_total || 0;
  const doubtTotal = commitment.doubt_total || 0;
  const totalPool = commitment.pool_total || commitment.stake_amount || 0;
  const tint =
    backTotal > doubtTotal
      ? "bg-emerald-50/80 border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
      : doubtTotal > backTotal
        ? "bg-rose-50/80 border-rose-500/30 hover:border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.1)] hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]"
        : "glass-panel glass-panel-hover";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        to={`/commitment/${commitment.id}`}
        className={`block rounded-3xl transition-all duration-500 overflow-hidden ${tint} relative group`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="p-0 relative z-10">
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge category={commitment.category} />
                <StatusBadge status={commitment.status} />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 leading-snug mb-1.5 line-clamp-2">
              {commitment.title}
            </h3>
            {commitment.description && (
              <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                {commitment.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className={`w-4 h-4 ${urgent ? "text-rose-500" : "text-amber-500"}`} />
                {formatDeadline(commitment.deadline)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                {backersCount} {backersCount === 1 ? 'Backer' : 'Backers'}
              </span>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-md text-slate-800 p-5 pt-4 border-t border-slate-200">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">The Pot</span>
              <div className="flex items-center gap-1.5 font-black text-2xl text-amber-500">
                <Coins className="w-5 h-5" />
                {totalPool} <span className="text-xs text-slate-400 font-bold">USDC</span>
              </div>
            </div>
            
            <div className="w-full mb-4 pointer-events-none rounded-xl overflow-hidden ring-1 ring-slate-200 bg-white/50 shadow-inner">
              <BlobVisualization pool={totalPool} title={commitment.title} interactive={false} />
            </div>

            <div className="flex justify-between text-sm">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Escrow</span>
                <span className="font-semibold text-amber-500">{commitment.stake_amount}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Backing</span>
                <span className="font-semibold text-emerald-600 flex items-center"><TrendingUp className="w-3 h-3 mr-0.5"/>{backTotal}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Doubt</span>
                <span className="font-semibold text-rose-600 flex items-center"><TrendingDown className="w-3 h-3 mr-0.5"/>{doubtTotal}</span>
              </div>
            </div>

            {(commitment.settlement_signature || commitment.settlement_unifold_ref) && (
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-col gap-1.5 text-xs font-medium">
                <span className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">Settlement Tx</span>
                {commitment.settlement_unifold_ref && (
                  <span className="flex w-fit items-center gap-1.5 text-blue-600 font-mono text-[10px] bg-blue-50 px-2 py-1 rounded-md border border-blue-200">
                    <Wallet className="w-3.5 h-3.5 text-blue-500" />
                    Unifold: {commitment.settlement_unifold_ref.substring(0, 14)}...
                  </span>
                )}
                {commitment.settlement_signature && !commitment.settlement_signature.startsWith("pi_") && (
                  <span className="flex w-fit items-center gap-1.5 text-amber-600 font-mono text-[10px] bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    Solana: {commitment.settlement_signature.substring(0, 14)}...
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}