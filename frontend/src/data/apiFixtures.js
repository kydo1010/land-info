// 공공 API 원본 응답 구조를 그대로 흉내낸 목업 픽스처.
// 필드명·중첩 구조는 planning.md 8-1에 기록된 실제 API 문서 조사 결과를 따른다.
// 백엔드가 실제로 이 API들을 붙이면, 이 파일이 그대로 통합 테스트용 픽스처 역할을 할 수 있다.
//
// 주의: 코드값(lndcgrCode, posesnSeCode 등)은 문서에 정확한 코드표가 없어 임의로 채운 자리 표시자다.
// *CodeNm(코드명) 쪽만 planning.md에 확인된 실제 값이다.

// ── 토지·임야정보 API — https://api.vworld.kr/ned/data/ladfrlList ──
// 요청: pnu, key(+format/numOfRows/pageNo/domain)
// "이용상황"에 해당하는 필드는 문서에서 확인되지 않아 이 픽스처에도 포함하지 않는다(F-02에서 제외, 11장 참조).
export const LADFRL_RESPONSE = {
  "1168010100107370000": { lndcgrCode: "08", lndcgrCodeNm: "대", lndpclAr: "6881.9", posesnSeCode: "02", posesnSeCodeNm: "법인" },
  "1168010100107370001": { lndcgrCode: "08", lndcgrCodeNm: "대", lndpclAr: "612.4", posesnSeCode: "01", posesnSeCodeNm: "개인" },
  "1168010100107370019": { lndcgrCode: "20", lndcgrCodeNm: "잡종지", lndpclAr: "418.0", posesnSeCode: "01", posesnSeCodeNm: "개인" },
  "1168010100107370032": { lndcgrCode: "08", lndcgrCodeNm: "대", lndpclAr: "1204.7", posesnSeCode: "02", posesnSeCodeNm: "법인" },
};

// ── 건축HUB 표제부 조회 — getBrTitleInfo ──
// 요청: sigunguCd, bjdongCd, platGbCd, bun, ji, serviceKey (도로명주소 admCd/mtYn/lnbrMnnm/lnbrSlno에서 파생, 9장 참조)
// 건축물이 없는 필지는 totalCount "0"에 item 없음으로 응답한다(문서에 명시된 값은 아니고,
// 다른 data.go.kr 계열 API와 동일한 패턴일 것이라는 추정 — 8-1 참조).
export const BR_TITLE_RESPONSE = {
  "1168010100107370000": {
    totalCount: "1",
    item: {
      strctCd: "21", strctCdNm: "철골철근콘크리트조",
      mainPurpsCd: "02100", mainPurpsCdNm: "업무시설",
      platArea: "6881.9", archArea: "3289.44", totArea: "81707.45",
      bcRat: "47.8", vlRat: "782.16",
      grndFlrCnt: "36", ugrndFlrCnt: "6",
      useAprDay: "20021014",
    },
  },
  "1168010100107370001": {
    totalCount: "1",
    item: {
      strctCd: "06", strctCdNm: "철근콘크리트조",
      mainPurpsCd: "04000", mainPurpsCdNm: "제2종근린생활시설",
      platArea: "612.4", archArea: "341.02", totArea: "1653.15",
      bcRat: "55.68", vlRat: "218.75",
      grndFlrCnt: "5", ugrndFlrCnt: "1",
      useAprDay: "19960522",
    },
  },
  "1168010100107370019": { totalCount: "0", item: null },
  "1168010100107370032": {
    totalCount: "1",
    item: {
      strctCd: "05", strctCdNm: "철골조",
      mainPurpsCd: "02100", mainPurpsCdNm: "업무시설",
      platArea: "1204.7", archArea: "681.86", totArea: "9884.30",
      bcRat: "56.6", vlRat: "676.28",
      grndFlrCnt: "12", ugrndFlrCnt: "2",
      useAprDay: "20110308",
    },
  },
};

