// 자동 키워드 추출 (빈도 기반, 명사 위주)
// 고정 사전 없이 질문 원문에서 의미 있는 "명사"를 자동으로 뽑습니다.
// "직업의", "직업은" 처럼 조사가 붙은 단어는 같은 "직업" 으로 합쳐 집계됩니다.
// "되는걸까", "정해" 같은 동사/형용사 활용형은 제외됩니다.
// 교육 연구용으로 아래 목록들은 이곳에서 자유롭게 수정할 수 있습니다.

// 단어 끝에 붙는 조사 (긴 것부터 제거해야 정확합니다)
const PARTICLES = [
  "에서는", "에게서", "으로는", "이라고", "라고는",
  "에서", "에게", "한테", "으로", "까지", "부터", "이라", "라고", "처럼", "보다", "마다", "조차", "밖에",
  "은", "는", "이", "가", "을", "를", "의", "에", "와", "과", "도", "만", "로", "야", "요", "냐", "니", "고",
];

// 단어 끝에 붙는 동사/형용사 활용형 어미 (어간만 남기기 위해 제거, 긴 것부터)
const VERB_SUFFIXES = [
  "하는걸까", "되는걸까", "하나요", "되나요", "할까요", "될까요",
  "하면서", "되면서", "하는지", "되는지",
  "하면", "하는", "해서", "하고", "해도", "하지", "하니", "해야", "한다", "했어", "했다",
  "되면", "되는", "돼서", "돼도", "된다", "됐어", "됐다", "할까", "될까", "할수", "갈수",
  "기면", "으면", "이면", "기는", "려면",
];

// 어간만 남긴 뒤에도 이런 어미로 "끝나면" 동사/형용사로 보고 버립니다.
// (명사로 끝나는 경우가 드문 종결형 위주로만 골랐습니다)
const REJECT_ENDINGS = [
  "는걸까", "을까", "ㄹ까", "는지", "은지", "나요", "어요", "아요", "에요", "예요",
  "군요", "겠지", "어서", "아서", "구나", "잖아", "더라",
  "다", "까", "죠", "네", "돼", "됨", "됐", "했", "줘", "봐", "워", "해", "쳐", "펴", "겠",
];

// 통계 의미가 없는 불용어 (의문사, 일반 동사/조동사, 대명사, 형식 명사 등)
const STOPWORDS = new Set([
  // 의문사
  "어떤", "어떻게", "무엇", "무슨", "언제", "어디", "어디서", "누구", "왜", "얼마", "몇개", "몇",
  // 형식 명사 / 일반 명사
  "종류", "경우", "것", "것들", "거", "게", "수", "때", "점", "등", "들", "중", "방법", "이유",
  // 동사/조동사/형용사 어간
  "있어", "있나", "있는", "있을", "없어", "없나", "돼", "되", "되나", "되는", "하면", "하나",
  "할", "한", "해", "해도", "가질", "가능", "쓸", "써도", "되나요", "있어요", "있나요",
  // 접속/부사
  "그리고", "그래서", "하지만", "그럼", "또", "또는", "그냥", "좀", "더", "진짜", "정말",
  // 대명사
  "내가", "나는", "우리", "저는", "제가", "너는",
]);

// REJECT_ENDINGS 로 끝나지만 실제로는 명사인 단어 (예외 허용)
const NOUN_WHITELIST = new Set([
  "이해", "오해", "방해", "피해", "독해", "분해",
]);

// 끝에 붙은 동사 활용 어미 또는 조사를 한 번 제거 (어간이 1글자가 되어도 허용)
function stripAffix(token: string): string {
  for (const s of VERB_SUFFIXES) {
    if (token.length > s.length && token.endsWith(s)) {
      return token.slice(0, token.length - s.length);
    }
  }
  for (const p of PARTICLES) {
    if (token.length > p.length && token.endsWith(p)) {
      return token.slice(0, token.length - p.length);
    }
  }
  return token;
}

// 동사/형용사 종결형으로 끝나는지 검사 (명사 예외 목록은 통과)
function looksLikeVerb(token: string): boolean {
  if (NOUN_WHITELIST.has(token)) return false;
  return REJECT_ENDINGS.some((e) => token.endsWith(e));
}

/**
 * 질문 원문에서 통계용 키워드(명사 위주)를 추출합니다.
 * - 한글/영문/숫자 토큰으로 분리
 * - 조사/동사 어미 제거 → 2글자 이상 → 동사형/불용어 제외
 * - 한 질문 안에서 같은 단어는 1회만 반환 (중복 제거)
 */
export function extractKeywords(question: string): string[] {
  if (!question) return [];

  const rawTokens = question
    .toLowerCase()
    .split(/[^0-9a-z가-힣]+/i)
    .filter(Boolean);

  const result = new Set<string>();
  for (const raw of rawTokens) {
    let token = raw;
    const isHangul = /[가-힣]/.test(token);
    if (isHangul) {
      token = stripAffix(token);
    }
    if (token.length < 2) continue;
    if (STOPWORDS.has(token)) continue;
    if (isHangul && looksLikeVerb(token)) continue;
    result.add(token);
  }
  return Array.from(result);
}
