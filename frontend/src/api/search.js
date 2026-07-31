// 주소 검색(F-01) — juso.go.kr(백엔드 경유)과 VWorld search 2.0(프론트 JSONP)을 병렬로 호출해 합친다.
//
// juso.go.kr은 산여부(mtYn)를 정확한 값으로 주지만, 도로명주소가 부여되지 않은 세부 지번(임야, 본번만
// 등록되고 부번은 등록 안 된 세부 분할 지번 등)은 인덱스에 아예 없는 경우가 실제로 확인됐다(예: "경상남도
// 양산시 덕계동 91-5" — 2026-07-31, planning.md 8-9). VWorld search 2.0은 그런 주소까지 커버하는 대신
// 응답의 PNU 자리 중 산여부 비트가 실제 값과 무관하게 항상 "1"로 내려오는 결함이 있다(같은 참조).
//
// 그래서 같은 필지(pnu)가 양쪽에 다 있으면 juso 쪽(정확한 mtYn)을 우선하고, juso가 놓친 주소만 VWorld
// 결과로 채운다 — 대다수 주소(juso가 커버하는 대지 필지)는 산여부 버그 없이 정확하고, juso가 놓치는
// 지번까지 검색 범위가 넓어진다.
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
