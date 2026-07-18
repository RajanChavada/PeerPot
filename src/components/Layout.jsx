import React from "react";
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Target, Home as HomeIcon, Plus, Trophy, LogOut, Lock, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Home", icon: HomeIcon, end: true },
  { to: "/private", label: "Private", icon: Lock },
  { to: "/create", label: "New Bet", icon: Plus },
  { to: "/feed", label: "Feed", icon: Compass },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Target className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-slate-900 tracking-tight">StakeOnIt</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-600 hover:bg-slate-100"
                )
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
              {(user?.full_name || user?.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.full_name || "You"}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-500 mt-1"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-slate-900 tracking-tight">StakeOnIt</span>
        </Link>
        <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
          <Link to="/create">
            <Plus className="w-4 h-4 mr-1" /> New
          </Link>
        </Button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center justify-around h-14 bg-white border-t border-slate-200">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-0.5 text-xs",
                isActive ? "text-slate-900" : "text-slate-400"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Main */}
      <main className="md:pl-64 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}