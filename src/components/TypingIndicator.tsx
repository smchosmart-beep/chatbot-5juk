import { Sparkles } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2.5">
      <div className="w-8 h-8 shrink-0 rounded-full bg-mint-100 text-mint-600 flex items-center justify-center mt-0.5">
        <Sparkles className="w-4 h-4" strokeWidth={2.2} />
      </div>
      <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-pulse-soft" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-pulse-soft" style={{ animationDelay: "180ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-ink-400 animate-pulse-soft" style={{ animationDelay: "360ms" }} />
      </div>
    </div>
  );
}
