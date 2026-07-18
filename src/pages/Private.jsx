import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock, Plus, LogIn, Users, Loader2, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function Private() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState("join");
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [form, setForm] = useState({ title: "", description: "" });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => base44.entities.Session.list("-created_date", 50),
  });

  const mySessions = sessions.filter((s) => {
    const isHost = s.created_by_id === user?.id;
    const isMember = (s.members || []).some((m) => m.user_id === user?.id);
    return isHost || isMember;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setCreateLoading(true);
    try {
      const code = genCode();
      const me = {
        name: user?.full_name || user?.email || "Host",
        user_id: user?.id,
        joined_date: new Date().toISOString(),
      };
      const session = await base44.entities.Session.create({
        title: form.title.trim(),
        description: form.description.trim(),
        join_code: code,
        status: "active",
        host_name: user?.full_name || user?.email || "You",
        members: [me],
      });
      toast({ title: "Session created!", description: `Share code ${code} with friends.` });
      setForm({ title: "", description: "" });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      navigate(`/session/${session.id}`);
    } catch (err) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinLoading(true);
    try {
      const found = await base44.entities.Session.filter({ join_code: joinCode.trim().toUpperCase() });
      if (!found || found.length === 0) {
        toast({ title: "No session found", description: "Check the code with your friend.", variant: "destructive" });
        return;
      }
      const session = found[0];
      const members = session.members || [];
      const already = members.some((m) => m.user_id === user?.id);
      if (!already) {
        members.push({
          name: user?.full_name || user?.email || "Friend",
          user_id: user?.id,
          joined_date: new Date().toISOString(),
        });
        await base44.entities.Session.update(session.id, { members });
      }
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      navigate(`/session/${session.id}`);
    } catch (err) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-10">
      <div className="flex items-center gap-2 mb-1">
        <Lock className="w-5 h-5 text-slate-900" />
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Private Markets</h1>
      </div>
      <p className="text-slate-500 mb-8">Your home for private goal sessions with friends. Host a room, share the code, and keep bets between your crew.</p>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-slate-200">
        {[
          { key: "join", label: "Join", icon: LogIn },
          { key: "create", label: "Host a session", icon: Plus },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              mode === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {mode === "join" ? (
        <form onSubmit={handleJoin} className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-5 md:p-6 mb-8">
          <Label className="text-xs text-slate-500">Join code</Label>
          <Input
            placeholder="Enter 6-letter code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="mt-1 text-base uppercase tracking-widest"
            maxLength={6}
          />
          <Button type="submit" disabled={joinLoading} className="w-full mt-4 h-11 bg-primary hover:bg-primary/90">
            {joinLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogIn className="w-4 h-4 mr-1.5" />}
            Join session
          </Button>
        </form>
      ) : (
        <form onSubmit={handleCreate} className="rounded-2xl bg-white ring-1 ring-slate-200/70 p-5 md:p-6 mb-8 space-y-4">
          <div className="space-y-2">
            <Label>Session name</Label>
            <Input
              placeholder="e.g. Apartment 4B goals, Squad Q3 bets..."
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="What's this group about?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
            />
          </div>
          <Button type="submit" disabled={createLoading} className="w-full h-11 bg-primary hover:bg-primary/90">
            {createLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-1.5" />}
            Create private session
          </Button>
        </form>
      )}

      {/* My sessions */}
      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <Users className="w-4 h-4 text-slate-400" /> Your sessions
      </h3>
      {isLoading ? (
        <div className="h-20 rounded-2xl bg-white ring-1 ring-slate-200/70 animate-pulse" />
      ) : mySessions.length === 0 ? (
        <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 py-10 text-center">
          <Lock className="w-6 h-6 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No private sessions yet.</p>
          <p className="text-xs text-slate-400 mt-0.5">Host one or join with a code.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mySessions.map((s) => {
            const isHost = s.created_by_id === user?.id;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link
                  to={`/session/${s.id}`}
                  className="flex items-center justify-between rounded-xl bg-white ring-1 ring-slate-200/70 px-4 py-3 hover:ring-primary/60 hover:ring-2 hover:shadow-md transition-all"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{s.title}</p>
                    <p className="text-xs text-slate-400">
                      {isHost ? "You're hosting" : `Host: ${s.host_name || "—"}`} · {(s.members || []).length} members
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-500 tracking-widest">{s.join_code}</span>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}