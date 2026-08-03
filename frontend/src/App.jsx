import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Header from "./components/Header.jsx";
import EmptyState from "./components/EmptyState.jsx";
import SummarySection from "./components/SummarySection.jsx";
import ZoneSection from "./components/ZoneSection.jsx";
import LandSection from "./components/LandSection.jsx";
import BuildingSection from "./components/BuildingSection.jsx";
import PriceSection from "./components/PriceSection.jsx";
import { normalizeLand, normalizeZone, normalizePriceRows } from "./data/normalize.js";
import { buildChart } from "./utils/format.js";
import { fetchLadfrl, fetchLandUse, fetchLandPriceHistory, fetchCoordinates } from "./api/vworld.js";
import { fetchBuilding } from "./api/backend.js";
import { searchAddress } from "./api/search.js";
import { exportElementToPdf } from "./utils/exportPdf.js";

const SECTION_IDS = ["summary", "zone", "land", "bld", "price"];
const LOAD_TIMEOUT_MS = 5000;

function timestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}시 ${p(d.getMinutes())}분 ${p(d.getSeconds())}초`;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("idle");
  const [candidates, setCandidates] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeSection, setActiveSection] = useState("summary");
  const [expandAll, setExpandAll] = useState(false);
  const blankTabCounter = useRef(0);
  const reportRef = useRef(null);

  const patch = (id, obj) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...obj } : t)));
  };

  // 토지·임야정보 / 토지이용계획 / 개별공시지가는 VWorld를 프론트에서 JSONP로 직접 호출한다(api/vworld.js).
  // 백엔드를 거치지 않으므로 로딩·성공·데이터없음·오류 상태를 여기서 그대로 tabs 상태에 반영한다.
  // 3초 안에 응답이 오지 않으면 로딩 스피너 대신 오류+재시도 UI를 보여준다. 실제 응답이 나중에
  // 오면 clearTimeout으로 이 타이머를 취소하고 정상 결과로 덮어쓴다.
  const loadLand = (id) => {
    const timer = setTimeout(() => patch(id, { land: "error" }), LOAD_TIMEOUT_MS);
    fetchLadfrl(id)
      .then((raw) => {
        clearTimeout(timer);
        patch(id, { land: raw ? "ok" : "empty", landInfo: normalizeLand(raw) });
      })
      .catch(() => {
        clearTimeout(timer);
        patch(id, { land: "error" });
      });
  };

  const loadZone = (id) => {
    const timer = setTimeout(() => patch(id, { zone: "error" }), LOAD_TIMEOUT_MS);
    fetchLandUse(id)
      .then((items) => {
        clearTimeout(timer);
        patch(id, { zone: items.length ? "ok" : "empty", zoneInfo: normalizeZone(items) });
      })
      .catch(() => {
        clearTimeout(timer);
        patch(id, { zone: "error" });
      });
  };

  // 개별공시지가 — getIndvdLandPriceAttr로 필지(pnu) 단위 조회가 가능함이 확인됐다(8-8 참조).
  const loadPrice = (id) => {
    const timer = setTimeout(() => patch(id, { price: "error" }), LOAD_TIMEOUT_MS);
    const thisYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => thisYear - 4 + i);
    fetchLandPriceHistory(id)
      .then((records) => {
        clearTimeout(timer);
        const rows = normalizePriceRows(records, years);
        const hasAny = rows.some((r) => r.value != null);
        patch(id, { price: hasAny ? "ok" : "empty", priceChart: hasAny ? buildChart(rows) : null });
      })
      .catch(() => {
        clearTimeout(timer);
        patch(id, { price: "error" });
      });
  };

  // 건축물대장(F-03)은 juso.go.kr·건축HUB와 마찬가지로 배포 서버에서 차단된 적이 없어
  // 원래 설계대로 백엔드(FastAPI)를 거친다(api/backend.js) — VWorld 3종과는 다른 경로.
  const loadBuilding = (id, cand) => {
    const timer = setTimeout(() => patch(id, { bld: "error" }), LOAD_TIMEOUT_MS);
    fetchBuilding({ sigunguCd: cand.sigunguCd, bjdongCd: cand.bjdongCd, platGbCd: cand.platGbCd, bun: cand.bun, ji: cand.ji })
      .then((record) => {
        clearTimeout(timer);
        patch(id, { bld: record.status, buildingInfo: record });
      })
      .catch(() => {
        clearTimeout(timer);
        patch(id, { bld: "error" });
      });
  };

  // F-04 지도 좌표(Geocoder) — 선택된 주소 문자열을 그대로 넣어 얻는다(8-1 참조, PNU 불필요).
  // cand.addressType은 road/jibun 중 어느 쪽이 완전한 형태로 채워졌는지를 가리킨다(api/search.js 참조) —
  // 그쪽을 Geocoder의 type 파라미터와 함께 보내야 정확히 지오코딩된다.
  // 4종 섹션과 달리 지도 위 보조 표시일 뿐이라 별도 status는 두지 않고, 실패하면 조용히 "—"로 남긴다.
  const loadCoordinates = (id, cand) => {
    const isRoad = cand.addressType !== "parcel";
    fetchCoordinates(isRoad ? cand.road : cand.jibun, isRoad ? "road" : "parcel")
      .then((coords) => patch(id, { coords }))
      .catch(() => {});
  };

  const select = (c) => {
    const id = c.pnu;
    const alreadyOpen = tabs.some((t) => t.id === id);
    const activeTab = tabs.find((t) => t.id === activeId);
    const isBlankActive = !!activeTab && activeTab.cand === null;
    if (!alreadyOpen) {
      const tab = {
        id,
        cand: c,
        zone: "loading",
        land: "loading",
        bld: "loading",
        price: "loading",
        zoneInfo: null,
        landInfo: null,
        priceChart: null,
        buildingInfo: null,
        coords: null,
        fetchedAt: timestamp(),
      };
      // 새 탭(cand: null)에서 검색해 주소를 고른 경우 그 자리를 채우고, 그 외에는 탭을 새로 연다.
      setTabs((prev) => {
        if (prev.some((t) => t.id === id)) return prev;
        if (isBlankActive) return prev.map((t) => (t.id === activeId ? tab : t));
        return [...prev, tab];
      });
      loadLand(id);
      loadZone(id);
      loadPrice(id);
      loadBuilding(id, c);
      loadCoordinates(id, c);
    }
    setActiveId(id);
    setSearch("idle");
    setQuery(c.jibun);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const onScroll = () => {
      let cur = SECTION_IDS[0];
      SECTION_IDS.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 240) cur = id;
      });
      setActiveSection((prev) => (prev === cur ? prev : cur));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 인쇄(브라우저 Ctrl+P 포함) 직전/직후에 더보기로 접힌 목록(토지이용계획 규제, 층별개요)을
  // 강제로 펼친다. flushSync로 동기 반영해야 브라우저의 인쇄 렌더링이 펼쳐진 상태를 그대로 캡처한다.
  useEffect(() => {
    const onBeforePrint = () => flushSync(() => setExpandAll(true));
    const onAfterPrint = () => flushSync(() => setExpandAll(false));
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, []);

  const closeTab = (id) => {
    const i = tabs.findIndex((t) => t.id === id);
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (activeId === id) {
      setActiveId((next[i] || next[i - 1] || {}).id || null);
    }
  };

  const newTab = () => {
    const id = `blank-${blankTabCounter.current++}`;
    const tab = {
      id,
      cand: null,
      zone: "idle",
      land: "idle",
      bld: "idle",
      price: "idle",
      zoneInfo: null,
      landInfo: null,
      priceChart: null,
      buildingInfo: null,
      coords: null,
      fetchedAt: null,
    };
    setTabs((prev) => [...prev, tab]);
    setActiveId(id);
    setQuery("");
    setSearch("idle");
    setCandidates([]);
  };

  // qOverride: EmptyState의 예시 버튼처럼 setQuery 직후 바로 검색해야 할 때, setQuery의 상태
  // 반영을 기다리지 않고 그 값으로 바로 검색하기 위해 받는다(state 클로저 지연 문제 회피).
  const runSearch = (qOverride) => {
    const q = (qOverride ?? query).trim();
    if (!q) {
      setSearch("none");
      setCandidates([]);
      return;
    }
    setSearch("loading");
    searchAddress(q)
      .then((results) => {
        setCandidates(results);
        setSearch(results.length ? "results" : "none");
      })
      .catch(() => setSearch("error"));
  };

  const retry = (key) => {
    if (!activeId) return;
    patch(activeId, { [key]: "loading" });
    if (key === "land") return loadLand(activeId);
    if (key === "zone") return loadZone(activeId);
    if (key === "price") return loadPrice(activeId);
    if (key === "bld") {
      const t = tabs.find((x) => x.id === activeId);
      if (t) loadBuilding(activeId, t.cand);
    }
  };

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 176, behavior: "smooth" });
  };

  const handlePrint = () => window.print();

  // 더보기로 접힌 목록을 강제로 펼친 뒤(flushSync로 동기 반영) 리포트 DOM을 캔버스로 캡처해 PDF로 내려받는다.
  const handleExportPdf = async () => {
    if (!reportRef.current || !sel) return;
    flushSync(() => setExpandAll(true));
    try {
      await exportElementToPdf(reportRef.current, `${sel.jibun.replace(/\s+/g, "_")}_필지종합조회.pdf`);
    } finally {
      setExpandAll(false);
    }
  };

  const tab = tabs.find((t) => t.id === activeId) || null;
  const sel = tab ? tab.cand : null;
  const land = tab ? tab.landInfo : null;
  const zone = tab ? tab.zoneInfo : null;
  const building = tab ? tab.buildingInfo : null;
  const st = tab || { zone: "idle", land: "idle", bld: "idle", price: "idle" };

  const chart = tab ? tab.priceChart : null;
  const dash = "—";

  const tabItems = tabs.map((t) => {
    if (!t.cand) {
      return { id: t.id, title: "새 탭", subtitle: "주소를 검색하세요", zone: "idle", land: "idle", bld: "idle", price: "idle" };
    }
    const busy = [t.zone, t.land, t.bld, t.price].some((x) => x === "loading");
    const zoneLabel = t.zoneInfo ? t.zoneInfo.use : dash;
    const priceLabel = t.priceChart ? `${t.priceChart.priceLatest}원/㎡` : dash;
    return {
      id: t.id,
      title: t.cand.road.replace("서울특별시 ", ""),
      subtitle: busy ? "조회 중…" : `${zoneLabel} · ${priceLabel}`,
      zone: t.zone,
      land: t.land,
      bld: t.bld,
      price: t.price,
    };
  });

  const zoneRuleKinds = zone
    ? ["포함", "저촉", "접함"].map((kind) => zone.rules.filter((r) => r.kind === kind).length + "건 " + kind).join(" · ")
    : "";
  const summaryItems = [
    {
      label: "토지이용계획",
      value: st.zone === "ok" ? zone.use : dash,
      sub: zoneRuleKinds,
      ready: st.zone === "ok",
      status: st.zone,
      onRetry: () => retry("zone"),
    },
    {
      label: "토지대장",
      value: st.land === "ok" ? land.area : st.land === "empty" ? "정보 없음" : dash,
      sub: st.land === "ok" ? `지목 ${land.jimok} · ${land.owner}` : st.land === "empty" ? "등록된 토지대장 없음" : "조회 중",
      ready: st.land === "ok" || st.land === "empty",
      status: st.land,
      onRetry: () => retry("land"),
    },
    {
      label: "건축물대장",
      value: st.bld === "ok" ? building.purpose : st.bld === "empty" ? "건축물 없음" : dash,
      sub: st.bld === "ok" ? building.floorSummary.split(" · ")[0] : st.bld === "empty" ? "나지" : "조회 중",
      ready: st.bld === "ok" || st.bld === "empty",
      status: st.bld,
      onRetry: () => retry("bld"),
    },
    {
      label: "공시지가",
      value: st.price === "ok" ? chart.priceLatest : st.price === "empty" ? "정보 없음" : dash,
      sub: st.price === "ok" ? `${chart.priceLatestYear} · ${chart.priceDelta.replace("전년 대비 ", "전년비 ")}` : st.price === "empty" ? "등록된 이력 없음" : "조회 중",
      ready: st.price === "ok" || st.price === "empty",
      status: st.price,
      onRetry: () => retry("price"),
    },
  ];

  const landRows = land
    ? [
        { label: "지목", value: land.jimok },
        { label: "면적", value: land.area, note: land.areaPyeong },
        { label: "소유구분", value: land.owner },
      ]
    : [];

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: "#171614", fontFamily: "'Pretendard Variable', Pretendard, sans-serif", paddingBottom: 120 }}>
      <Header
        tabs={tabItems}
        activeId={activeId}
        onFocusTab={(id) => {
          setActiveId(id);
          setSearch("idle");
          const t = tabs.find((x) => x.id === id);
          setQuery(t && t.cand ? t.cand.jibun : "");
        }}
        onCloseTab={closeTab}
        onNewTab={newTab}
        query={query}
        onQueryChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") runSearch();
        }}
        onSearch={() => runSearch()}
        searchState={search}
        candidates={candidates}
        onPickCandidate={select}
        sel={sel ? { road: sel.road, jibun: sel.jibun, pnu: sel.pnu } : null}
        activeSection={activeSection}
        onGoTo={goTo}
        onExportPdf={handleExportPdf}
        onPrint={handlePrint}
      />

      {!sel && (
        <EmptyState
          onUseExample={(label) => {
            setQuery(label);
            runSearch(label);
          }}
        />
      )}

      {sel && (
        <div
          id="report-content"
          ref={reportRef}
          style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 32px 0", display: "flex", flexDirection: "column", gap: 64 }}
        >
          {/* 평소엔 헤더가 같은 정보를 보여주므로 숨겨서 중복을 피하고, PDF/인쇄 캡처 순간(expandAll)에만 렌더링해
              헤더가 빠진 출력물에도 어느 필지 보고서인지 나오게 한다. */}
          {expandAll && (
            <div style={{ borderBottom: "1px solid #E5E1D8", paddingBottom: 20, display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.025em" }}>{sel.road}</div>
              <div style={{ fontSize: 14, color: "#6B665E" }}>{sel.jibun.replace("서울특별시 ", "")}</div>
              <div style={{ marginLeft: "auto", fontSize: 12, color: "#8C877E" }}>PNU {sel.pnu}</div>
            </div>
          )}
          <SummarySection items={summaryItems} />
          <ZoneSection
            status={st.zone}
            use={zone ? zone.use : ""}
            rules={zone ? zone.rules : []}
            onRetry={() => retry("zone")}
            forceExpanded={expandAll}
          />
          <LandSection status={st.land} rows={landRows} onRetry={() => retry("land")} />
          <BuildingSection status={st.bld} building={building} onRetry={() => retry("bld")} forceExpanded={expandAll} />
          <PriceSection
            status={st.price}
            selShort={sel.jibun.split(" ").slice(-2).join(" ")}
            coords={tab?.coords}
            chart={chart}
            onRetry={() => retry("price")}
          />

          <div style={{ borderTop: "1px solid #E5E1D8", paddingTop: 18, display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#A6A19A" }}>
            <div>조회 시각 {tab ? tab.fetchedAt : ""}</div>
          </div>
        </div>
      )}
    </div>
  );
}
