import { num } from "../utils/format.js";

const dash = "—";

// 헤더의 탭 바(브라우저 탭처럼 여러 필지를 오가는 UI)에 쓰는 요약 — 원본 tabs 배열을 그대로 넘기지
// 않고 Header가 원하는 모양(제목/부제/4종 상태)으로만 추려서 넘긴다.
export function buildTabItems(tabs) {
  return tabs.map((t) => {
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
}

// 토지 공시가격 = 토지 면적(㎡, 토지대장) × 개별공시지가(원/㎡, 공시지가) — 총면적에 대한 가격이라
// 개별공시지가(단위면적당 가격)와 달리 "평당" 값이 성립하지 않는다(그래서 평 단위 병기가 없다).
// 두 값은 서로 독립적으로 조회되므로 하나가 아직 없거나(로딩/오류) 필지에 없으면(empty) 계산하지
// 않고 dash로 남긴다.
export function computeLandPrice(land, chart, priceStatus) {
  const landAreaSqm = land ? land.areaSqm : null;
  const formatWon = (v) => `${num(Math.round(v))}원`;
  const landPriceLatest =
    priceStatus === "ok" && landAreaSqm != null ? formatWon(landAreaSqm * chart.priceLatestValue) : dash;
  const landPriceRows =
    priceStatus === "ok"
      ? chart.priceRows.map((r) => ({
          year: r.year,
          value: landAreaSqm != null && r.rawValue != null ? formatWon(landAreaSqm * r.rawValue) : dash,
        }))
      : [];
  return { landPriceLatest, landPriceRows };
}

// 요약 섹션 1행(4열) — 토지이용계획/토지대장/토지 개별공시지가/토지 공시가격.
export function buildSummaryItems({ zone, land, chart, st, landPriceLatest, onRetry }) {
  const zoneRuleKinds = zone
    ? ["포함", "저촉", "접함"].map((kind) => zone.rules.filter((r) => r.kind === kind).length + "건 " + kind).join(" · ")
    : "";

  return [
    {
      label: "토지이용계획",
      value: st.zone === "ok" ? zone.use : dash,
      sub: zoneRuleKinds,
      ready: st.zone === "ok",
      status: st.zone,
      onRetry: () => onRetry("zone"),
    },
    {
      label: "토지대장",
      value: st.land === "ok" ? land.area : st.land === "empty" ? "정보 없음" : dash,
      valueNote: st.land === "ok" ? land.areaPyeong : null,
      sub: st.land === "ok" ? `지목 ${land.jimok} · ${land.owner}` : st.land === "empty" ? "등록된 토지대장 없음" : "조회 중",
      ready: st.land === "ok" || st.land === "empty",
      status: st.land,
      onRetry: () => onRetry("land"),
    },
    {
      label: "토지 개별공시지가",
      value: st.price === "ok" ? `${chart.priceLatest}원/㎡` : st.price === "empty" ? "정보 없음" : dash,
      valueNote: st.price === "ok" ? `${chart.priceLatestPyeong}원/평` : null,
      sub: st.price === "ok" ? `${chart.priceLatestYear} · ${chart.priceDelta.replace("전년 대비 ", "전년비 ")}` : st.price === "empty" ? "등록된 이력 없음" : "조회 중",
      ready: st.price === "ok" || st.price === "empty",
      status: st.price,
      onRetry: () => onRetry("price"),
    },
    {
      label: "토지 공시가격",
      value: st.price === "ok" ? landPriceLatest : st.price === "empty" ? "정보 없음" : dash,
      sub: st.price === "ok" ? `${chart.priceLatestYear} 기준` : st.price === "empty" ? "등록된 이력 없음" : "조회 중",
      ready: st.price === "ok" || st.price === "empty",
      status: st.price,
      onRetry: () => onRetry("price"),
    },
  ];
}

// 요약 섹션 2행 — 건축물대장. status가 "ok"면 SummarySection이 building 필드로 4열 표(주구조/주용도/
// 건축 규모/건폐율·용적률)를 대신 그리므로 value/sub/ready는 loading·empty·error 상태의 대체
// 타일에서만 쓰인다.
export function buildBuildingSummaryItem({ building, st, onRetry }) {
  return {
    label: "건축물대장",
    value: st.bld === "empty" ? "건축물 없음" : dash,
    sub: st.bld === "empty" ? "나지" : "조회 중",
    ready: st.bld === "empty",
    status: st.bld,
    onRetry: () => onRetry("bld"),
    building: st.bld === "ok" ? building : null,
  };
}

// 토지대장 섹션의 표 행. "면적"은 평(areaPyeong)을 주 표시로, ㎡(area)를 그 아래 note로 둔다.
export function buildLandRows(land) {
  if (!land) return [];
  return [
    { label: "지목", value: land.jimok },
    { label: "면적", value: land.areaPyeong, note: land.area },
    { label: "소유구분", value: land.owner },
  ];
}
