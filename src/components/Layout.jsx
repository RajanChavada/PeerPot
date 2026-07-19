import React from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Target, Home as HomeIcon, Plus, Trophy, LogOut, Lock, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/create", label: "New Bet", icon: Plus },
  { to: "/feed", label: "Feed", icon: Compass },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex fixed top-6 bottom-6 left-6 w-64 flex-col rounded-3xl glass-panel z-50 overflow-hidden">
        <div className="flex items-center justify-between px-6 h-24 border-b border-white/50">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Target className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">PeerPot</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-white text-slate-800 shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-6 border-t border-white/50 bg-white/30">
          <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl glass-panel relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)] z-10">
              <span className="text-[10px] text-white font-bold tracking-tighter">SOL</span>
            </div>
            <div className="z-10">
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-0.5">Network</p>
              <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-emerald-600 bg-clip-text text-transparent">Solana Devnet</span>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-sm font-bold shadow-[0_0_10px_rgba(139,92,246,0.3)] border border-white/50">
              {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {user?.full_name || "You"}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-500 hover:text-slate-900 hover:bg-white/50 mt-2"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between h-16 px-4 glass-panel border-b-0 rounded-b-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.3)]">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800 tracking-tight">PeerPot</span>
        </div>
        <Button asChild size="sm" className="bg-white hover:bg-white/90 text-slate-800 border border-slate-200 shadow-sm">
          <Link to="/create">
            <Plus className="w-4 h-4 mr-1" /> New
          </Link>
        </Button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-4 inset-x-4 z-40 flex items-center justify-around h-16 glass-panel rounded-2xl">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors",
                isActive ? "text-amber-400" : "text-slate-400"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Main */}
      <main className="md:pl-72 md:pr-8 py-8 md:py-10 pb-24 md:pb-10 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}