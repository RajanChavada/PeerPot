import React from "react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  Career: "bg-violet-50 text-violet-700 ring-violet-200",
  Fitness: "bg-orange-50 text-orange-700 ring-orange-200",
  Learning: "bg-blue-50 text-blue-700 ring-blue-200",
  Creative: "bg-pink-50 text-pink-700 ring-pink-200",
  Health: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  Social: "bg-amber-50 text-amber-700 ring-amber-200",
  Finance: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  Other: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default function CategoryBadge({ category, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        VARIANTS[category] || VARIANTS.Other,
        className
      )}
    >
      {category}
    </span>
  );
}