// ── 건축HUB 층별개요 조회 — getBrFlrOulnInfo ──
export const BR_FLR_OULN_RESPONSE = {
  "1168010100107370000": {
    totalCount: "6",
    items: [
      { flrGbCdNm: "지하", flrNoNm: "6층", mainPurpsCdNm: "주차장", strctCdNm: "철골철근콘크리트조", area: "4120.55" },
      { flrGbCdNm: "지하", flrNoNm: "1층", mainPurpsCdNm: "근린생활시설, 기계실", strctCdNm: "철골철근콘크리트조", area: "3884.20" },
      { flrGbCdNm: "지상", flrNoNm: "1층", mainPurpsCdNm: "근린생활시설, 로비", strctCdNm: "철골철근콘크리트조", area: "2209.87" },
      { flrGbCdNm: "지상", flrNoNm: "2-5층", mainPurpsCdNm: "업무시설", strctCdNm: "철골철근콘크리트조", area: "8412.60" },
      { flrGbCdNm: "지상", flrNoNm: "6-35층", mainPurpsCdNm: "업무시설", strctCdNm: "철골철근콘크리트조", area: "61338.14" },
      { flrGbCdNm: "지상", flrNoNm: "36층", mainPurpsCdNm: "업무시설, 기계실", strctCdNm: "철골철근콘크리트조", area: "1742.09" },
    ],
  },
  "1168010100107370001": {
    totalCount: "4",
    items: [
      { flrGbCdNm: "지하", flrNoNm: "1층", mainPurpsCdNm: "주차장, 기계실", strctCdNm: "철근콘크리트조", area: "312.40" },
      { flrGbCdNm: "지상", flrNoNm: "1층", mainPurpsCdNm: "근린생활시설(소매점)", strctCdNm: "철근콘크리트조", area: "268.15" },
      { flrGbCdNm: "지상", flrNoNm: "2층", mainPurpsCdNm: "근린생활시설(사무소)", strctCdNm: "철근콘크리트조", area: "268.15" },
      { flrGbCdNm: "지상", flrNoNm: "3-5층", mainPurpsCdNm: "업무시설", strctCdNm: "철근콘크리트조", area: "804.45" },
    ],
  },
  "1168010100107370019": { totalCount: "0", items: [] },
  "1168010100107370032": {
    totalCount: "4",
    items: [
      { flrGbCdNm: "지하", flrNoNm: "1층", mainPurpsCdNm: "주차장, 기계실", strctCdNm: "철근콘크리트조", area: "312.40" },
      { flrGbCdNm: "지상", flrNoNm: "1층", mainPurpsCdNm: "근린생활시설(소매점)", strctCdNm: "철근콘크리트조", area: "268.15" },
      { flrGbCdNm: "지상", flrNoNm: "2층", mainPurpsCdNm: "근린생활시설(사무소)", strctCdNm: "철근콘크리트조", area: "268.15" },
      { flrGbCdNm: "지상", flrNoNm: "3-5층", mainPurpsCdNm: "업무시설", strctCdNm: "철근콘크리트조", area: "804.45" },
    ],
  },
};

// ── 개별공시지가 API — getIndvdLandPrice ──
// 문서상 식별자가 pnu가 아니라 ldCode(법정동코드)뿐이라, 이 4개 후보(전부 역삼동, ldCode 1168010100)는
// 문서대로라면 동일한 공시지가를 받는다 — 필지별 factor 없이 전부 공유한다(11장 참조).
// 다년치 1회 조회 여부가 불명확해 "연도별로 5번 호출"로 모델링했고, 2024년은 응답이 없는 경우를 흉내냈다.
export const LDCODE = "1168010100";
export const INDVD_LAND_PRICE_RESPONSE = {
  2022: { ldCode: LDCODE, stdrYear: "2022", ladPblntfPclnd: "27900000" },
  2023: { ldCode: LDCODE, stdrYear: "2023", ladPblntfPclnd: "29100000" },
  // 2024: 해당 연도 응답 없음(데이터 미제공 상황을 재현)
  2025: { ldCode: LDCODE, stdrYear: "2025", ladPblntfPclnd: "31400000" },
  2026: { ldCode: LDCODE, stdrYear: "2026", ladPblntfPclnd: "33800000" },
};

