import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Compass, Coins, Users, TrendingUp, ArrowRight, Target, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function Landing() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 md:py-16">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary ring-1 ring-primary/30 px-3 py-1 text-xs font-medium mb-5">
          <Target className="w-3.5 h-3.5" /> Stake on your goals
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
          Put your money
          <br />
          where your mouth is.
        </h1>
        <p className="text-slate-500 mt-4 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
          StakeOnIt lets you lock stablecoins behind any personal goal. Friends back you
          or doubt you — hit the goal and keep your stake, miss it and the doubters split the pool.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Button asChild size="lg" className="h-12 px-6 bg-primary hover:bg-primary/90">
            <Link to="/private">
              <Lock className="w-4 h-4 mr-2" /> Join / Host a session
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6">
            <Link to="/feed">
              <Compass className="w-4 h-4 mr-2" /> Explore commitments
            </Link>
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1.5">
          <ArrowRight className="w-3.5 h-3.5" /> Or{" "}
          <Link to="/create" className="text-primary font-medium hover:underline">
            create your own bet
          </Link>
        </p>
      </motion.div>

      {/* How it works */}
      <div className="mt-12 rounded-2xl bg-white/50 backdrop-blur-sm ring-1 ring-slate-200/70 p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-5 text-center">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { step: "1", title: "Commit", body: "Set a goal, a deadline, and a USDC stake." },
            { step: "2", title: "Rally", body: "Friends back you to win or doubt you to fail." },
            { step: "3", title: "Resolve", body: "Hit it — keep your stake. Miss it — doubters split the pool." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-3">
                {s.step}
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">{s.title}</h4>
              <p className="text-sm text-slate-500">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center mt-12 md:mt-16">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Ready to stake on yourself?</h2>
        <p className="text-slate-500 mt-2">Pick a path below and make it happen.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <Button asChild className="h-11 px-6 bg-primary hover:bg-primary/90">
            <Link to="/private">
              <Lock className="w-4 h-4 mr-2" /> Start a private session
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-11 px-6">
            <Link to="/feed">
              <TrendingUp className="w-4 h-4 mr-2" /> Browse the public feed
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}