// VWorld API를 브라우저에서 직접 호출한다 — 국가중점데이터 3종(토지·임야정보/개별공시지가/토지이용계획)에
// 더해 Geocoder·주소 검색(search 2.0)도 포함한다. 백엔드 서버를 거치면 서버의 아웃바운드 IP가 vworld.kr
// 쪽에서 차단당하는 문제가 있고(2026-07-29), 이 차단은 특정 API 경로가 아니라 vworld.kr 도메인 전체에
// 걸려 있음이 Geocoder(`req/address`, 국가중점데이터 카테고리 아님)에서도 동일하게 재현되어 확인됐다
// (8-6 참조) — 우회책으로 프론트엔드가 VWorld 전체를 JSONP로 바로 호출한다.
// 주소 검색은 juso.go.kr에서 이쪽으로 교체됐다(2026-07-31, planning.md 8-9) — vworld.kr과 무관한
// juso.go.kr이 차단 대상은 아니었지만, juso.go.kr이 도로명주소 미부여 지번(세부 분할 지번, 임야 등)을
// 놓치는 사례가 실제로 확인되어 커버리지가 더 넓은 VWorld search 2.0으로 옮겼다.
//
// 주의: VITE_ 접두사가 붙은 값은 빌드 시 번들에 그대로 박혀 브라우저에서 누구나 볼 수 있다.
// VWorld 키는 발급 시 등록한 도메인(VITE_VWORLD_DOMAIN)의 Referer로만 동작하도록 서버가 검증하므로
// (8-5 확인), 이 키를 그대로 복사해 다른 도메인에서 쓰더라도 정상 동작하지 않는다.
import { jsonp } from "./jsonp.js";

const BASE_URL = "https://api.vworld.kr/ned/data";
const GEOCODER_URL = "https://api.vworld.kr/req/address";
const SEARCH_URL = "https://api.vworld.kr/req/search";
const KEY = import.meta.env.VITE_VWORLD_API_KEY;
const DOMAIN = import.meta.env.VITE_VWORLD_DOMAIN;

function baseParams(extra) {
  return { format: "json", key: KEY, domain: DOMAIN, pageNo: "1", ...extra };
}

// 주소 검색(F-01) — https://api.vworld.kr/req/search (search 2.0). category가 ADDRESS일 때는
// ROAD/PARCEL 중 하나를 반드시 골라야 하고, 각 카테고리는 자기 형식의 질의만 매칭한다(예: "역삼동
// 737"은 category=parcel에서만, "테헤란로 152"는 category=road에서만 잡힌다) — juso.go.kr의 keyword
// 검색처럼 한 번에 둘 다 잡히지 않으므로, 두 카테고리를 병렬로 호출해 합친다(planning.md 8-9 참조).
async function searchByCategory(query, category) {
  const data = await jsonp(SEARCH_URL, {
    service: "search",
    request: "search",
    version: "2.0",
    crs: "EPSG:4326",
    query,
    type: "address",
    category,
    key: KEY,
    domain: DOMAIN,
  });
  const response = data.response || {};
  if (response.status !== "OK") return [];
  return response.result?.items || [];
}

// item.id는 문서상 "PNU"이지만 산여부 자리(11번째 자리)가 실제 값과 무관하게 항상 "1"로 내려오는
// 결함이 실제 호출로 확인됐다(대지 필지 여러 건 재현, planning.md 8-9) — Geocoder의 level4LC도 같은
// 결함을 공유해 대안이 못 된다. 그 자리를 신뢰하지 않고 항상 "0"(대지)으로 고정한다 — 실제 산지
// 필지의 건축물대장 조회는 못 맞추지만, 산지엔 애초에 건물이 등록된 경우가 드물어 영향이 작다.
function toCandidate(item) {
  const id = item.id;
  const sigunguCd = id.slice(0, 5);
  const bjdongCd = id.slice(5, 10);
  const platGbCd = "0";
  const bun = id.slice(11, 15);
  const ji = id.slice(15, 19);
  return {
    pnu: `${sigunguCd}${bjdongCd}${platGbCd}${bun}${ji}`,
    sigunguCd,
    bjdongCd,
    platGbCd,
    bun,
    ji,
    road: item.address.road,
    jibun: item.address.parcel,
    zipNo: item.address.zipcode,
  };
}

// road/parcel 카테고리 각각 완전한 형태로 오는 필드가 다르다(category=parcel 결과는 jibun은 완전하지만
// road는 부분(시도·구 생략), category=road는 그 반대) — 같은 id(필지)로 매칭되면 둘을 합쳐 완전한 값을
// 쓰고, 한쪽만 있으면 그 카테고리의 완전한 필드를 addressType으로 표시해 지오코딩 시 그 필드를 쓰게 한다.
export async function searchAddress(query) {
  const [roadItems, parcelItems] = await Promise.all([
    searchByCategory(query, "road").catch(() => []),
    searchByCategory(query, "parcel").catch(() => []),
  ]);

  const byId = new Map();
  for (const item of parcelItems) {
    byId.set(item.id, { ...toCandidate(item), addressType: "parcel" });
  }
  for (const item of roadItems) {
    const existing = byId.get(item.id);
    if (existing) {
      existing.road = item.address.road;
      existing.addressType = "road";
    } else {
      byId.set(item.id, { ...toCandidate(item), addressType: "road" });
    }
  }
  // 도로명주소 자체가 없는 필지는 category=parcel 결과의 road가 빈 문자열로 온다(예: "덕계동 91-5") —
  // road.replace(...)로 탭 제목을 만드는 App.jsx가 빈 문자열을 그대로 보여주지 않도록 jibun으로 채운다.
  return Array.from(byId.values()).map((c) => ({ ...c, road: c.road || c.jibun, jibun: c.jibun || c.road }));
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

// 개별공시지가속성조회 — https://api.vworld.kr/ned/data/getIndvdLandPriceAttr
// 기존 getIndvdLandPrice(ldCode 기준, 법정동 단위)와 달리 pnu로 필지 단위 조회가 된다 — 8-8 참조.
// stdrYear를 생략하면 그 필지의 연도별 공시지가 전체 이력이 한 번에 내려온다(같은 연도가 중복으로
// 내려오는 경우가 있는데 값은 동일하다 — 8-8에서 확인). 프론트에서 최근 5개년만 추려 쓴다.
export async function fetchLandPriceHistory(pnu) {
  const data = await jsonp(`${BASE_URL}/getIndvdLandPriceAttr`, baseParams({ pnu, numOfRows: "100" }));
  const root = data.indvdLandPrices || data.response || {};
  if (root.resultCode) throw new Error(`${root.resultCode}: ${root.resultMsg}`);
  return root.field || [];
}

// Geocoder(주소 → 좌표) — https://api.vworld.kr/req/address
// F-01에서 선택한 주소 문자열을 그대로 넣는다(PNU 불필요, 8-1 참조). 국가중점데이터 카테고리가
// 아니라 domain 없이도 정상 응답했지만(8-6 확인), 다른 VWorld 호출과 동일하게 domain을 실어 보낸다.
export async function fetchCoordinates(address, addressType = "road") {
  const data = await jsonp(GEOCODER_URL, {
    service: "address",
    request: "getCoord",
    version: "2.0",
    crs: "epsg:4326",
    address,
    type: addressType,
    key: KEY,
    domain: DOMAIN,
  });
  const response = data.response || {};
  if (response.status !== "OK") {
    const error = response.error || {};
    throw new Error(`${error.code || response.status}: ${error.text || ""}`);
  }
  const point = response.result.point;
  return { lat: point.y, lng: point.x };
}
