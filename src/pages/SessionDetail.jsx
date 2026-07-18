import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft, Lock, Users, Plus, Copy, Check, Loader2, Flame, Crown,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import CommitmentCard from "@/components/commitments/CommitmentCard";

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState("");

  const { data: session, isLoading } = useQuery({
    queryKey: ["session", id],
    queryFn: () => base44.entities.Session.get(id),
  });

  const { data: commitments = [], isLoading: loadingGoals } = useQuery({
    queryKey: ["session-commitments", id],
    queryFn: () => base44.entities.Commitment.filter({ session_id: id }),
    enabled: !!session,
  });

  const isHost = session?.created_by_id === user?.id;

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
    toast({ title: `Copied ${label}` });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-32">
        <p className="text-slate-500">Session not found.</p>
        <Button variant="link" onClick={() => navigate("/private")}>Back to private markets</Button>
      </div>
    );
  }

  const shareLink = `${window.location.origin}/session/${session.id}`;
  const members = session.members || [];

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-10">
      <button
        onClick={() => navigate("/private")}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Private markets
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-200">
            <Lock className="w-3 h-3" /> Private
          </span>
          {isHost && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
              <Crown className="w-3 h-3" /> Host
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{session.title}</h1>
        {session.description && <p className="text-slate-600 mt-2">{session.description}</p>}
      </motion.div>

      {/* Share */}
      <div className="mt-6 rounded-2xl bg-slate-50 ring-1 ring-slate-200/70 p-5">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Invite friends</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">Join code</p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-bold tracking-widest text-slate-900">{session.join_code}</span>
              <button
                onClick={() => copy(session.join_code, "code")}
                className="rounded-md p-1.5 bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                aria-label="Copy code"
              >
                {copied === "code" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Share link</p>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-slate-600 truncate flex-1">{shareLink}</span>
              <button
                onClick={() => copy(shareLink, "link")}
                className="rounded-md p-1.5 bg-primary/15 text-primary hover:bg-primary/25 transition-colors shrink-0"
                aria-label="Copy link"
              >
                {copied === "link" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="mt-6">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" /> Members
          <span className="text-sm text-slate-400 font-normal">({members.length})</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {members.map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-full bg-white ring-1 ring-slate-200/70 pl-1.5 pr-3 py-1"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-semibold">
                {(m.name || "U").charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-medium text-slate-700">{m.name}</span>
              {m.user_id === session.created_by_id && <Crown className="w-3 h-3 text-amber-500" />}
            </div>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Goals in this session</h3>
          {isHost && (
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
              <Link to={`/create?session=${session.id}`}>
                <Plus className="w-4 h-4 mr-1.5" /> New goal
              </Link>
            </Button>
          )}
        </div>
        {loadingGoals ? (
          <div className="h-40 rounded-2xl bg-white ring-1 ring-slate-200/70 animate-pulse" />
        ) : commitments.length === 0 ? (
          <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 py-10 text-center">
            <Flame className="w-6 h-6 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No goals yet.</p>
            {isHost ? (
              <p className="text-xs text-slate-400 mt-0.5">Create the first goal for this session.</p>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">Waiting for {session.host_name || "the host"} to add a goal.</p>
            )}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commitments.map((c) => (
              <CommitmentCard key={c.id} commitment={c} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}