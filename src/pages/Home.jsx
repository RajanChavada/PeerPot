import React, { useState, useEffect } from "react";
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

  // Silently spawn recurring commitments on load
  useEffect(() => {
    base44.functions.invoke("spawn-recurring").catch((err) => {
      console.error("Failed to spawn recurring commitments:", err);
    });
  }, []);

  const visible = commitments.filter((c) => {
    if (filter === "active" && c.status !== "active") return false;
    if (filter === "resolved" && c.status !== "succeeded" && c.status !== "failed") return false;
    if (category !== "all" && c.category !== category) return false;
    if (search.trim() && !c.title.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });

  const publicCommitments = commitments;
  const totalStaked = publicCommitments.reduce((sum, c) => sum + (c.pool_total || c.stake_amount || 0), 0);
  const activeCount = publicCommitments.filter((c) => c.status === "active").length;
  const totalBackers = publicCommitments.reduce((sum, c) => sum + (c.backers || []).length, 0);

  const stats = [
    { label: "Total Staked", value: totalStaked.toLocaleString(), unit: "USDC (SPL)", icon: Coins, color: "text-amber-500" },
    { label: "Active Goals", value: activeCount, icon: Target, color: "text-violet-500" },
    { label: "Backers", value: totalBackers, icon: Users, color: "text-blue-500" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tighter mb-2">
            Public Feed
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-lg">Browse public commitments from the community. Stake on yourself — friends back you or doubt you.</p>
        </div>
        <Button asChild className="hidden md:flex bg-primary hover:bg-primary/90">
          <Link to="/create">
            <Plus className="w-4 h-4 mr-1.5" /> New Commitment
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
        {stats.map((s, idx) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel glass-panel-hover rounded-3xl p-5 md:p-6 relative overflow-hidden group"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 bg-current ${s.color}`} />
            <s.icon className={`w-5 h-5 mb-4 ${s.color} relative z-10`} />
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter">{s.value}</span>
              {s.unit && <span className="text-xs text-slate-500 font-semibold">{s.unit}</span>}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-2 relative z-10">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6 bg-white/50 p-1 rounded-2xl w-fit backdrop-blur-md border border-white/60">
        {[
          { key: "all", label: "All" },
          { key: "active", label: "🔥 Active" },
          { key: "resolved", label: "Resolved" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
              filter === tab.key
                ? "bg-white text-slate-800 shadow-md"
                : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-8 items-start md:items-center">
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search goals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 bg-white/60 border-white/50 text-slate-800 placeholder:text-slate-400 rounded-xl h-11 focus-visible:ring-amber-500"
          />
        </div>
        <div className="flex flex-wrap gap-2 flex-1">
          <button
            onClick={() => setCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              category === "all"
                ? "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] border-transparent"
                : "bg-white/50 text-slate-500 border border-white/60 hover:bg-white/80"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                category === cat
                  ? "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)] border-transparent"
                  : "bg-white/50 text-slate-500 border border-white/60 hover:bg-white/80 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[400px] rounded-3xl glass-panel animate-pulse opacity-50" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mx-auto mb-6 shadow-md">
            <Flame className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">No commitments yet</h3>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">The arena is empty. Be the first to stake on a goal and let the community back you.</p>
          <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg border-0">
            <Link to="/create">
              <Plus className="w-4 h-4 mr-1.5" /> Create a commitment
            </Link>
          </Button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((c) => (
            <CommitmentCard key={c.id} commitment={c} />
          ))}
        </motion.div>
      )}
    </div>
  );
}