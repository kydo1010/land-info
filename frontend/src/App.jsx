import { useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import EmptyState from "./components/EmptyState.jsx";
import SummarySection from "./components/SummarySection.jsx";
import ZoneSection from "./components/ZoneSection.jsx";
import LandSection from "./components/LandSection.jsx";
import BuildingSection from "./components/BuildingSection.jsx";
import PriceSection from "./components/PriceSection.jsx";
import { CANDS } from "./data/mockData.js";
import { normalizeLand, normalizeBuilding, normalizeZone } from "./data/normalize.js";
import { buildChart } from "./utils/format.js";
import { fetchLadfrl, fetchLandUse, fetchLandPriceRows, ldCodeFromPnu } from "./api/vworld.js";

const SECTION_IDS = ["summary", "zone", "land", "bld", "price"];

function timestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}시 ${p(d.getMinutes())}분 ${p(d.getSeconds())}초`;
}

export default function App() {
  const [query, setQuery] = useState("역삼동 737");
  const [search, setSearch] = useState("idle");
  const [tabs, setTabs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeSection, setActiveSection] = useState("summary");

  const timersRef = useRef({});

  const patch = (id, obj) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...obj } : t)));
  };

  // 토지·임야정보 / 토지이용계획 / 개별공시지가는 VWorld를 프론트에서 JSONP로 직접 호출한다(api/vworld.js).
  // 백엔드를 거치지 않으므로 로딩·성공·데이터없음·오류 상태를 여기서 그대로 tabs 상태에 반영한다.
  const loadLand = (id) => {
    fetchLadfrl(id)
      .then((raw) => patch(id, { land: raw ? "ok" : "empty", landInfo: normalizeLand(raw) }))
      .catch(() => patch(id, { land: "error" }));
  };

  const loadZone = (id) => {
    fetchLandUse(id)
      .then((items) => patch(id, { zone: items.length ? "ok" : "empty", zoneInfo: normalizeZone(items) }))
      .catch(() => patch(id, { zone: "error" }));
  };

  // 개별공시지가는 필지 단위 조회가 불가능해 법정동(ldCode) 단위로 재설계됐다(planning.md 8-5, F-04 참조).
  const loadPrice = (id) => {
    const ldCode = ldCodeFromPnu(id);
    const thisYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => thisYear - 4 + i);
    fetchLandPriceRows(ldCode, years)
      .then((rows) => {
        const hasAny = rows.some((r) => r.value != null);
        patch(id, { price: hasAny ? "ok" : "empty", priceChart: hasAny ? buildChart(rows) : null });
      })
      .catch(() => patch(id, { price: "error" }));
  };

  const select = (c, quiet = false) => {
    const id = c.pnu;
    const alreadyOpen = tabs.some((t) => t.id === id);
    if (!alreadyOpen) {
      const bldStatus = normalizeBuilding(id).status;
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
        fetchedAt: timestamp(),
      };
      setTabs((prev) => (prev.some((t) => t.id === id) ? prev : [...prev, tab]));
      timersRef.current[id] = [setTimeout(() => patch(id, { bld: bldStatus }), 1900)];
      loadLand(id);
      loadZone(id);
      loadPrice(id);
    }
    setActiveId(id);
    setSearch("idle");
    setQuery(c.jibun);
    if (!quiet) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const didAutoSelect = useRef(false);
  // 데모용: 첫 진입 시 기본 주소 하나를 자동으로 선택해 화면을 바로 보여준다.
  // 실제 백엔드 연동 후에는 이 자동 선택을 제거하고 빈 검색창으로 시작하면 된다.
  useEffect(() => {
    if (didAutoSelect.current) return;
    didAutoSelect.current = true;
    select(CANDS[0], true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const closeTab = (id) => {
    (timersRef.current[id] || []).forEach(clearTimeout);
    delete timersRef.current[id];
    const i = tabs.findIndex((t) => t.id === id);
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (activeId === id) {
      setActiveId((next[i] || next[i - 1] || {}).id || null);
    }
  };

  const newTab = () => {
    setSearch("results");
    setQuery("");
  };

  const runSearch = () => {
    setSearch("loading");
    setTimeout(() => setSearch(query.trim() ? "results" : "none"), 320);
  };

  const retry = (key) => {
    if (!activeId) return;
    patch(activeId, { [key]: "loading" });
    if (key === "land") return loadLand(activeId);
    if (key === "zone") return loadZone(activeId);
    if (key === "price") return loadPrice(activeId);
    const t = setTimeout(() => patch(activeId, { [key]: "ok" }), 900);
    timersRef.current[activeId] = [...(timersRef.current[activeId] || []), t];
  };

  const goTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 176, behavior: "smooth" });
  };

  const tab = tabs.find((t) => t.id === activeId) || null;
  const sel = tab ? tab.cand : null;
  const pnu = sel ? sel.pnu : CANDS[0].pnu;
  const land = tab ? tab.landInfo : null;
  const zone = tab ? tab.zoneInfo : null;
  const building = normalizeBuilding(pnu);
  const st = tab || { zone: "idle", land: "idle", bld: "idle", price: "idle" };

  const chart = tab ? tab.priceChart : null;
  const dash = "—";

  const tabItems = tabs.map((t) => {
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
    ? ["포함", "저촉", "접합"].map((kind) => zone.rules.filter((r) => r.kind === kind).length + "건 " + kind).join(" · ")
    : "";
  const summaryItems = [
    { label: "토지이용계획", value: st.zone === "ok" ? zone.use : dash, sub: zoneRuleKinds, ready: st.zone === "ok" },
    {
      label: "토지대장",
      value: st.land === "ok" ? land.area : dash,
      sub: st.land === "ok" ? `지목 ${land.jimok} · ${land.owner}` : "조회 중",
      ready: st.land === "ok",
    },
    {
      label: "건축물대장",
      value: st.bld === "ok" ? building.purpose : st.bld === "empty" ? "건축물 없음" : dash,
      sub: st.bld === "ok" ? building.floorSummary.split(" · ")[0] : st.bld === "empty" ? "나지" : "조회 중",
      ready: st.bld === "ok" || st.bld === "empty",
    },
    {
      label: "공시지가",
      value: st.price === "ok" ? chart.priceLatest : dash,
      sub: st.price === "ok" ? `${chart.priceLatestYear} · ${chart.priceDelta.replace("전년 대비 ", "전년비 ")}` : "조회 중",
      ready: st.price === "ok",
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
          if (t) setQuery(t.cand.jibun);
        }}
        onCloseTab={closeTab}
        onNewTab={newTab}
        query={query}
        onQueryChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") runSearch();
        }}
        onSearch={runSearch}
        searchState={search}
        candidates={CANDS}
        onPickCandidate={select}
        sel={sel ? { road: sel.road, jibun: sel.jibun, pnu: sel.pnu } : null}
        activeSection={activeSection}
        onGoTo={goTo}
      />

      {!sel && (
        <EmptyState
          onUseExample={(label) => {
            setQuery(label);
            runSearch();
          }}
        />
      )}

      {sel && (
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 32px 0", display: "flex", flexDirection: "column", gap: 64 }}>
          <SummarySection items={summaryItems} />
          <ZoneSection status={st.zone} use={zone ? zone.use : ""} rules={zone ? zone.rules : []} />
          <LandSection status={st.land} rows={landRows} onRetry={() => retry("land")} />
          <BuildingSection
            status={st.bld}
            struct={building.struct}
            purpose={building.purpose}
            siteArea={building.siteArea}
            buildArea={building.buildArea}
            bcr={building.bcr}
            far={building.far}
            approved={building.approved}
            floorSummary={building.floorSummary}
            floors={building.floors}
            onRetry={() => retry("bld")}
          />
          <PriceSection
            status={st.price}
            selShort={sel.jibun.split(" ").slice(-2).join(" ")}
            selCoords={`${sel.lat}, ${sel.lng}`}
            chart={chart}
          />

          <div style={{ borderTop: "1px solid #E5E1D8", paddingTop: 18, display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#A6A19A" }}>
            <div>조회 시각 {tab ? tab.fetchedAt : ""}</div>
          </div>
        </div>
      )}
    </div>
  );
}
