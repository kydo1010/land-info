import Header from "./components/Header.jsx";
import EmptyState from "./components/EmptyState.jsx";
import SummarySection from "./components/SummarySection.jsx";
import ZoneSection from "./components/ZoneSection.jsx";
import LandSection from "./components/LandSection.jsx";
import BuildingSection from "./components/BuildingSection.jsx";
import PriceSection from "./components/PriceSection.jsx";
import { useAddressSearch } from "./hooks/useAddressSearch.js";
import { useScrollSpy } from "./hooks/useScrollSpy.js";
import { useReportExport } from "./hooks/useReportExport.js";
import { useTabs } from "./hooks/useTabs.js";
import { buildTabItems, computeLandPrice, buildSummaryItems, buildBuildingSummaryItem, buildLandRows } from "./data/summaryViewModel.js";

const SECTION_IDS = ["summary", "price", "zone", "land", "bld"];

export default function App() {
  const { query, setQuery, search, setSearch, candidates, runSearch, handleQueryChange } = useAddressSearch();
  // onActivate: select()/newTab()/새로고침 복원으로 활성 탭이 바뀔 때마다 검색창 텍스트를 그 탭의
  // 주소로(빈 탭이면 "") 동기화한다 — useTabs는 검색창 상태를 몰라도 되게 이 훅 밖에서 연결한다.
  const { tabs, activeId, setActiveId, select, closeTab, newTab, retry } = useTabs({
    onActivate: (cand) => setQuery(cand ? cand.jibun : ""),
  });
  const { activeSection, goTo } = useScrollSpy(SECTION_IDS);
  const { reportRef, expandAll, handlePrint, handleExportPdf } = useReportExport();

  const onPickCandidate = (c) => {
    select(c);
    setSearch("idle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tab = tabs.find((t) => t.id === activeId) || null;
  const sel = tab ? tab.cand : null;
  const land = tab ? tab.landInfo : null;
  const zone = tab ? tab.zoneInfo : null;
  const building = tab ? tab.buildingInfo : null;
  const st = tab || { zone: "idle", land: "idle", bld: "idle", price: "idle" };
  const chart = tab ? tab.priceChart : null;

  const tabItems = buildTabItems(tabs);
  const { landPriceLatest, landPriceRows } = computeLandPrice(land, chart, st.price);
  const summaryItems = buildSummaryItems({ zone, land, chart, st, landPriceLatest, onRetry: retry });
  const buildingSummaryItem = buildBuildingSummaryItem({ building, st, onRetry: retry });
  const landRows = buildLandRows(land);

  const onExportPdf = () => {
    if (sel) handleExportPdf(`${sel.jibun.replace(/\s+/g, "_")}_필지종합조회.pdf`);
  };

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
        onQueryChange={(e) => handleQueryChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") runSearch();
        }}
        onSearch={() => runSearch()}
        searchState={search}
        candidates={candidates}
        onPickCandidate={onPickCandidate}
        sel={sel ? { road: sel.road, jibun: sel.jibun, pnu: sel.pnu } : null}
        activeSection={activeSection}
        onGoTo={goTo}
        onExportPdf={onExportPdf}
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
            <div style={{ borderBottom: "1px solid #E5E1D8", paddingBottom: 20 }}>
              <div style={{ fontSize: 35, fontWeight: 700, letterSpacing: "-.025em" }}>{sel.road}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 }}>
                <div style={{ fontSize: 20, color: "#6B665E" }}>{sel.jibun}</div>
                <div style={{ fontSize: 15, color: "#8C877E" }}>PNU {sel.pnu}</div>
              </div>
            </div>
          )}
          <SummarySection items={summaryItems} buildingItem={buildingSummaryItem} />
          <PriceSection
            status={st.price}
            selShort={sel.jibun.split(" ").slice(-2).join(" ")}
            coords={tab?.coords}
            chart={chart}
            landPriceLatest={landPriceLatest}
            landPriceRows={landPriceRows}
            onRetry={() => retry("price")}
          />
          <ZoneSection
            status={st.zone}
            use={zone ? zone.use : ""}
            rules={zone ? zone.rules : []}
            onRetry={() => retry("zone")}
            forceExpanded={expandAll}
          />
          <LandSection status={st.land} rows={landRows} onRetry={() => retry("land")} />
          <BuildingSection status={st.bld} building={building} onRetry={() => retry("bld")} forceExpanded={expandAll} />

          <div style={{ borderTop: "1px solid #E5E1D8", paddingTop: 18, display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#A6A19A" }}>
            <div>조회 시각 {tab ? tab.fetchedAt : ""}</div>
          </div>
        </div>
      )}
    </div>
  );
}
