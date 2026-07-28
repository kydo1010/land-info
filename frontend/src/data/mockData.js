// 목업 데이터 — 실제 백엔드 API 연동 전까지 사용 (planning.md Phase 3 참조)

export const CANDS = [
  { jibun: "서울특별시 강남구 역삼동 737", road: "서울특별시 강남구 테헤란로 152", pnu: "1168010100107370000", lat: "37.50042", lng: "127.03653" },
  { jibun: "서울특별시 강남구 역삼동 737-1", road: "서울특별시 강남구 테헤란로 154", pnu: "1168010100107370001", lat: "37.50071", lng: "127.03712" },
  { jibun: "서울특별시 강남구 역삼동 737-19", road: "서울특별시 강남구 언주로85길 21", pnu: "1168010100107370019", lat: "37.50118", lng: "127.03588" },
  { jibun: "서울특별시 강남구 역삼동 737-32", road: "서울특별시 강남구 테헤란로8길 14", pnu: "1168010100107370032", lat: "37.49988", lng: "127.03744" },
];

export const RULES = [
  { name: "지구단위계획구역", kind: "저촉" },
  { name: "중심지미관지구", kind: "해당" },
  { name: "과밀억제권역", kind: "해당" },
  { name: "대공방어협조구역 (위탁고도 77-257m)", kind: "해당" },
  { name: "상대보호구역 (학교환경위생)", kind: "저촉" },
  { name: "도로 (접함)", kind: "접함" },
];

export const FLOORS = [
  { floor: "지하 6층", purpose: "주차장", struct: "철골철근콘크리트조", area: "4,120.55" },
  { floor: "지하 1층", purpose: "근린생활시설, 기계실", struct: "철골철근콘크리트조", area: "3,884.20" },
  { floor: "지상 1층", purpose: "근린생활시설, 로비", struct: "철골철근콘크리트조", area: "2,209.87" },
  { floor: "지상 2-5층", purpose: "업무시설", struct: "철골철근콘크리트조", area: "8,412.60" },
  { floor: "지상 6-35층", purpose: "업무시설", struct: "철골철근콘크리트조", area: "61,338.14" },
  { floor: "지상 36층", purpose: "업무시설, 기계실", struct: "철골철근콘크리트조", area: "1,742.09" },
];

export const FLOORS_SMALL = [
  { floor: "지하 1층", purpose: "주차장, 기계실", struct: "철근콘크리트조", area: "312.40" },
  { floor: "지상 1층", purpose: "근린생활시설(소매점)", struct: "철근콘크리트조", area: "268.15" },
  { floor: "지상 2층", purpose: "근린생활시설(사무소)", struct: "철근콘크리트조", area: "268.15" },
  { floor: "지상 3-5층", purpose: "업무시설", struct: "철근콘크리트조", area: "804.45" },
];

export const PRICES = [
  { year: 2022, value: 27900000 },
  { year: 2023, value: 29100000 },
  { year: 2024, value: 30250000 },
  { year: 2025, value: 31400000 },
  { year: 2026, value: 33800000 },
];

export const VAR = {
  "1168010100107370000": { use: "일반상업지역", bcr: "60%", far: "800%", rules: [0, 1, 2, 3, 4, 5], jimok: "대", jimokNote: "垈 · 대지", area: "6,881.9㎡", areaNote: "약 2,081.8평", owner: "법인", ownerNote: "1인 소유", usage: "업무용", usageNote: "고층 사무실", struct: "철골철근콘크리트조", purpose: "업무시설", approved: "2002-10-14", floors: FLOORS, summary: "지하 6층 / 지상 36층 · 연면적 81,707.45㎡", buildArea: "3,289.44㎡", bcrReal: "47.80%", farReal: "782.16%", bld: "ok", factor: 1 },
  "1168010100107370001": { use: "일반상업지역", bcr: "60%", far: "600%", rules: [0, 1, 2, 5], jimok: "대", jimokNote: "垈 · 대지", area: "612.4㎡", areaNote: "약 185.3평", owner: "개인", ownerNote: "2인 공유", usage: "상업용", usageNote: "근린생활시설", struct: "철근콘크리트조", purpose: "제2종근린생활시설", approved: "1996-05-22", floors: FLOORS_SMALL, summary: "지하 1층 / 지상 5층 · 연면적 1,653.15㎡", buildArea: "341.02㎡", bcrReal: "55.68%", farReal: "218.75%", bld: "ok", factor: 0.72 },
  "1168010100107370019": { use: "제3종일반주거지역", bcr: "50%", far: "250%", rules: [0, 2, 4], jimok: "잡종지", jimokNote: "雜種地", area: "418.0㎡", areaNote: "약 126.4평", owner: "개인", ownerNote: "1인 소유", usage: "나지", usageNote: "주차장으로 이용", struct: "—", purpose: "—", approved: "—", floors: [], summary: "—", buildArea: "—", bcrReal: "—", farReal: "—", bld: "empty", factor: 0.41 },
  "1168010100107370032": { use: "일반상업지역", bcr: "60%", far: "800%", rules: [0, 1, 2, 3], jimok: "대", jimokNote: "垈 · 대지", area: "1,204.7㎡", areaNote: "약 364.4평", owner: "법인", ownerNote: "1인 소유", usage: "업무용", usageNote: "중층 사무실", struct: "철골조", purpose: "업무시설", approved: "2011-03-08", floors: FLOORS_SMALL, summary: "지하 2층 / 지상 12층 · 연면적 9,884.30㎡", buildArea: "681.86㎡", bcrReal: "56.60%", farReal: "676.28%", bld: "ok", factor: 0.86 },
};
