import React from "react";

export function CodeBlock({ children, className = "" }) {
  return (
    <div
      className={`font-mono text-[13px] bg-code border border-ink/8 rounded-input px-2.5 py-1 text-ink inline-block ${className}`}
    >
      {children}
    </div>
  );
}
