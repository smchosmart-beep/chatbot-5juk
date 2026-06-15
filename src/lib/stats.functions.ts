import { createServerFn } from "@tanstack/react-start";
import { matchKeywords } from "@/lib/stats-keywords";

export interface KeywordStat {
  name: string;
  count: number;
  percentage: number;
}

export interface RecentQuestion {
  id: string;
  text: string;
  createdAt: number;
}

export interface QuestionStats {
  totalCount: number;
  keywordData: KeywordStat[];
  topKeyword: { name: string; percentage: number } | null;
  dailyAverage: number;
  recentQuestions: RecentQuestion[];
}

// ---------- 질문 통계 집계 ----------

export const getQuestionStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<QuestionStats> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("question_logs")
      .select("id, question, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`질문 통계를 불러오지 못했습니다: ${error.message}`);
    }

    const logs = data ?? [];
    const totalCount = logs.length;

    // 1) 키워드 집계
    const counts = new Map<string, number>();
    for (const log of logs) {
      for (const kw of matchKeywords(log.question)) {
        counts.set(kw, (counts.get(kw) ?? 0) + 1);
      }
    }

    const totalKeywordHits = Array.from(counts.values()).reduce((a, b) => a + b, 0);

    const keywordData: KeywordStat[] = Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          totalKeywordHits > 0 ? Math.round((count / totalKeywordHits) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topKeyword =
      keywordData.length > 0
        ? { name: keywordData[0].name, percentage: keywordData[0].percentage }
        : null;

    // 2) 일평균 (질문이 있었던 날짜 수 기준)
    const activeDays = new Set(
      logs.map((log) => new Date(log.created_at).toISOString().slice(0, 10)),
    ).size;
    const dailyAverage =
      activeDays > 0 ? Math.round((totalCount / activeDays) * 10) / 10 : 0;

    // 3) 최근 질문 5개
    const recentQuestions: RecentQuestion[] = logs.slice(0, 5).map((log) => ({
      id: log.id,
      text: log.question,
      createdAt: new Date(log.created_at).getTime(),
    }));

    return {
      totalCount,
      keywordData,
      topKeyword,
      dailyAverage,
      recentQuestions,
    };
  },
);
