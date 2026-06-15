// 규칙 기반 키워드 사전
// 각 대표 키워드(name)마다 매칭에 사용할 표현(synonyms)을 함께 둡니다.
// 질문 원문에 synonyms 중 하나라도 포함되면 해당 키워드로 집계됩니다.
// 교육 연구용으로 키워드는 이곳에서 자유롭게 추가·수정할 수 있습니다.

export interface KeywordRule {
  name: string;
  synonyms: string[];
}

export const KEYWORD_RULES: KeywordRule[] = [
  { name: "휴대폰", synonyms: ["휴대폰", "핸드폰", "스마트폰", "폰", "휴대전화"] },
  { name: "실내화", synonyms: ["실내화", "슬리퍼", "덧신"] },
  { name: "급식", synonyms: ["급식", "점심", "밥", "식사", "배식"] },
  { name: "지각", synonyms: ["지각", "늦", "등교시간", "등교 시간"] },
  { name: "체육", synonyms: ["체육", "운동장", "강당", "체육관"] },
  { name: "쉬는시간", synonyms: ["쉬는시간", "쉬는 시간", "휴식", "쉬는"] },
  { name: "청소", synonyms: ["청소", "당번", "정리정돈", "정리 정돈"] },
  { name: "간식", synonyms: ["간식", "군것질", "과자"] },
  { name: "복도통행", synonyms: ["복도", "통행", "이동"] },
  { name: "화장실", synonyms: ["화장실", "양치", "세면"] },
];

/**
 * 질문 원문에서 매칭되는 대표 키워드 목록을 반환합니다.
 * 한 질문이 여러 키워드에 매칭될 수 있습니다.
 */
export function matchKeywords(question: string): string[] {
  const text = question.toLowerCase();
  const matched: string[] = [];
  for (const rule of KEYWORD_RULES) {
    if (rule.synonyms.some((s) => text.includes(s.toLowerCase()))) {
      matched.push(rule.name);
    }
  }
  return matched;
}
