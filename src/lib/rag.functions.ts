import { createServerFn } from "@tanstack/react-start";
import type { RuleCitation, RuleDocument } from "@/types/chat";

// ---------- 입력 검증 ----------

function asString(value: unknown, field: string): string {
  if (typeof value !== "string") throw new Error(`${field} 값이 올바르지 않습니다.`);
  return value;
}

// 교사 공용 비밀번호 검증 (서버 시크릿과 비교)
function checkPassword(password: string): boolean {
  const expected = process.env.TEACHER_PASSWORD;
  if (!expected) {
    throw new Error("교사 비밀번호가 설정되어 있지 않습니다.");
  }
  return password === expected;
}

// ---------- 비밀번호 확인 ----------

export const verifyTeacherPassword = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => ({
    password: asString(data?.password, "비밀번호"),
  }))
  .handler(async ({ data }) => {
    return { ok: checkPassword(data.password) };
  });

// ---------- 문서 업로드 + 학습 (임베딩) ----------

export const ingestDocument = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      password: string;
      fileName: string;
      fileSizeLabel: string;
      text: string;
      isManual?: boolean;
    }) => ({
      password: asString(data?.password, "비밀번호"),
      fileName: asString(data?.fileName, "파일 이름"),
      fileSizeLabel: asString(data?.fileSizeLabel, "파일 크기"),
      text: asString(data?.text, "문서 내용"),
      isManual: typeof data?.isManual === "boolean" ? data.isManual : false,
    }),
  )
  .handler(async ({ data }): Promise<RuleDocument> => {
    if (!checkPassword(data.password)) {
      throw new Error("비밀번호가 올바르지 않습니다.");
    }

    const trimmed = data.text.trim();
    if (!data.isManual && trimmed.length < 20) {
      throw new Error(
        "PDF에서 글자를 충분히 읽지 못했어요. 텍스트가 들어 있는 PDF인지 확인해주세요.",
      );
    }
    if (data.isManual && trimmed.length < 2) {
      throw new Error("규칙 내용을 최소 2글자 이상 입력해 주세요.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { embedTexts, chunkText } = await import("@/lib/ai.server");

    // 1) 문서 레코드 생성 (학습 중)
    const { data: doc, error: docError } = await supabaseAdmin
      .from("rule_documents")
      .insert({
        file_name: data.fileName,
        file_size_label: data.fileSizeLabel,
        status: "processing",
      })
      .select()
      .single();

    if (docError || !doc) {
      throw new Error(`문서 저장에 실패했습니다: ${docError?.message ?? "알 수 없는 오류"}`);
    }

    try {
      // 2) 텍스트 분할
      const chunks = chunkText(trimmed);
      if (chunks.length === 0) {
        throw new Error("문서에서 학습할 내용을 찾지 못했습니다.");
      }

      // 3) 임베딩 (50개씩 배치)
      const batchSize = 50;
      const rows: { document_id: string; content: string; chunk_index: number; embedding: string }[] =
        [];
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        const vectors = await embedTexts(batch);
        batch.forEach((content, j) => {
          rows.push({
            document_id: doc.id,
            content,
            chunk_index: i + j,
            embedding: `[${vectors[j].join(",")}]`,
          });
        });
      }

      // 4) 조각 저장
      const { error: chunkError } = await supabaseAdmin.from("rule_chunks").insert(rows);
      if (chunkError) {
        throw new Error(`규칙 조각 저장 실패: ${chunkError.message}`);
      }

      // 5) 학습 완료 처리
      await supabaseAdmin
        .from("rule_documents")
        .update({ status: "ready" })
        .eq("id", doc.id);

      return {
        id: doc.id,
        fileName: doc.file_name,
        fileSizeLabel: doc.file_size_label,
        uploadedAt: new Date(doc.created_at).getTime(),
        status: "ready",
      };
    } catch (err) {
      // 실패 시 상태 표시 + 조각 정리
      await supabaseAdmin
        .from("rule_documents")
        .update({ status: "error" })
        .eq("id", doc.id);
      throw err instanceof Error ? err : new Error("학습 처리 중 오류가 발생했습니다.");
    }
  });

// ---------- 문서 목록 ----------

export const listDocuments = createServerFn({ method: "GET" }).handler(
  async (): Promise<RuleDocument[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("rule_documents")
      .select("id, file_name, file_size_label, status, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`문서 목록을 불러오지 못했습니다: ${error.message}`);

    return (data ?? []).map((d) => ({
      id: d.id,
      fileName: d.file_name,
      fileSizeLabel: d.file_size_label,
      uploadedAt: new Date(d.created_at).getTime(),
      status: d.status as RuleDocument["status"],
    }));
  },
);

// ---------- 질문 답변 (RAG) ----------

const FALLBACK_ANSWER =
  "음, 업로드된 학급 규칙에서 그 내용을 정확히 찾지 못했어요. 질문을 조금 더 구체적으로 적어주거나, 선생님께 직접 확인해보는 것도 좋아요!";

const NO_DOCS_ANSWER =
  "아직 등록된 학급 규칙이 없어요. 선생님이 규칙 PDF를 업로드하면 그 내용을 바탕으로 답해줄게요!";

const SYSTEM_PROMPT = `너는 초등학교 학급의 '규칙 도우미' 챗봇이야. 학생에게 친근한 반말로, 짧고 명확하게 답해.

규칙(매우 중요):
1) 반드시 아래 '학급 규칙 발췌' 안에 적힌 내용만 근거로 답해. 발췌에 없는 내용은 추측하거나 지어내지 마.
2) 발췌에서 답을 찾을 수 없으면 answer 를 정확히 다음 문장으로 해: "${FALLBACK_ANSWER}"
3) 답변에 사용한 조항이 발췌에 보이면(예: "제5조", "5조", "휴대폰 사용") citations 에 담아. 조항 번호나 제목이 명확하지 않으면 빈 배열로 둬.

반드시 아래 JSON 형식으로만 답해:
{"answer": "학생에게 보여줄 답변", "citations": [{"ruleNumber": "제5조", "title": "휴대폰 사용"}]}`;

export const askQuestion = createServerFn({ method: "POST" })
  .inputValidator((data: { question: string }) => ({
    question: asString(data?.question, "질문").trim(),
  }))
  .handler(
    async ({
      data,
    }): Promise<{ content: string; citedRules: RuleCitation[] }> => {
      if (!data.question) {
        return { content: FALLBACK_ANSWER, citedRules: [] };
      }

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { embedText, chatCompletionJson } = await import("@/lib/ai.server");

      // 규칙이 하나도 없으면 안내
      const { count } = await supabaseAdmin
        .from("rule_chunks")
        .select("id", { count: "exact", head: true });
      if (!count || count === 0) {
        return { content: NO_DOCS_ANSWER, citedRules: [] };
      }

      // 1) 질문 임베딩 → 유사 조각 검색
      const queryEmbedding = await embedText(data.question);
      const { data: matches, error } = await supabaseAdmin.rpc("match_rule_chunks", {
        query_embedding: `[${queryEmbedding.join(",")}]` as unknown as string,
        match_count: 6,
      });

      if (error) {
        throw new Error(`규칙 검색에 실패했습니다: ${error.message}`);
      }

      const relevant = (matches ?? []).filter(
        (m: { similarity: number }) => m.similarity >= 0.2,
      );

      if (relevant.length === 0) {
        return { content: FALLBACK_ANSWER, citedRules: [] };
      }

      // 2) 컨텍스트 구성 → AI 답변
      const context = relevant
        .map(
          (m: { content: string }, i: number) => `[발췌 ${i + 1}]\n${m.content}`,
        )
        .join("\n\n");

      const userPrompt = `학급 규칙 발췌:\n"""\n${context}\n"""\n\n학생 질문: ${data.question}`;

      const raw = await chatCompletionJson(SYSTEM_PROMPT, userPrompt);

      let parsed: { answer?: string; citations?: RuleCitation[] };
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = { answer: raw };
      }

      const content =
        typeof parsed.answer === "string" && parsed.answer.trim()
          ? parsed.answer.trim()
          : FALLBACK_ANSWER;

      const citedRules: RuleCitation[] = Array.isArray(parsed.citations)
        ? parsed.citations
            .filter(
              (c): c is RuleCitation =>
                !!c &&
                typeof c.ruleNumber === "string" &&
                typeof c.title === "string",
            )
            .slice(0, 4)
        : [];

      // 규칙을 못 찾았다는 답이면 출처 표시 안 함
      const isFallback = content === FALLBACK_ANSWER;

      return {
        content,
        citedRules: isFallback ? [] : citedRules,
      };
    },
  );
