import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PRINT_MARGIN_MM as MARGIN_MM } from "./printMargins.js";

// #report-content는 maxWidth:1180으로 화면 너비가 이보다 넓을 때만 1180px로 나온다. html2canvas는
// 기본적으로 "지금 실제 브라우저 창 크기"를 가상 뷰포트로 잡고 문서를 복제하기 때문에, 창을 줄인
// 상태로 추출하면 그 줄어든 폭 그대로 캡처된다(실제로 재현: 창 500px → "document clone size 500x800"
// 콘솔 로그) — windowWidth를 명시해 창 크기와 무관하게 항상 이 폭으로 캡처하게 한다.
const CAPTURE_WIDTH_PX = 1180;

// html2canvas는 windowWidth로 강제한 폭에 맞춰 일반 HTML 요소(퍼센트 left/width 등)는 클론 문서
// 안에서 정상적으로 다시 레이아웃하지만, `<svg width="100%">`처럼 퍼센트 폭을 쓰는 svg는 예외다 —
// 실측 확인: 클론 안의 형제 div(퍼센트 width)는 강제 폭(1180px) 기준으로 750px까지 정상 반영되는데,
// 같은 부모 밑의 svg(퍼센트 width)는 원본 문서(창을 줄인 상태)의 폭(예: 446px)에 그대로 멈춰 있었다.
// PriceSection.jsx의 차트는 svg(꺾은선/점)와 그 형제 div(연도·값 라벨, left를 %로 지정)가 같은 폭을
// 기준으로 겹쳐 그려지는 구조라서, 이 불일치가 그대로 "차트는 좁은 폭에 눌려 있는데 라벨은 넓은
// 폭 기준으로 퍼져 있어 서로 어긋나는" 증상으로 나타난다 — 창을 줄인 상태로 추출할 때만 재현되는
// 이유도 이 때문(창이 이미 1180px 이상이면 두 폭이 같아서 어긋날 여지가 없다).
// 해결: onclone 콜백에서 이미 정상적으로 반영된 형제 컨테이너의 실측 폭을 읽어, svg 자체의 폭을
// 퍼센트 대신 그 값으로 픽셀 고정한다 — 그러면 캡처 시점에 더 이상 퍼센트 계산에 의존하지 않는다.
function fixChartSvgWidths(clonedDoc) {
  clonedDoc.querySelectorAll("svg.price-chart-svg").forEach((svg) => {
    const width = svg.parentElement.getBoundingClientRect().width;
    svg.style.width = `${width}px`;
  });
}

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
    onclone: fixChartSvgWidths,
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
