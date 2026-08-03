import { useEffect, useRef, useState } from "react";
import { normalizeLand, normalizeZone, normalizePriceRows } from "../data/normalize.js";
import { createTabState } from "../data/tab.js";
import { buildChart } from "../utils/format.js";
import { fetchLadfrl, fetchLandUse, fetchLandPriceHistory, fetchCoordinates } from "../api/vworld.js";
import { fetchBuilding } from "../api/backend.js";
import { withRetry } from "../utils/retry.js";
import { saveTabs, loadTabs } from "../utils/tabStorage.js";

// VWorld 직접 호출의 JSONP 타임아웃(api/jsonp.js)과 백엔드 httpx 타임아웃(backend/app/clients/base.py)이
// 둘 다 8000ms다 — 이보다 짧게 잡으면 실제로는 곧 성공할 응답(5~8초 사이 도착)을 이 타이머가 먼저
// "에러"로 표시해버린다(재시도하면 되는 것처럼 보이는 원인이 바로 이거였음). 항상 그 값보다 길게 유지한다.
const LOAD_TIMEOUT_MS = 9000;

// 열려있는 필지 탭들(브라우저 탭처럼 여러 주소를 오가는 UI)의 상태와, 각 탭의 토지대장/토지이용계획/
// 공시지가/건축물대장/지도좌표 조회·재시도·새로고침 후 복원(localStorage)까지 전부 이 훅이 담당한다.
// onActivate(cand | null)는 select()/newTab()/새로고침 복원으로 활성 탭이 바뀔 때마다 호출되므로,
// 검색창 텍스트처럼 다른 훅이 들고 있는 상태를 동기화하고 싶을 때 여기에 연결해서 쓴다.
export function useTabs({ onActivate }) {
  const [tabs, setTabs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const blankTabCounter = useRef(0);

  const patch = (id, obj) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...obj } : t)));
  };

  // 토지·임야정보 / 토지이용계획 / 개별공시지가는 VWorld를 프론트에서 JSONP로 직접 호출한다(api/vworld.js).
  // 백엔드를 거치지 않으므로 로딩·성공·데이터없음·오류 상태를 여기서 그대로 tabs 상태에 반영한다.
  // 응답이 오래 걸리면 로딩 스피너 대신 오류+재시도 UI를 보여준다. 실제 응답이 나중에 오면
  // clearTimeout으로 이 타이머를 취소하고 정상 결과로 덮어쓴다.
  const loadLand = (id) => {
    const timer = setTimeout(() => patch(id, { land: "error" }), LOAD_TIMEOUT_MS);
    withRetry(() => fetchLadfrl(id))
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
    withRetry(() => fetchLandUse(id))
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
    withRetry(() => fetchLandPriceHistory(id))
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
    withRetry(() => fetchBuilding({ sigunguCd: cand.sigunguCd, bjdongCd: cand.bjdongCd, platGbCd: cand.platGbCd, bun: cand.bun, ji: cand.ji }))
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

  const loadAll = (id, cand) => {
    loadLand(id);
    loadZone(id);
    loadPrice(id);
    loadBuilding(id, cand);
    loadCoordinates(id, cand);
  };

  const select = (c) => {
    const id = c.pnu;
    const alreadyOpen = tabs.some((t) => t.id === id);
    const activeTab = tabs.find((t) => t.id === activeId);
    const isBlankActive = !!activeTab && activeTab.cand === null;
    if (!alreadyOpen) {
      const tab = createTabState(c);
      // 새 탭(cand: null)에서 검색해 주소를 고른 경우 그 자리를 채우고, 그 외에는 탭을 새로 연다.
      setTabs((prev) => {
        if (prev.some((t) => t.id === id)) return prev;
        if (isBlankActive) return prev.map((t) => (t.id === activeId ? tab : t));
        return [...prev, tab];
      });
      loadAll(id, c);
    }
    setActiveId(id);
    onActivate?.(c);
  };

  // 새로고침 시 localStorage에 저장돼 있던 탭(주소 후보)들을 복원하고, 각 탭의 4종 데이터를 다시
  // 불러온다(저장해둔 옛 데이터를 쓰지 않고 새로 조회해서 최신 상태를 보여준다). 마운트 시 1회만 실행.
  useEffect(() => {
    const saved = loadTabs();
    if (!saved) return;

    const restoredTabs = saved.tabs.map(createTabState);
    setTabs(restoredTabs);
    const active = restoredTabs.find((t) => t.id === saved.activeId) || restoredTabs[0];
    setActiveId(active.id);
    onActivate?.(active.cand);

    restoredTabs.forEach((t) => loadAll(t.id, t.cand));
    // 마운트 시 1회만 — onActivate/loadAll은 매 렌더 새로 만들어지는 함수라 deps에 넣으면 매번 재실행된다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // tabs/activeId가 바뀔 때마다 저장한다.
  useEffect(() => {
    saveTabs(tabs, activeId);
  }, [tabs, activeId]);

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
    onActivate?.(null);
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

  return { tabs, activeId, setActiveId, select, closeTab, newTab, retry };
}
