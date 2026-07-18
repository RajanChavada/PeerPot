import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Coins, Clock, TrendingUp, TrendingDown, Users } from "lucide-react";
import CategoryBadge from "./CategoryBadge";
import StatusBadge from "./StatusBadge";
import { formatDeadline, isUrgent } from "@/utils/commitments";

export default function CommitmentCard({ commitment }) {
  const urgent = isUrgent(commitment.deadline);
  const backersCount = (commitment.backers || []).length;
  const backTotal = commitment.back_total || 0;
  const doubtTotal = commitment.doubt_total || 0;
  const tint =
    backTotal > doubtTotal
      ? "bg-emerald-50/60 ring-emerald-200/60 hover:ring-emerald-300"
      : doubtTotal > backTotal
        ? "bg-rose-50/60 ring-rose-200/60 hover:ring-rose-300"
        : "bg-white ring-slate-200/70 hover:ring-primary/60";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        to={`/commitment/${commitment.id}`}
        className={`block rounded-2xl ring-1 shadow-sm hover:shadow-md hover:ring-2 transition-all overflow-hidden ${tint}`}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryBadge category={commitment.category} />
              <StatusBadge status={commitment.status} />
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-slate-900 font-semibold">
                <Coins className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-sm">{commitment.stake_amount}</span>
                <span className="text-xs text-slate-400 font-normal">USDC</span>
              </div>
            </div>
          </div>

          <h3 className="text-base font-semibold text-slate-900 leading-snug mb-1.5 line-clamp-2">
            {commitment.title}
          </h3>
          {commitment.description && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-4">
              {commitment.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className={`w-3.5 h-3.5 ${urgent ? "text-rose-500" : "text-slate-400"}`} />
                {formatDeadline(commitment.deadline)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {backersCount}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1 text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                {commitment.back_total || 0}
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <TrendingDown className="w-3.5 h-3.5" />
                {commitment.doubt_total || 0}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}