// 새로고침해도 열려있던 탭(주소)이 그대로 남아있도록 후보 목록(cand)과 활성 탭만 localStorage에 저장한다
// — 조회된 데이터(landInfo 등)는 저장하지 않고 새로고침 시 다시 불러온다(오래된 값이 남지 않게).
const STORAGE_KEY = "parcel-report:tabs";

// 열려있던 탭들의 주소 후보(cand)와 활성 탭 id를 저장한다. 실제 주소가 있는 탭이 하나도 없으면
// (전부 닫힌 상태) 저장값 자체를 지운다.
export function saveTabs(tabs, activeId) {
  const realTabs = tabs.filter((t) => t.cand);
  if (realTabs.length === 0) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs: realTabs.map((t) => t.cand), activeId }));
}

// 저장된 탭 목록을 읽어온다. 저장된 게 없거나 형식이 깨졌으면 null.
export function loadTabs() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    saved = null;
  }
  if (!saved || !Array.isArray(saved.tabs) || saved.tabs.length === 0) return null;
  return saved;
}
