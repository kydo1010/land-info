// 공공 API 원본 응답(apiFixtures.js)을 화면에 쓰기 좋은 형태로 바꾼다.
// 실제 서비스에서는 이 역할을 백엔드 Schema 계층(9장)이 담당하게 된다 — 여기 있는 변환 로직은
// 그 백엔드 코드를 먼저 프론트에서 흉내내 본 것이라고 보면 된다.
import {
  LADFRL_RESPONSE,
  BR_TITLE_RESPONSE,
  BR_FLR_OULN_RESPONSE,
  INDVD_LAND_PRICE_RESPONSE,
  LAND_USE_RESPONSE,
} from "./apiFixtures.js";
import { num, sp } from "../utils/format.js";

const fmtDate = (yyyymmdd) => `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
const fmtArea = (v) => sp(`${num(Number(v))}㎡`);

export function normalizeLand(pnu) {
  const r = LADFRL_RESPONSE[pnu];
  if (!r) return null;
  const areaSqm = Number(r.lndpclAr);
  return {
    jimok: r.lndcgrCodeNm,
    area: fmtArea(r.lndpclAr),
    areaPyeong: `약 ${(areaSqm * 0.3025).toLocaleString("en-US", { maximumFractionDigits: 1 })}평`,
    owner: r.posesnSeCodeNm,
  };
}

export function normalizeBuilding(pnu) {
  const title = BR_TITLE_RESPONSE[pnu];
  if (!title || title.totalCount === "0" || !title.item) {
    return { status: "empty" };
  }
  const t = title.item;
  const flr = BR_FLR_OULN_RESPONSE[pnu];
  const floors = (flr?.items || []).map((f) => ({
    floor: `${f.flrGbCdNm} ${f.flrNoNm}`,
    purpose: f.mainPurpsCdNm,
    struct: f.strctCdNm,
    area: Number(f.area).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  }));
  return {
    status: "ok",
    struct: t.strctCdNm,
    purpose: t.mainPurpsCdNm,
    siteArea: fmtArea(t.platArea),
    buildArea: fmtArea(t.archArea),
    bcr: sp(`${t.bcRat}%`),
    far: sp(`${t.vlRat}%`),
    approved: fmtDate(t.useAprDay),
    floorSummary: sp(`지하 ${t.ugrndFlrCnt}층 / 지상 ${t.grndFlrCnt}층 · 연면적 ${fmtArea(t.totArea)}`),
    floors,
  };
}

export function normalizeZone(pnu) {
  const r = LAND_USE_RESPONSE[pnu];
  if (!r) return null;
  const [zoneItem, ...regItems] = r.items;
  return {
    use: zoneItem.prposAreaDstrcCodeNm,
    rules: regItems.map((it, i) => ({
      no: String(i + 1).padStart(2, "0"),
      name: it.prposAreaDstrcCodeNm,
      kind: it.cnflcAtNm,
    })),
  };
}

// 4개 후보가 모두 같은 법정동(ldCode)이라 문서대로라면 값이 하나로 공유된다 — pnu와 무관하게 호출한다.
export function normalizePriceRows() {
  const years = [2022, 2023, 2024, 2025, 2026];
  return years.map((year) => {
    const r = INDVD_LAND_PRICE_RESPONSE[year];
    return { year, value: r ? Number(r.ladPblntfPclnd) : null };
  });
}
