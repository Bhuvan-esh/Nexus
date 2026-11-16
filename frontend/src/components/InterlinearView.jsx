import React from "react";
import { TokenChip } from "./TokenChip";
import { ProtectedBadge } from "./ProtectedBadge";

export function InterlinearView({ tokens = [], onSelectToken }) {
  if (!tokens || tokens.length === 0) return null;

  return (
    <div className="my-3 pt-2">
      <div className="text-[10px] font-mono uppercase tracking-wider text-ink/50 mb-1.5">
        Interlinear Resolve-Along
      </div>

      <div className="flex flex-wrap items-end gap-1.5">
        {tokens.map((tok, idx) => {
          if (tok.isProtected) {
            return (
              <ProtectedBadge
                key={tok.id || idx}
                text={tok.source}
                kind={tok.kind || "url"}
                sha256={tok.sha256Source}
              />
            );
          }

          return (
            <TokenChip
              key={tok.id || idx}
              token={tok}
              onSelectToken={onSelectToken}
            />
          );
        })}
      </div>
    </div>
  );
}
