import React, { useMemo, useState } from "react";
import { Search, MessageCircle, History, Star, ExternalLink, CircleHelp, ThumbsUp, Wrench, Bookmark, Share2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * HACCP 통합 정보 웹 UI (React + Tailwind + shadcn/ui 스타일 가이드)
 * - 단일 파일 컴포넌트. 페이지에 그대로 렌더해도 동작합니다.
 * - 더미 데이터와 간단한 상호작용(검색, 탭, 별점/피드백)을 포함합니다.
 */

// ---- 유틸: 별점 컴포넌트 ----
function StarRating({ value = 4.5, outOf = 5, onChange }: { value?: number; outOf?: number; onChange?: (v:number)=>void }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const rounded = useMemo(() => Math.round(value * 2) / 2, [value]);
  const stars = Array.from({ length: outOf }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-2 select-none">
      <div className="flex items-center">
        {stars.map((i) => {
          const filled = (hoverIdx ?? rounded) >= i;
          const half = (hoverIdx === null) && rounded + 0.5 === i; // half-star 표시 간략화
          return (
            <button
              key={i}
              aria-label={`별 ${i}점`}
              className="p-1"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              onClick={() => onChange?.(i)}
            >
              <Star
                className={`w-5 h-5 ${filled ? "fill-current" : half ? "[&>path]:opacity-100" : ""}`}
              />
            </button>
          );
        })}
      </div>
      <span className="text-sm text-muted-foreground">{value.toFixed(1)}</span>
    </div>
  );
}

// ---- 레퍼런스 아이템 ----
function ReferenceItem({ title, page, link }: { title: string; page: string; link?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-card hover:bg-accent/30 transition">
      <div className="min-w-0">
        <div className="text-sm text-muted-foreground">{page}</div>
        <div className="font-medium truncate">{title}</div>
      </div>
      <a href={link ?? "#"} className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm">
        문서보기 <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

// ---- 탭 버튼 ----
function Tabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1 border-b">
      {[
        { key: "qa", label: "질의응답", Icon: MessageCircle },
        { key: "history", label: "대화기록", Icon: History },
      ].map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`relative -mb-px px-4 py-3 text-sm font-medium flex items-center gap-2 transition ${
            value === key
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onChange(key)}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

// ---- Q/A 말풍선 ----
function Bubble({ role, children }: { role: "Q" | "A"; children: React.ReactNode }) {
  const isQ = role === "Q";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 md:p-5 border ${
        isQ ? "bg-sky-50/60 border-sky-100" : "bg-red-50/60 border-red-100"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`grid place-items-center w-7 h-7 rounded-full text-white shrink-0 ${
            isQ ? "bg-sky-500" : "bg-red-500"
          }`}
        >
          {role}
        </div>
        <div className="prose prose-sm max-w-none leading-relaxed">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

// ---- 메인 컴포넌트 ----
export default function App() {
  const [tab, setTab] = useState("qa");
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState(4.5);
  const [helpful, setHelpful] = useState(0);
  const [needsWork, setNeedsWork] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제 연동 시, query를 이용해 API 호출
  };

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500 grid place-items-center text-white font-bold">H</div>
            <div>
              <div className="font-semibold leading-tight">HACCP 생성형 AI 통합 정보 제공 서비스</div>
              <div className="text-xs text-muted-foreground">스마트HACCP 플랫폼</div>
            </div>
          </div>

          <a
            href="#"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-accent/50 transition text-sm"
          >
            스마트HACCP 플랫폼
          </a>
        </div>
      </header>

      {/* 검색 영역 */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="HACCP 관련 질문을 입력하세요 (예: 중요관리점 설정 방법, HACCP 인증 절차, 수입식품 기준)"
              className="w-full pl-10 pr-4 py-3 rounded-2xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </form>
        </div>
      </section>

      {/* 본문 */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-6">
        <div>
          <Tabs value={tab} onChange={setTab} />

          {tab === "qa" ? (
            <div className="mt-4 space-y-4">
              <Bubble role="Q">
                <p>
                  식품위생법 기준에서 <b>유리잔류염소</b>의 모니터링 방법은 무엇인가요?
                </p>
              </Bubble>

              <Bubble role="A">
                <p>
                  식품위생법에 따르면 세균수의 측정은 주로 표준 평판배양법(Standard Plate Count Method)을 사용합니다.
                  샘플을 멸균 희석한 후, 특정 배지(예: Plate Count Agar)에 <u>도말</u>하여 35–37℃에서 24–48시간 배양한 뒤
                  CFU/mL로 계산합니다. 기준치는 식품 유형에 따라 다르며, 예를 들어 일반 세균수는 1g당 10^5 CFU 이하로 규정될 수 있습니다.
                </p>
              </Bubble>

              {/* 신뢰도 + 피드백 */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">신뢰도</span>
                  <StarRating value={rating} onChange={(v) => setRating(v)} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-accent/50 text-sm"
                    onClick={() => setHelpful((n) => n + 1)}
                  >
                    <ThumbsUp className="w-4 h-4" /> 도움됨 {helpful > 0 && <span className="ml-1">({helpful})</span>}
                  </button>
                  <button
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-accent/50 text-sm"
                    onClick={() => setNeedsWork((n) => n + 1)}
                  >
                    <Wrench className="w-4 h-4" /> 개선필요 {needsWork > 0 && <span className="ml-1">({needsWork})</span>}
                  </button>
                </div>
              </div>

              {/* 참고자료 */}
              <section className="mt-2">
                <div className="text-sm font-semibold mb-2">참고자료</div>
                <div className="space-y-2">
                  <ReferenceItem
                    page="식품위생법 법령 (페이지: 20,25)"
                    title="식품위생법 시행규칙 — 일반세균수 관련 조항"
                    link="#"
                  />
                  <ReferenceItem
                    page="안전관리 인증기준(HACCP) 평가 심사매뉴얼_최종 (페이지: 15)"
                    title="HACCP 심사 매뉴얼 — 미생물 모니터링"
                    link="#"
                  />
                </div>
              </section>
            </div>
          ) : (
            <div className="mt-6 text-sm text-muted-foreground">
              아직 대화기록이 없습니다. 질문을 입력해 보세요.
            </div>
          )}
        </div>

        {/* 오른쪽 사이드 액션 */}
        <aside className="flex lg:block gap-3">
          <button className="w-12 h-12 rounded-xl grid place-items-center border hover:bg-accent/50">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="w-12 h-12 rounded-xl grid place-items-center border hover:bg-accent/50">
            <Bookmark className="w-5 h-5" />
          </button>
          <button className="hidden lg:flex mt-3 w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 hover:bg-accent/50">
            <CircleHelp className="w-4 h-4" /> 도움말
          </button>
        </aside>
      </main>

      {/* 푸터 */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-muted-foreground">
          ⓒ 2025 HACCP AI. 본 화면은 프로토타입 데모입니다.
        </div>
      </footer>
    </div>
  );
}
