import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PRINT_MARGIN_MM as MARGIN_MM } from "./printMargins.js";

// #report-content는 maxWidth:1180으로 화면 너비가 이보다 넓을 때만 1180px로 나온다. html2canvas는
// 기본적으로 "지금 실제 브라우저 창 크기"를 가상 뷰포트로 잡고 문서를 복제하기 때문에, 창을 줄인
// 상태로 추출하면 그 줄어든 폭 그대로 캡처된다(실제로 재현: 창 500px → "document clone size 500x800"
// 콘솔 로그) — windowWidth를 명시해 창 크기와 무관하게 항상 이 폭으로 캡처하게 한다.
const CAPTURE_WIDTH_PX = 1180;

// 리포트 DOM 노드를 캔버스로 캡처한 뒤, A4 페이지 여백 안쪽 영역 높이만큼씩 잘라 여러 페이지 PDF로
// 만들어 다운로드한다. 지도 타일(OpenStreetMap) 이미지는 CORS 헤더가 없을 수 있어 useCORS:true로
// 시도하되, 실패하면 html2canvas가 해당 영역만 비워둘 뿐 전체 캡처가 깨지지는 않는다.
export async function exportElementToPdf(element, filename) {
  // element(#report-content)의 화면용 padding(sticky 헤더 아래 여백 확보용, App.jsx의 인라인
  // style)이 캡처에 그대로 들어가면 PDF 여백(MARGIN_MM)과 중첩돼 1페이지 상단만 유독 넓어진다 —
  // 캡처 직전에만 0으로 비우고 끝나면 원래 값으로 되돌린다.
  const originalPadding = element.style.padding;
  element.style.padding = "0";
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    windowWidth: CAPTURE_WIDTH_PX,
    windowHeight: element.scrollHeight,
  });
  element.style.padding = originalPadding;

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  const contentWidthMm = pageWidthMm - MARGIN_MM.left - MARGIN_MM.right;
  const contentHeightMm = pageHeightMm - MARGIN_MM.top - MARGIN_MM.bottom;
  const pxPerMm = canvas.width / contentWidthMm;
  const contentHeightPx = contentHeightMm * pxPerMm;

  let renderedPx = 0;
  let isFirstPage = true;

  while (renderedPx < canvas.height) {
    const sliceHeightPx = Math.min(contentHeightPx, canvas.height - renderedPx);

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;
    sliceCanvas.getContext("2d").drawImage(canvas, 0, renderedPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

    if (!isFirstPage) pdf.addPage();
    pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", MARGIN_MM.left, MARGIN_MM.top, contentWidthMm, sliceHeightPx / pxPerMm);

    renderedPx += sliceHeightPx;
    isFirstPage = false;
  }

  pdf.save(filename);
}
