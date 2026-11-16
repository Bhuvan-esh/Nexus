import React from "react";

export function SourcePill({ label }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-pill bg-link/10 text-link text-[10px] font-semibold tracking-wide uppercase border border-link/20">
      {label}
    </span>
  );
}
