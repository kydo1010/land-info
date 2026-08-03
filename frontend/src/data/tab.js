function timestamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}시 ${p(d.getMinutes())}분 ${p(d.getSeconds())}초`;
}

// 탭 하나의 초기 상태 — App.jsx의 select()로 새로 열 때와 utils/tabStorage.js로 새로고침 후
// 복원할 때 둘 다 이 모양으로 시작한다. status 필드들은 App.jsx의 loadLand/loadZone/loadPrice/
// loadBuilding이 이어서 채운다.
export function createTabState(cand) {
  return {
    id: cand.pnu,
    cand,
    zone: "loading",
    land: "loading",
    bld: "loading",
    price: "loading",
    zoneInfo: null,
    landInfo: null,
    priceChart: null,
    buildingInfo: null,
    coords: null,
    fetchedAt: timestamp(),
  };
}
