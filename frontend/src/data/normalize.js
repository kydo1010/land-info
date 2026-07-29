// 공공 API 원본 응답을 화면에 쓰기 좋은 형태로 바꾼다.
// 토지대장·토지이용계획·개별공시지가는 프론트에서 VWorld를 JSONP로 직접 호출해 받은 실제 응답
// (api/vworld.js)을 여기서 변환한다. 건축물대장은 백엔드(api/backend.js)의 BuildingRecord가
// 이미 이 파일과 같은 모양으로 내려오므로(backend/app/schemas/building.py 참조) 별도 변환이 필요 없다.
import { num, sp } from "../utils/format.js";

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

const avgPrice = (items) => (items.length ? Math.round(items.reduce((acc, it) => acc + Number(it.ladPblntfPclnd), 0) / items.length) : null);

// 개별공시지가 API(getIndvdLandPrice) 5개년 원본 응답(api/vworld.js의 fetchLandPriceByYears 결과,
// [{year, items}])을 화면 표시용으로 변환한다. 필지 단위 조회가 불가능해(8-5 참조) 법정동(ldCode)
// 단위로 재설계됐다 — rows는 연도별 법정동 평균(buildChart용), breakdownByYear는 연도별 지목·용도지역
// 조합별 세부 내역이다.
export function normalizePrice(yearItems) {
  const withData = yearItems.find((y) => y.items.length > 0);
  const sample = withData ? withData.items[0] : null;
  const rows = yearItems.map(({ year, items }) => ({ year, value: avgPrice(items) }));
  const breakdownByYear = {};
  yearItems.forEach(({ year, items }) => {
    breakdownByYear[year] = items.map((it) => ({
      jimok: it.lndcgrCodeNm,
      use: it.prposAreaNm,
      area: fmtArea(it.ladAr),
      price: it.ladPblntfPclnd ? num(Number(it.ladPblntfPclnd)) : "—",
    }));
  });
  return { ldCode: sample?.ldCode ?? null, ldCodeNm: sample?.ldCodeNm ?? null, rows, breakdownByYear };
}
