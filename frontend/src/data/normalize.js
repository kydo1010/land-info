// 공공 API 원본 응답을 화면에 쓰기 좋은 형태로 바꾼다.
// 토지대장·토지이용계획은 이제 프론트에서 VWorld를 JSONP로 직접 호출해 받은 실제 응답(api/vworld.js)을
// 그대로 넘겨받아 변환한다. 건축물대장은 아직 건축HUB 연동 전이라 apiFixtures.js 목업을 그대로 쓴다.
import { BR_TITLE_RESPONSE, BR_FLR_OULN_RESPONSE } from "./apiFixtures.js";
import { num, sp } from "../utils/format.js";

const fmtDate = (yyyymmdd) => `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
const fmtArea = (v) => sp(`${num(Number(v))}㎡`);

// 토지·임야정보 API(ladfrlList) 응답 항목 1건을 화면 표시용으로 변환한다.
export function normalizeLand(raw) {
  if (!raw) return null;
  const areaSqm = Number(raw.lndpclAr);
  return {
    jimok: raw.lndcgrCodeNm,
    area: fmtArea(raw.lndpclAr),
    areaPyeong: `약 ${(areaSqm * 0.3025).toLocaleString("en-US", { maximumFractionDigits: 1 })}평`,
    owner: raw.posesnSeCodeNm,
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

// 토지이용계획 API(getLandUseAttr) 응답 배열(items)을 화면 표시용으로 변환한다.
// 응답에 용도지역·용도지구·규제가 구분 없이 한 배열로 섞여 내려오고 이를 구분하는 코드 체계가
// 문서·응답 어디에도 없어(11장 참조), 첫 번째 항목을 용도지역으로, 나머지를 규제 목록으로 다루는
// 추정을 그대로 쓴다 — 실제 데이터로도 이 구분이 맞는지는 여전히 미확인.
export function normalizeZone(items) {
  if (!items || !items.length) return null;
  const [zoneItem, ...regItems] = items;
  return {
    use: zoneItem.prposAreaDstrcCodeNm,
    rules: regItems.map((it, i) => ({
      no: String(i + 1).padStart(2, "0"),
      name: it.prposAreaDstrcCodeNm,
      kind: it.cnflcAtNm,
    })),
  };
}
