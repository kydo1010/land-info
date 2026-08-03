// PDF 추출(exportPdf.js)과 브라우저 인쇄(@page, main.jsx가 index.css 대신 여기서 주입)가
// 이 값 하나만 보고 동작한다. 전에는 index.css의 @page 여백과 exportPdf.js의 상수가 따로
// 있어서, index.css만 고치면 "pdf 추출하기" 결과물은 안 바뀌는 문제가 있었다 — 이제는 한 곳만
// 고치면 두 출력물(인쇄물/PDF) 모두에 반영된다.
export const PRINT_MARGIN_MM = { top: 25, right: 15, bottom: 25, left: 15 };