// ── 토지이용계획 API — getLandUseAttr ──
// 응답이 item 배열 하나로 내려오고 용도지역/용도지구/규제가 모두 섞여 있다. 이걸 구분하는 코드 체계는
// 조사되지 않아, 배열의 첫 번째 항목을 "용도지역"으로, 나머지를 "규제 목록"으로 다루기로 했다(11장 참조).
export const LAND_USE_RESPONSE = {
  "1168010100107370000": {
    items: [
      { prposAreaDstrcCode: "UQA100", prposAreaDstrcCodeNm: "일반상업지역", cnflcAt: "1", cnflcAtNm: "해당" },
      { prposAreaDstrcCode: "UQB210", prposAreaDstrcCodeNm: "지구단위계획구역", cnflcAt: "2", cnflcAtNm: "저촉" },
      { prposAreaDstrcCode: "UQB220", prposAreaDstrcCodeNm: "중심지미관지구", cnflcAt: "1", cnflcAtNm: "해당" },
      { prposAreaDstrcCode: "UQB230", prposAreaDstrcCodeNm: "과밀억제권역", cnflcAt: "1", cnflcAtNm: "해당" },
      { prposAreaDstrcCode: "UQB240", prposAreaDstrcCodeNm: "대공방어협조구역 (위탁고도 77-257m)", cnflcAt: "1", cnflcAtNm: "해당" },
      { prposAreaDstrcCode: "UQB250", prposAreaDstrcCodeNm: "상대보호구역 (학교환경위생)", cnflcAt: "2", cnflcAtNm: "저촉" },
      { prposAreaDstrcCode: "UQB260", prposAreaDstrcCodeNm: "도로 (접함)", cnflcAt: "3", cnflcAtNm: "접함" },
    ],
  },
  "1168010100107370001": {
    items: [
      { prposAreaDstrcCode: "UQA100", prposAreaDstrcCodeNm: "일반상업지역", cnflcAt: "1", cnflcAtNm: "해당" },
      { prposAreaDstrcCode: "UQB210", prposAreaDstrcCodeNm: "지구단위계획구역", cnflcAt: "2", cnflcAtNm: "저촉" },
      { prposAreaDstrcCode: "UQB220", prposAreaDstrcCodeNm: "중심지미관지구", cnflcAt: "1", cnflcAtNm: "해당" },
      { prposAreaDstrcCode: "UQB260", prposAreaDstrcCodeNm: "도로 (접함)", cnflcAt: "3", cnflcAtNm: "접함" },
    ],
  },
  "1168010100107370019": {
    items: [
      { prposAreaDstrcCode: "UQA300", prposAreaDstrcCodeNm: "제3종일반주거지역", cnflcAt: "1", cnflcAtNm: "해당" },
      { prposAreaDstrcCode: "UQB210", prposAreaDstrcCodeNm: "지구단위계획구역", cnflcAt: "2", cnflcAtNm: "저촉" },
      { prposAreaDstrcCode: "UQB250", prposAreaDstrcCodeNm: "상대보호구역 (학교환경위생)", cnflcAt: "2", cnflcAtNm: "저촉" },
    ],
  },
  "1168010100107370032": {
    items: [
      { prposAreaDstrcCode: "UQA100", prposAreaDstrcCodeNm: "일반상업지역", cnflcAt: "1", cnflcAtNm: "해당" },
      { prposAreaDstrcCode: "UQB210", prposAreaDstrcCodeNm: "지구단위계획구역", cnflcAt: "2", cnflcAtNm: "저촉" },
      { prposAreaDstrcCode: "UQB230", prposAreaDstrcCodeNm: "과밀억제권역", cnflcAt: "1", cnflcAtNm: "해당" },
    ],
  },
};
