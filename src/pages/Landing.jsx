import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_TICKER = [
  "Alex staked 40 USDC on running a 5k",
  "Priya staked 120 USDC on MCAT prep",
  "David staked 500 USDC on shipping his app",
  "Sarah staked 25 USDC on waking up at 6am",
  "James staked 100 USDC on reading 5 books",
];

export default function Landing() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 md:py-8">
      
      {/* Ticker marquee */}
      <div className="w-full overflow-hidden bg-slate-900 text-slate-300 py-2.5 mb-8 rounded-sm font-mono text-[10px] tracking-widest uppercase relative border-y border-slate-700">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>
        <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite]">
          {[...MOCK_TICKER, ...MOCK_TICKER, ...MOCK_TICKER].map((text, i) => (
            <span key={i} className="mx-8 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-stake-red mr-3 opacity-80"></span>
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Torn Ticket Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-ledger-cream shadow-[0_10px_40px_rgba(0,0,0,0.05)] mx-auto max-w-3xl overflow-hidden border border-slate-200"
      >
        <div className="p-8 md:p-14 text-center border-b-2 border-dashed border-slate-300">
          <h1 className="text-6xl md:text-8xl font-display text-ink-black tracking-normal uppercase leading-[0.85] mb-6">
            Put your money <br /> where your <span className="text-stake-red decoration-4 underline decoration-stake-red/30 -rotate-2 inline-block transform origin-bottom">mouth</span> is.
          </h1>
          <p className="text-slate-600 mt-6 max-w-xl mx-auto text-base md:text-lg leading-relaxed font-medium">
            Lock stablecoins behind any personal goal. Friends back you
            or doubt you — hit the goal and keep your stake, miss it and the doubters split the pool.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 font-mono">
            <Button asChild size="lg" className="h-14 px-8 bg-ink-black hover:bg-slate-800 text-ledger-cream rounded-none text-sm uppercase tracking-widest font-bold shadow-[4px_4px_0px_#cbd5e1] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_#cbd5e1] transition-all">
              <Link to="/create">
                <Lock className="w-4 h-4 mr-2" /> Lock in a Goal
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 bg-transparent border-2 border-ink-black text-ink-black rounded-none text-sm uppercase tracking-widest font-bold hover:bg-slate-100 transition-all">
              <Link to="/feed">
                <Compass className="w-4 h-4 mr-2" /> Explore Feed
              </Link>
            </Button>
          </div>
        </div>

        {/* How it works stubs */}
        <div className="bg-[#f8f6f0] p-6 md:p-8">
          <div className="flex flex-col md:flex-row divide-y-2 md:divide-y-0 md:divide-x-2 divide-dashed divide-slate-300">
            {[
              { step: "ROUND 1", title: "Commit", body: "Set a goal, a deadline, and a USDC stake." },
              { step: "ROUND 2", title: "Rally", body: "Friends back you to win or doubt you to fail." },
              { step: "ROUND 3", title: "Resolve", body: "Hit it — keep stake. Miss it — doubters split." },
            ].map((s, i) => (
              <div key={i} className="flex-1 py-6 md:py-0 md:px-6 first:pt-0 first:md:pl-0 last:pb-0 last:md:pr-0">
                <div className="text-[10px] font-mono font-bold text-stake-red mb-2 tracking-widest uppercase">
                  {s.step}
                </div>
                <h4 className="font-display text-2xl text-ink-black uppercase tracking-wide mb-1">{s.title}</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}