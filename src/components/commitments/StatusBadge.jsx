import React from "react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  succeeded: { label: "Succeeded", className: "bg-blue-50 text-blue-700 ring-blue-200" },
  failed: { label: "Failed", className: "bg-rose-50 text-rose-700 ring-rose-200" },
  pending_resolution: { label: "Pending", className: "bg-amber-50 text-amber-700 ring-amber-200" },
};

export default function StatusBadge({ status, className }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        cfg.className,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}