import { Sparkles } from "lucide-react";
import type { ChatMessage } from "@/types/chat";
import { RuleTag } from "./RuleTag";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="
            max-w-[80%] rounded-2xl rounded-br-md bg-mint-500 text-white
            px-4 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap
          "
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2.5">
      <div
        className="
          w-8 h-8 shrink-0 rounded-full bg-mint-100 text-mint-600
          flex items-center justify-center mt-0.5
        "
      >
        <Sparkles className="w-4 h-4" strokeWidth={2.2} />
      </div>
      <div className="flex flex-col gap-2 max-w-[80%]">
        <div
          className="
            rounded-2xl rounded-tl-md bg-white text-ink-900
            px-4 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap
          "
        >
          {message.content}
        </div>
        {message.citedRules && message.citedRules.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {message.citedRules.map((rule) => (
              <RuleTag key={`${rule.ruleNumber}-${rule.title}`} citation={rule} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
