import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// 리포트 DOM 노드를 캔버스로 캡처한 뒤, A4 페이지 높이만큼씩 잘라 여러 페이지 PDF로 만들어 다운로드한다.
// 지도 타일(OpenStreetMap) 이미지는 CORS 헤더가 없을 수 있어 useCORS:true로 시도하되,
// 실패하면 html2canvas가 해당 영역만 비워둘 뿐 전체 캡처가 깨지지는 않는다.
export async function exportElementToPdf(element, filename) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidthMm = pdf.internal.pageSize.getWidth();
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  const pxPerMm = canvas.width / pageWidthMm;
  const pageHeightPx = pageHeightMm * pxPerMm;

  let renderedPx = 0;
  let isFirstPage = true;

  while (renderedPx < canvas.height) {
    const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx);

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;
    sliceCanvas.getContext("2d").drawImage(canvas, 0, renderedPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

    if (!isFirstPage) pdf.addPage();
    pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", 0, 0, pageWidthMm, sliceHeightPx / pxPerMm);

    renderedPx += sliceHeightPx;
    isFirstPage = false;
  }

  pdf.save(filename);
}
