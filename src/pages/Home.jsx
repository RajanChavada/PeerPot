import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Target, TrendingUp, Coins, Users, Flame, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CommitmentCard from "@/components/commitments/CommitmentCard";

const CATEGORIES = ["Career", "Fitness", "Learning", "Creative", "Health", "Social", "Finance", "Other"];

export default function Home() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: commitments = [], isLoading } = useQuery({
    queryKey: ["commitments"],
    queryFn: () => base44.entities.Commitment.list("-created_date", 50),
  });

  const visible = commitments.filter((c) => {
    if (c.session_id) return false; // exclude private session goals
    if (filter === "active" && c.status !== "active") return false;
    if (filter === "resolved" && c.status !== "succeeded" && c.status !== "failed") return false;
    if (category !== "all" && c.category !== category) return false;
    if (search.trim() && !c.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  const publicCommitments = commitments.filter((c) => !c.session_id);
  const totalStaked = publicCommitments.reduce((sum, c) => sum + (c.pool_total || c.stake_amount || 0), 0);
  const activeCount = publicCommitments.filter((c) => c.status === "active").length;
  const totalBackers = publicCommitments.reduce((sum, c) => sum + (c.backers || []).length, 0);

  const stats = [
    { label: "Total Staked", value: totalStaked.toLocaleString(), unit: "USDC", icon: Coins, color: "text-amber-500" },
    { label: "Active Goals", value: activeCount, icon: Target, color: "text-violet-500" },
    { label: "Backers", value: totalBackers, icon: Users, color: "text-blue-500" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Public Feed
          </h1>
          <p className="text-slate-500 mt-1">Browse public commitments from the community. Stake on yourself — friends back you or doubt you.</p>
        </div>
        <Button asChild className="hidden md:flex bg-primary hover:bg-primary/90">
          <Link to="/create">
            <Plus className="w-4 h-4 mr-1.5" /> New Commitment
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-4 md:p-5">
            <s.icon className={`w-4 h-4 mb-2 ${s.color}`} />
            <div className="flex items-baseline gap-1">
              <span className="text-xl md:text-2xl font-bold text-slate-900">{s.value}</span>
              {s.unit && <span className="text-xs text-slate-400">{s.unit}</span>}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-slate-200">
        {[
          { key: "all", label: "All" },
          { key: "active", label: "🔥 Active" },
          { key: "resolved", label: "Resolved" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              filter === tab.key
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + category filter */}
      <div className="space-y-3 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search goals by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === "all"
                ? "bg-emerald-700 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-emerald-700 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-white ring-1 ring-slate-200/70 animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Flame className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">No commitments yet</h3>
          <p className="text-sm text-slate-500 mb-6">Be the first to stake on a goal.</p>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/create">
              <Plus className="w-4 h-4 mr-1.5" /> Create a commitment
            </Link>
          </Button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((c) => (
            <CommitmentCard key={c.id} commitment={c} />
          ))}
        </motion.div>
      )}
    </div>
  );
}