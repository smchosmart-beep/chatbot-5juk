import { BookMarked } from "lucide-react";
import type { RuleCitation } from "@/types/chat";

export function RuleTag({ citation }: { citation: RuleCitation }) {
  return (
    <span
      className="
        inline-flex items-center gap-1 rounded-full
        bg-amber-tag-bg text-amber-tag
        px-2.5 py-1 text-xs font-semibold
        whitespace-nowrap
      "
    >
      <BookMarked className="w-3 h-3" strokeWidth={2.4} />
      {citation.ruleNumber} · {citation.title}
    </span>
  );
}
