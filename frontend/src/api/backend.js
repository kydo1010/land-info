// 자체 FastAPI 백엔드 호출 — 주소 검색(F-01)·건축물대장(F-03)·좌표(F-04 지도).
// VWorld 3종(토지·임야정보/개별공시지가/토지이용계획)과 달리 이 API들은 배포 서버에서
// 차단당한 적이 없으므로 원래 설계대로 백엔드를 거친다(planning.md 7장 참조). Geocoder도
// vworld.kr이긴 하지만 `ned/data` 국가중점데이터 경로가 아닌 `req/address` 경로라 8-3에서
// 별도로 정상 작동이 확인됐다 — 다만 배포 서버 차단이 vworld.kr 전체에 걸린 것이라면 이 경로도
// 막힐 수 있으니, 배포 후 안 되면 VWorld 3종과 같은 JSONP 우회를 검토한다.
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function getEnvelope(path, params) {
  const qs = new URLSearchParams(params).toString();
  const response = await fetch(`${BASE_URL}${path}?${qs}`);
  const envelope = await response.json();
  if (envelope.error) throw new Error(`${envelope.error.code}: ${envelope.error.message}`);
  return envelope.data;
}

// GET /api/address/search?q= — 주소 검색 후보 목록(AddressCandidate[]) 반환.
export function searchAddress(q) {
  return getEnvelope("/api/address/search", { q });
}

// GET /api/building?sigunguCd=&bjdongCd=&platGbCd=&bun=&ji= — 건축물대장(BuildingRecord) 반환.
export function fetchBuilding({ sigunguCd, bjdongCd, platGbCd, bun, ji }) {
  return getEnvelope("/api/building", { sigunguCd, bjdongCd, platGbCd, bun, ji });
}

// GET /api/coordinates?address= — 지도 표시용 좌표({lat, lng}) 반환.
export function fetchCoordinates(address) {
  return getEnvelope("/api/coordinates", { address });
}
