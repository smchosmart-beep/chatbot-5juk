import { createFileRoute } from "@tanstack/react-router";
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
  Users,
  Award,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

import { AppLayout } from "@/components/AppLayout";

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
  component: StatsPage,
});

// 상위 10개 키워드 모의 데이터
const KEYWORD_DATA = [
  { name: "휴대폰", count: 45, percentage: 20 },
  { name: "실내화", count: 38, percentage: 17 },
  { name: "급식", count: 32, percentage: 14 },
  { name: "지각", count: 28, percentage: 12 },
  { name: "체육", count: 25, percentage: 11 },
  { name: "쉬는시간", count: 22, percentage: 10 },
  { name: "청소", count: 18, percentage: 8 },
  { name: "간식", count: 15, percentage: 7 },
  { name: "복도통행", count: 12, percentage: 5 },
  { name: "화장실", count: 9, percentage: 4 },
];

// 최근 질문 로그 모의 데이터
const RECENT_QUESTIONS = [
  { id: 1, text: "수업 시간에 휴대폰 내야 하나요?", time: "2분 전" },
  { id: 2, text: "실내화 안 가져오면 벌점인가요?", time: "7분 전" },
  { id: 3, text: "지각 기준 시간이 언제예요?", time: "15분 전" },
  { id: 4, text: "급식 먹을 때 순서 지켜야 하나요?", time: "24분 전" },
  { id: 5, text: "쉬는 시간에 교외로 나갈 수 있나요?", time: "40분 전" },
];

function StatsPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // SSR 수화 오류 방지를 위해 마운트 완료 상태 감지
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <AppLayout>
      <div className="flex-1 min-h-0 overflow-y-auto bg-bg-app">
        {/* 상단 헤더 */}
        <header className="px-5 py-6 bg-white border-b border-slate-200/70">
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
        </header>

        <div className="p-5 max-w-4xl mx-auto flex flex-col gap-6">
          {/* 주요 지표 요약 카드 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-ink-400">
                <span className="text-xs font-semibold">총 질문 횟수</span>
                <MessageSquare className="w-4.5 h-4.5 text-mint-500" strokeWidth={2} />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-ink-900">229</span>
                <span className="text-xs text-ink-400">회</span>
              </div>
              <span className="text-[10px] text-mint-600 font-semibold flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-3.5 h-3.5" /> 지난주 대비 +12%
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-ink-400">
                <span className="text-xs font-semibold">최다 질문 키워드</span>
                <Award className="w-4.5 h-4.5 text-amber-500" strokeWidth={2} />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-ink-900">휴대폰</span>
              </div>
              <span className="text-[10px] text-ink-400 font-semibold mt-2.5">
                전체 질문의 20% 차지
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-ink-400">
                <span className="text-xs font-semibold">일평균 질문 수</span>
                <Clock className="w-4.5 h-4.5 text-blue-500" strokeWidth={2} />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-ink-900">16.4</span>
                <span className="text-xs text-ink-400">회</span>
              </div>
              <span className="text-[10px] text-ink-400 font-semibold mt-2.5">
                주중 활성 시간대 위주
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-ink-400">
                <span className="text-xs font-semibold">활성 학생 수</span>
                <Users className="w-4.5 h-4.5 text-purple-500" strokeWidth={2} />
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-ink-900">28</span>
                <span className="text-xs text-ink-400">명</span>
              </div>
              <span className="text-[10px] text-purple-600 font-semibold mt-2.5">
                학급 전체 참여율 93%
              </span>
            </div>
          </div>

          {/* 그래프 영역 */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-ink-900">인기 키워드 Top 10</h2>
              <p className="text-[11px] text-ink-400 mt-0.5">
                질문 빈도가 가장 높은 10개의 키워드와 질문 수 비교 그래프입니다.
              </p>
            </div>

            <div className="h-[280px] w-full flex items-center justify-center">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={KEYWORD_DATA}
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
                      {KEYWORD_DATA.map((entry, index) => (
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
                    {KEYWORD_DATA.slice(0, 5).map((item, idx) => (
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
            </div>

            {/* 실시간 질문 피드 (모의 데이터) */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ink-900">최근 질문 목록</h3>
                  <p className="text-[11px] text-ink-400 mt-0.5">챗봇에게 방금 들어온 실시간 질문 로그입니다.</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-mint-600 bg-mint-50 animate-pulse">
                  Live
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {RECENT_QUESTIONS.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-start justify-between gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100/50 transition-colors"
                  >
                    <p className="text-xs text-ink-700 leading-normal font-medium flex-1">
                      &quot;{question.text}&quot;
                    </p>
                    <span className="text-[10px] text-ink-400 whitespace-nowrap">{question.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
