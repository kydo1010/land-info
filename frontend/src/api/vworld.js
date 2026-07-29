// VWorld 국가중점데이터 3종(토지·임야정보/개별공시지가/토지이용계획)을 브라우저에서 직접 호출한다.
// 백엔드 서버를 거치면 서버의 아웃바운드 IP가 vworld.kr 쪽에서 차단당하는 문제가 있어(2026-07-29),
// 우회책으로 프론트엔드가 VWorld를 JSONP로 바로 호출한다 — planning.md 8-5 참조.
//
// 주의: VITE_ 접두사가 붙은 값은 빌드 시 번들에 그대로 박혀 브라우저에서 누구나 볼 수 있다.
// VWorld 키는 발급 시 등록한 도메인(VITE_VWORLD_DOMAIN)의 Referer로만 동작하도록 서버가 검증하므로
// (8-5 확인), 이 키를 그대로 복사해 다른 도메인에서 쓰더라도 정상 동작하지 않는다.
import { jsonp } from "./jsonp.js";

const BASE_URL = "https://api.vworld.kr/ned/data";
const KEY = import.meta.env.VITE_VWORLD_API_KEY;
const DOMAIN = import.meta.env.VITE_VWORLD_DOMAIN;

function baseParams(extra) {
  return { format: "json", key: KEY, domain: DOMAIN, pageNo: "1", ...extra };
}

export function ldCodeFromPnu(pnu) {
  return pnu.slice(0, 10);
}

// 토지·임야정보 — https://api.vworld.kr/ned/data/ladfrlList
export async function fetchLadfrl(pnu) {
  const data = await jsonp(`${BASE_URL}/ladfrlList`, baseParams({ pnu, numOfRows: "10" }));
  const root = data.ladfrlVOList || {};
  if (root.error) throw new Error(`${root.error}: ${root.message}`);
  const items = root.ladfrlVOList || [];
  return items[0] || null;
}

// 토지이용계획 — https://api.vworld.kr/ned/data/getLandUseAttr
export async function fetchLandUse(pnu) {
  const data = await jsonp(`${BASE_URL}/getLandUseAttr`, baseParams({ pnu, numOfRows: "100" }));
  const root = data.landUses || {};
  if (root.resultCode) throw new Error(`${root.resultCode}: ${root.resultMsg}`);
  return root.field || [];
}

// 개별공시지가 — https://api.vworld.kr/ned/data/getIndvdLandPrice
// 필지 단위 조회가 불가능함이 확인돼(8-5) 법정동(ldCode) 단위로만 조회한다 — F-04 재설계 참조.
// 한 해에도 지목×용도지역 조합별로 여러 레코드가 내려온다 — 원본 레코드를 그대로 반환하고,
// 평균·화면 표시는 호출하는 쪽(normalize.js)에서 처리한다.
async function fetchLandPriceForYear(ldCode, year) {
  const data = await jsonp(`${BASE_URL}/getIndvdLandPrice`, baseParams({ ldCode, stdrYear: String(year), reqLvl: "3", numOfRows: "1000" }));
  const root = data.statelndvdLandPrices || data.response || {};
  if (root.resultCode) throw new Error(`${root.resultCode}: ${root.resultMsg}`);
  return root.field || [];
}

// 5개년치를 한 번에 받아 [{year, items}] 형태로 반환한다. items는 해당 연도 법정동 전체의
// 지목×용도지역 조합별 레코드(빈 배열이면 그 해 데이터 없음).
export async function fetchLandPriceByYears(ldCode, years) {
  const itemsByYear = await Promise.all(years.map((year) => fetchLandPriceForYear(ldCode, year)));
  return years.map((year, i) => ({ year, items: itemsByYear[i] }));
}
