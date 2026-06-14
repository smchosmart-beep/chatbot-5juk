import type { ChatMessage } from "@/types/chat";

// 채팅 시작 시 보여줄 환영 메시지
export const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "안녕! 나는 우리 반 규칙 도우미야. 휴대폰 사용, 지각, 청소 당번 같은 학급 규칙이 궁금하면 편하게 물어봐.",
  createdAt: Date.now(),
};

// 자주 묻는 질문 추천 칩
export const SUGGESTED_QUESTIONS = [
  "휴대폰은 언제 쓸 수 있어?",
  "지각하면 어떻게 돼?",
  "청소 당번은 어떻게 정해?",
  "수업 시간에 화장실 갈 수 있어?",
];
