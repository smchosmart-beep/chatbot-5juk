// 채팅 메시지 한 건
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** AI 답변이 근거로 든 학급 규칙 조항들 */
  citedRules?: RuleCitation[];
  createdAt: number;
}

// AI 답변에 표시되는 규칙 출처 칩
export interface RuleCitation {
  ruleNumber: string; // 예: "제5조"
  title: string; // 예: "휴대폰 사용"
}

// 업로드된 학급 규칙 파일 정보
export interface RuleDocument {
  id: string;
  fileName: string;
  uploadedAt: number;
  fileSizeLabel: string;
  status: "processing" | "ready" | "error";
}

// 업로드 페이지 인증 상태
export type AuthStatus = "locked" | "unlocked";
