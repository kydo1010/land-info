// 건축HUB(건축물대장) 원본 응답 구조를 그대로 흉내낸 목업 픽스처.
// 토지·임야정보/개별공시지가/토지이용계획은 이제 프론트에서 VWorld를 직접 호출하므로(api/vworld.js)
// 더 이상 이 파일에 목업이 없다 — 건축HUB만 아직 미연동이라 목업으로 남아 있다.
//
// 주의: 코드값(strctCd 등)은 문서에 정확한 코드표가 없어 임의로 채운 자리 표시자다.
// *CdNm(코드명) 쪽만 planning.md에 확인된 실제 값이다.

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

