// 주소 검색(F-01) — juso.go.kr(백엔드 경유)과 VWorld search 2.0(프론트 JSONP)을 병렬로 호출해 합친다.
//
// juso.go.kr은 산여부(mtYn)를 정확한 값으로 주지만, 도로명주소가 부여되지 않은 세부 지번(임야, 본번만
// 등록되고 부번은 등록 안 된 세부 분할 지번 등)은 인덱스에 아예 없는 경우가 실제로 확인됐다(예: "경상남도
// 양산시 덕계동 91-5" — 2026-07-31, planning.md 8-9). VWorld search 2.0은 그런 주소까지 커버하지만 응답
// 자체의 산여부 비트는 신뢰할 수 없어(같은 참조), juso가 놓친 주소에 한해 Geocoder로 다시 확인한다
// (refineParcelIdentifiers, planning.md 8-10).
//
// 같은 필지(pnu)가 양쪽에 다 있으면 juso 쪽을 우선하고, juso가 놓친 주소만 (Geocoder로 보정한) VWorld
// 결과로 채운다 — 대다수 주소(juso가 커버하는 대지 필지)는 산여부 문제와 무관하게 정확하고, juso가
// 놓치는 지번까지 검색 범위가 넓어진다.
import { searchAddress as searchJuso } from "./backend.js";
import { searchAddress as searchVWorld, refineParcelIdentifiers } from "./vworld.js";

export async function searchAddress(query) {
  const [jusoResults, vworldResults] = await Promise.all([searchJuso(query).catch(() => []), searchVWorld(query).catch(() => [])]);

  const byPnu = new Map();
  for (const c of jusoResults) byPnu.set(c.pnu, { ...c, addressType: "road" });

  const vworldOnly = vworldResults.filter((c) => !byPnu.has(c.pnu));
  const refined = await Promise.all(vworldOnly.map((c) => refineParcelIdentifiers(c).catch(() => c)));
  for (const c of refined) {
    if (!byPnu.has(c.pnu)) byPnu.set(c.pnu, c);
  }
  return Array.from(byPnu.values());
}
