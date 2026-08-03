import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { PRINT_MARGIN_MM } from "./utils/printMargins.js";

// 브라우저 인쇄(@page)와 PDF 추출(utils/exportPdf.js)이 같은 여백 값을 printMargins.js 값으로 @page 규칙을 만들어 주입한다.
const printStyle = document.createElement("style");
printStyle.textContent = `@media print { @page { margin: ${PRINT_MARGIN_MM.top}mm ${PRINT_MARGIN_MM.right}mm ${PRINT_MARGIN_MM.bottom}mm ${PRINT_MARGIN_MM.left}mm; } }`;
document.head.appendChild(printStyle);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
