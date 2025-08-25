// src/App.tsx
import React, { useMemo, useState } from "react";
import { Search, MessageCircle, History, Star, ExternalLink, CircleHelp, ThumbsUp, Wrench, Bookmark, Share2 } from "lucide-react";
import { motion } from "framer-motion";

/**
 * HACCP 통합 정보 웹 UI (React + Tailwind)
 * - 백엔드 RAG API (/search) 연동 버전
 * - .env: VITE_API_BASE_URL=http://<서버공인IP>:8000
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
              <Star className={`w-5 h-5 ${filled ? "fill-current" : half ? "[&>path]:opacity-100" : ""}`} />
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
      <a
        href={link ?? "#"}
        target={link ? "_blank" : undefined}
        rel={link ? "noreferrer" : undefined}
        className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm"
      >
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
            value === key ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
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
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl p-4 md:p-5 border ${isQ ? "bg-sky-50/60 border-sky-100" : "bg-red-50/60 border-red-100"}`}>
      <div className="flex items-start gap-3">
        <div className={`grid place-items-center w-7 h-7 rounded-full text-white shrink-0 ${isQ ? "bg-sky-500" : "bg-red-500"}`}>{role}</div>
        <div className="prose prose-sm max-w-none leading-relaxed">{children}</div>
      </div>
    </motion.div>
  );
}

type SearchResult = {
  source: string;        // 백엔드 chunks[].source
  text: string;          // 본문
  enriched_text?: string // 선택 필드
};

export default function App() {
  const [tab, setTab] = useState("qa");
  const [query, setQuery] = useState("");
  const [rating, setRating] = useState(4.5);
  const [helpful, setHelpful] = useState(0);
  const [needsWork, setNeedsWork] = useState(0);

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      setErr(null);
      setResults([]);

      const res = await fetch(`${API_BASE}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, top_k: 5 }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(Array.isArray(data?.results) ? data.results : []);
    } catch (e:any) {
      setErr(e?.message ?? "검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
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

          <a href="#" className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-accent/50 transition text-sm">
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
          {err && <p className="mt-2 text-sm text-red-600">⚠ {err}</p>}
        </div>
      </section>

      {/* 본문 */}
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-6">
        <div>
          <Tabs value={tab} onChange={setTab} />

          {tab === "qa" ? (
            <div className="mt-4 space-y-4">
              {/* Q */}
              {query && (
                <Bubble role="Q">
                  <p>
                    <b>질문:</b> {query}
                  </p>
                </Bubble>
              )}

              {/* A (요약 느낌으로 첫 결과 노출) */}
              {loading ? (
                <Bubble role="A">
                  <p>검색 중입니다…</p>
                </Bubble>
              ) : results.length > 0 ? (
                <Bubble role="A">
                  <p>
                    관련 조문 {results.length}건을 찾았습니다. 아래 참고자료에서 원문을 확인할 수 있어요.
                  </p>
                </Bubble>
              ) : (
                query && !loading && (
                  <Bubble role="A">
                    <p>관련 결과가 없습니다. 질문을 조금 더 구체적으로 변경해 보세요.</p>
                  </Bubble>
                )
              )}

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
                  {loading && <p className="text-sm text-muted-foreground">불러오는 중…</p>}
                  {!loading && results.length === 0 && <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>}
                  {!loading &&
                    results.map((r, idx) => (
                      <ReferenceItem
                        key={idx}
                        page={r.source || "출처 미상"}
                        title={(r.enriched_text || r.text || "").slice(0, 80) + (r.text && r.text.length > 80 ? "…" : "")}
                        link="#" // 필요 시 원문 URL 필드 연결
                      />
                    ))}
                </div>
              </section>
            </div>
          ) : (
            <div className="mt-6 text-sm text-muted-foreground">아직 대화기록이 없습니다. 질문을 입력해 보세요.</div>
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
        <div className="max-w-6xl mx-auto px-4 py-6 text-xs text-muted-foreground">ⓒ 2025 HACCP AI. 본 화면은 프로토타입 데모입니다.</div>
      </footer>
    </div>
  );
}
