// 서버 전용: Lovable AI Gateway 호출 (임베딩 + 채팅)
// 이 파일은 *.server.ts 이므로 클라이언트 번들에 포함되지 않습니다.
// 핸들러 안에서 동적 import 로 불러 사용하세요.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const EMBEDDING_MODEL = "google/gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 1536;
const CHAT_MODEL = "google/gemini-3-flash-preview";

function getApiKey(): string {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  return key;
}

export class AiGatewayError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AiGatewayError";
  }
}

/** 여러 텍스트를 한 번에 임베딩합니다 (1536차원). */
export async function embedTexts(inputs: string[]): Promise<number[][]> {
  if (inputs.length === 0) return [];
  const res = await fetch(`${GATEWAY_URL}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: inputs,
      dimensions: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new AiGatewayError(res.status, `임베딩 요청 실패 (${res.status}): ${body}`);
  }

  const json = (await res.json()) as {
    data: { index: number; embedding: number[] }[];
  };
  // index 순서대로 정렬해 안전하게 반환
  return json.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

export async function embedText(input: string): Promise<number[]> {
  const [vec] = await embedTexts([input]);
  return vec;
}

/** 채팅 모델을 호출해 JSON 객체를 반환합니다. */
export async function chatCompletionJson(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const res = await fetch(`${GATEWAY_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new AiGatewayError(res.status, `채팅 요청 실패 (${res.status}): ${body}`);
  }

  const json = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  return json.choices?.[0]?.message?.content ?? "{}";
}

/** 긴 텍스트를 임베딩하기 좋은 크기의 조각으로 나눕니다. */
export function chunkText(text: string): string[] {
  const clean = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
  if (!clean) return [];

  const maxLen = 800;
  const overlap = 120;
  // 문단(빈 줄) 기준으로 먼저 나누고, 너무 긴 문단은 글자 수로 다시 자름
  const paragraphs = clean
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let buffer = "";

  const flushLong = (para: string) => {
    let start = 0;
    while (start < para.length) {
      chunks.push(para.slice(start, start + maxLen).trim());
      start += maxLen - overlap;
    }
  };

  for (const para of paragraphs) {
    if (para.length > maxLen) {
      if (buffer) {
        chunks.push(buffer.trim());
        buffer = "";
      }
      flushLong(para);
      continue;
    }
    if ((buffer + " " + para).trim().length > maxLen) {
      chunks.push(buffer.trim());
      buffer = para;
    } else {
      buffer = buffer ? `${buffer} ${para}` : para;
    }
  }
  if (buffer.trim()) chunks.push(buffer.trim());

  return chunks.filter((c) => c.length > 0);
}
