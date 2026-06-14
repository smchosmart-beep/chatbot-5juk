import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 border-t border-slate-200/70 bg-white"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="학급 규칙에 대해 물어보세요"
        disabled={disabled}
        className="
          flex-1 rounded-2xl bg-bg-app px-4 py-3 text-sm text-ink-900
          placeholder:text-ink-400 outline-none
          focus:ring-2 focus:ring-mint-200
          disabled:opacity-60
        "
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="
          shrink-0 w-11 h-11 rounded-2xl bg-mint-500 text-white
          flex items-center justify-center
          transition-all duration-200 active:scale-95
          hover:bg-mint-600 hover:-translate-y-0.5
          disabled:opacity-40 disabled:hover:translate-y-0
        "
        aria-label="전송"
      >
        <Send className="w-4.5 h-4.5" strokeWidth={2.2} />
      </button>
    </form>
  );
}
