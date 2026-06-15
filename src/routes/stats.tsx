import { createFileRoute, useRouter } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  BarChart3,
  MessageSquare,
  Award,
  Clock,
  TrendingUp,
} from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { getQuestionStats } from "@/lib/stats.functions";

const statsQueryOptions = queryOptions({
  queryKey: ["question-stats"],
  queryFn: () => getQuestionStats(),
});

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "질문 통계 · 우리 반 규칙 도우미" },
      {
        name: "description",
        content: "학생들이 AI 도우미에게 가장 많이 물어본 질문 키워드 통계입니다.",
      },
      { property: "og:title", content: "질문 통계 · 우리 반 규칙 도우미" },
      {
        property: "og:description",
        content: "학생들이 가장 궁금해하는 학급 규칙 통계 및 인기 키워드를 막대그래프로 확인하세요.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(statsQueryOptions),
  component: StatsPage,
  errorComponent: ({ error }) => (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-sm text-ink-400" role="alert">
          통계를 불러오지 못했어요.
          <br />
          {error.message}
        </div>
      </div>
    </AppLayout>
  ),
  notFoundComponent: () => (
    <AppLayout>
      <div className="flex-1 flex items-center justify-center p-6 text-sm text-ink-400">
        통계를 찾을 수 없어요.
      </div>
    </AppLayout>
  ),
});

// 경과 시간을 상대적 표현으로 변환
function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

function StatsPage() {
  const { data: stats } = useSuspenseQuery(statsQueryOptions);
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // SSR 수화 오류 방지를 위해 마운트 완료 상태 감지
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const hasData = stats.totalCount > 0;

  return (
    <AppLayout>
      <div className="flex-1 min-h-0 overflow-y-auto bg-bg-app">
        {/* 상단 헤더 */}
        <header className="px-5 py-6 bg-white border-b border-slate-200/70">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-mint-50 flex items-center justify-center text-mint-600 shrink-0">
                <BarChart3 className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-ink-900 leading-tight">질문 키워드 통계</h1>
                <p className="text-xs text-ink-400 mt-0.5">
                  학생들이 규칙 도우미에게 가장 많이 질문한 주제들을 보여줍니다.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.invalidate()}
              className="shrink-0 rounded-full bg-slate-50 border border-slate-200 text-ink-700 px-3 py-1.5 text-xs font-medium transition-all hover:bg-slate-100 active:scale-95"
            >
              새로고침
            </button>
          </div>
        </header>

        {!hasData ? (
          <div className="p-5 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-ink-400">
                <MessageSquare className="w-6 h-6" strokeWidth={2} />
              </div>
              <h2 className="text-sm font-bold text-ink-900 mt-1">아직 질문 기록이 없어요</h2>
              <p className="text-xs text-ink-400 max-w-xs">
                학생들이 챗봇에게 질문을 하기 시작하면, 인기 키워드와 통계가 이곳에 표시됩니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 max-w-4xl mx-auto flex flex-col gap-6">
            {/* 주요 지표 요약 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-ink-400">
                  <span className="text-xs font-semibold">총 질문 횟수</span>
                  <MessageSquare className="w-4.5 h-4.5 text-mint-500" strokeWidth={2} />
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold text-ink-900">{stats.totalCount}</span>
                  <span className="text-xs text-ink-400">회</span>
                </div>
                <span className="text-[10px] text-mint-600 font-semibold flex items-center gap-0.5 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> 학생들의 누적 질문 수
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-ink-400">
                  <span className="text-xs font-semibold">최다 질문 키워드</span>
                  <Award className="w-4.5 h-4.5 text-amber-500" strokeWidth={2} />
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold text-ink-900">
                    {stats.topKeyword ? stats.topKeyword.name : "—"}
                  </span>
                </div>
                <span className="text-[10px] text-ink-400 font-semibold mt-2.5">
                  {stats.topKeyword
                    ? `전체 키워드의 ${stats.topKeyword.percentage}% 차지`
                    : "매칭된 키워드가 아직 없어요"}
                </span>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-ink-400">
                  <span className="text-xs font-semibold">일평균 질문 수</span>
                  <Clock className="w-4.5 h-4.5 text-blue-500" strokeWidth={2} />
                </div>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold text-ink-900">{stats.dailyAverage}</span>
                  <span className="text-xs text-ink-400">회</span>
                </div>
                <span className="text-[10px] text-ink-400 font-semibold mt-2.5">
                  질문이 있었던 날 기준 평균
                </span>
              </div>
            </div>

            {/* 그래프 영역 */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-bold text-ink-900">인기 키워드 Top 10</h2>
                <p className="text-[11px] text-ink-400 mt-0.5">
                  질문 빈도가 가장 높은 키워드와 질문 수 비교 그래프입니다.
                </p>
              </div>

              <div className="h-[280px] w-full flex items-center justify-center">
                {stats.keywordData.length === 0 ? (
                  <div className="text-xs text-ink-400">아직 매칭된 키워드가 없어요.</div>
                ) : isMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.keywordData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white px-3 py-2 border border-slate-100 rounded-xl shadow-lg flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-ink-900">{data.name}</span>
                                <div className="flex items-center gap-1.5 text-[11px]">
                                  <span className="text-mint-600 font-bold">{data.count}회 질문</span>
                                  <span className="text-ink-400">({data.percentage}%)</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                        onMouseEnter={(_, index) => setHoveredBar(index)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {stats.keywordData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={hoveredBar === index ? "#059669" : "#10b981"}
                            className="transition-colors duration-200 cursor-pointer"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-ink-400 animate-pulse">차트 로딩 중...</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 키워드 상세 비율 표 */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-ink-900">키워드별 상세 통계</h3>
                  <p className="text-[11px] text-ink-400 mt-0.5">각 키워드의 비율과 빈도 데이터입니다.</p>
                </div>

                {stats.keywordData.length === 0 ? (
                  <div className="text-xs text-ink-400 py-6 text-center">
                    매칭된 키워드가 아직 없어요.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-100">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-ink-700 font-semibold">
                          <th className="py-2.5 px-3">순위</th>
                          <th className="py-2.5 px-3">키워드</th>
                          <th className="py-2.5 px-3 text-right">질문 수</th>
                          <th className="py-2.5 px-3 text-right">비율</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-ink-900">
                        {stats.keywordData.slice(0, 5).map((item, idx) => (
                          <tr key={item.name} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-ink-400">{idx + 1}위</td>
                            <td className="py-2.5 px-3 font-bold text-ink-700">{item.name}</td>
                            <td className="py-2.5 px-3 text-right font-medium">{item.count}회</td>
                            <td className="py-2.5 px-3 text-right text-mint-600 font-semibold">
                              {item.percentage}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 최근 질문 피드 */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-ink-900">최근 질문 목록</h3>
                  <p className="text-[11px] text-ink-400 mt-0.5">챗봇에게 들어온 최근 질문 기록입니다.</p>
                </div>

                {stats.recentQuestions.length === 0 ? (
                  <div className="text-xs text-ink-400 py-6 text-center">
                    아직 질문 기록이 없어요.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {stats.recentQuestions.map((question) => (
                      <div
                        key={question.id}
                        className="flex items-start justify-between gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100/50 transition-colors"
                      >
                        <p className="text-xs text-ink-700 leading-normal font-medium flex-1">
                          &quot;{question.text}&quot;
                        </p>
                        <span className="text-[10px] text-ink-400 whitespace-nowrap">
                          {relativeTime(question.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
