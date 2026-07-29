// 자체 FastAPI 백엔드 호출 — 주소 검색(F-01)·건축물대장(F-03).
// VWorld(토지·임야정보/개별공시지가/토지이용계획/Geocoder)와 달리 juso.go.kr·건축HUB는 배포 서버에서
// 차단당한 적이 없으므로 원래 설계대로 백엔드를 거친다(planning.md 7장 참조).
// Geocoder는 처음엔 여기 있었으나, vworld.kr 차단이 특정 경로가 아니라 도메인 전체에 걸려 있음이
// 확인되어(8-6) api/vworld.js의 JSONP 호출로 옮겨졌다.
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
