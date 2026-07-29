import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import EmptyState from "./components/EmptyState.jsx";
import SummarySection from "./components/SummarySection.jsx";
import ZoneSection from "./components/ZoneSection.jsx";
import LandSection from "./components/LandSection.jsx";
import BuildingSection from "./components/BuildingSection.jsx";
import PriceSection from "./components/PriceSection.jsx";
import { normalizeLand, normalizeZone, normalizePrice } from "./data/normalize.js";
import { buildChart } from "./utils/format.js";
import { fetchLadfrl, fetchLandUse, fetchLandPriceByYears, fetchCoordinates, ldCodeFromPnu } from "./api/vworld.js";
import { searchAddress, fetchBuilding } from "./api/backend.js";

const SECTION_IDS = ["summary", "zone", "land", "bld", "price"];

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
    fetchLandPriceByYears(ldCode, years)
      .then((yearItems) => {
        const info = normalizePrice(yearItems);
        const hasAny = info.rows.some((r) => r.value != null);
        const latestYearWithData = [...years].reverse().find((y) => (info.breakdownByYear[y] || []).length > 0) ?? years[years.length - 1];
        patch(id, {
          price: hasAny ? "ok" : "empty",
          priceChart: hasAny ? buildChart(info.rows) : null,
          priceInfo: info,
          priceYear: latestYearWithData,
        });
      })
      .catch(() => patch(id, { price: "error" }));
  };

  // 건축물대장(F-03)은 juso.go.kr·건축HUB와 마찬가지로 배포 서버에서 차단된 적이 없어
  // 원래 설계대로 백엔드(FastAPI)를 거친다(api/backend.js) — VWorld 3종과는 다른 경로.
  const loadBuilding = (id, cand) => {
    fetchBuilding({ sigunguCd: cand.sigunguCd, bjdongCd: cand.bjdongCd, platGbCd: cand.platGbCd, bun: cand.bun, ji: cand.ji })
      .then((record) => patch(id, { bld: record.status, buildingInfo: record }))
      .catch(() => patch(id, { bld: "error" }));
  };

  // F-04 지도 좌표(Geocoder) — 선택된 주소 문자열을 그대로 넣어 얻는다(8-1 참조, PNU 불필요).
  // 4종 섹션과 달리 지도 위 보조 표시일 뿐이라 별도 status는 두지 않고, 실패하면 조용히 "—"로 남긴다.
  const loadCoordinates = (id, cand) => {
    fetchCoordinates(cand.road)
      .then((coords) => patch(id, { coords }))
      .catch(() => {});
  };

  const selectPriceYear = (id, year) => patch(id, { priceYear: year });

  const select = (c) => {
    const id = c.pnu;
    const alreadyOpen = tabs.some((t) => t.id === id);
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
        priceInfo: null,
        priceYear: null,
        buildingInfo: null,
        coords: null,
        fetchedAt: timestamp(),
      };
      setTabs((prev) => (prev.some((t) => t.id === id) ? prev : [...prev, tab]));
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

  const closeTab = (id) => {
    const i = tabs.findIndex((t) => t.id === id);
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (activeId === id) {
      setActiveId((next[i] || next[i - 1] || {}).id || null);
    }
  };

  const newTab = () => {
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

  const tab = tabs.find((t) => t.id === activeId) || null;
  const sel = tab ? tab.cand : null;
  const land = tab ? tab.landInfo : null;
  const zone = tab ? tab.zoneInfo : null;
  const building = tab ? tab.buildingInfo : null;
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
    ? ["포함", "저촉", "접함"].map((kind) => zone.rules.filter((r) => r.kind === kind).length + "건 " + kind).join(" · ")
    : "";
  const summaryItems = [
    { label: "토지이용계획", value: st.zone === "ok" ? zone.use : dash, sub: zoneRuleKinds, ready: st.zone === "ok" },
    {
      label: "토지대장",
      value: st.land === "ok" ? land.area : st.land === "empty" ? "정보 없음" : dash,
      sub: st.land === "ok" ? `지목 ${land.jimok} · ${land.owner}` : st.land === "empty" ? "등록된 토지대장 없음" : "조회 중",
      ready: st.land === "ok" || st.land === "empty",
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
        onSearch={() => runSearch()}
        searchState={search}
        candidates={candidates}
        onPickCandidate={select}
        sel={sel ? { road: sel.road, jibun: sel.jibun, pnu: sel.pnu } : null}
        activeSection={activeSection}
        onGoTo={goTo}
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
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 32px 0", display: "flex", flexDirection: "column", gap: 64 }}>
          <SummarySection items={summaryItems} />
          <ZoneSection status={st.zone} use={zone ? zone.use : ""} rules={zone ? zone.rules : []} />
          <LandSection status={st.land} rows={landRows} onRetry={() => retry("land")} />
          <BuildingSection
            status={st.bld}
            struct={building?.struct}
            purpose={building?.purpose}
            siteArea={building?.siteArea}
            buildArea={building?.buildArea}
            bcr={building?.bcr}
            far={building?.far}
            approved={building?.approved}
            floorSummary={building?.floorSummary}
            floors={building?.floors || []}
            onRetry={() => retry("bld")}
          />
          <PriceSection
            status={st.price}
            selShort={sel.jibun.split(" ").slice(-2).join(" ")}
            selCoords={tab?.coords ? `${tab.coords.lat}, ${tab.coords.lng}` : "—"}
            chart={chart}
            ldCodeNm={tab?.priceInfo?.ldCodeNm}
            ldCode={tab?.priceInfo?.ldCode}
            breakdownYears={tab?.priceChart?.priceRows?.map((r) => r.year) || []}
            breakdown={(tab?.priceInfo?.breakdownByYear || {})[tab?.priceYear]}
            selectedYear={tab?.priceYear}
            onSelectYear={(year) => selectPriceYear(activeId, year)}
          />

          <div style={{ borderTop: "1px solid #E5E1D8", paddingTop: 18, display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#A6A19A" }}>
            <div>조회 시각 {tab ? tab.fetchedAt : ""}</div>
          </div>
        </div>
      )}
    </div>
  );
}
