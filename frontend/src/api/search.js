// 주소 검색(F-01) — juso.go.kr(백엔드 경유)과 VWorld search 2.0(프론트 JSONP)을 병렬로 호출해 합친다.
//
// juso.go.kr은 도로명주소가 부여되지 않은 세부 지번(임야, 본번만 등록되고 부번은 등록 안 된 세부 분할
// 지번 등)은 인덱스에 아예 없는 경우가 실제로 확인됐다(예: "경상남도 양산시 덕계동 91-5" — 2026-07-31,
// planning.md 8-9). VWorld search 2.0은 그런 주소까지 커버한다.
//
// 두 소스 모두 pnu의 11번째 자리("필지구분": 1=일반·2=산)를 일관되게 계산하도록 고쳐졌다(planning.md
// 8-11) — juso.go.kr은 backend/app/schemas/address.py의 to_candidate()에서, VWorld는 api/vworld.js의
// toCandidate()에서. 그래서 같은 실제 필지면 두 소스가 같은 pnu 문자열을 내고, 아래 Map이 정확히
// 중복 제거한다. 같은 필지가 양쪽에 다 있으면 juso 쪽(도로명·지번 텍스트가 더 완전한 경우가 많음)을
// 우선하고, juso가 놓친 주소만 VWorld 결과로 채운다.
import { searchAddress as searchJuso } from "./backend.js";
import { searchAddress as searchVWorld } from "./vworld.js";

export async function searchAddress(query) {
  const [jusoResults, vworldResults] = await Promise.all([searchJuso(query).catch(() => []), searchVWorld(query).catch(() => [])]);

  const byPnu = new Map();
  for (const c of jusoResults) byPnu.set(c.pnu, { ...c, addressType: "road" });
  for (const c of vworldResults) {
    if (!byPnu.has(c.pnu)) byPnu.set(c.pnu, c);
  }
  return Array.from(byPnu.values());
}
