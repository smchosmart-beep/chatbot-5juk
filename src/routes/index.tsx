import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";

import { AppLayout } from "@/components/AppLayout";
import { ChatInput } from "@/components/ChatInput";
import { MessageBubble } from "@/components/MessageBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { SUGGESTED_QUESTIONS, WELCOME_MESSAGE } from "@/lib/chat-constants";
import { askQuestion } from "@/lib/rag.functions";
import type { ChatMessage } from "@/types/chat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "우리 반 규칙 도우미" },
      {
        name: "description",
        content:
          "선생님이 올린 학급 규칙을 바탕으로 답해주는 AI 규칙 도우미 챗봇입니다.",
      },
      { property: "og:title", content: "우리 반 규칙 도우미" },
      {
        property: "og:description",
        content: "학급 규칙을 물어보면 규칙 문서에 근거해 답해드려요.",
      },
    ],
  }),
  component: ChatPage,
});

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ChatPage() {
  const ask = useServerFn(askQuestion);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  async function handleSend(text: string) {
    if (isThinking) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      const result = await ask({ data: { question: text } });
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: result.content,
          citedRules: result.citedRules,
          createdAt: Date.now(),
        },
      ]);
    } catch (err) {
      const message =
        err instanceof Error && /402/.test(err.message)
          ? "지금은 답변을 만들 수 없어요. 잠시 후 다시 시도해줘. (사용량 한도)"
          : err instanceof Error && /429/.test(err.message)
            ? "요청이 너무 많아요. 잠깐 쉬었다가 다시 물어봐줘!"
            : "앗, 답변을 가져오는 중에 문제가 생겼어. 잠시 후 다시 시도해줘.";
      setMessages((prev) => [
        ...prev,
        {
          id: createId(),
          role: "assistant",
          content: message,
          createdAt: Date.now(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }

  const showSuggestions = messages.length === 1 && !isThinking;

  return (
    <AppLayout>
      <header className="shrink-0 px-5 py-4 border-b border-slate-200/70 bg-white">
        <h1 className="text-base font-bold text-ink-900">우리 반 규칙 도우미</h1>
        <p className="text-xs text-ink-400 mt-0.5">
          학급 규칙에 대해 궁금한 점을 물어보세요
        </p>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-5 flex flex-col gap-4"
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {showSuggestions && (
          <div className="flex flex-wrap gap-2 pl-10">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="
                  rounded-full bg-white border border-slate-200 text-ink-700
                  px-3.5 py-1.5 text-xs font-medium
                  transition-all duration-200 active:scale-95
                  hover:border-mint-200 hover:text-mint-700 hover:bg-mint-50/50
                "
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {isThinking && <TypingIndicator />}
      </div>

      <ChatInput onSend={handleSend} disabled={isThinking} />
    </AppLayout>
  );
}
