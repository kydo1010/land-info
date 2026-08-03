import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { exportElementToPdf } from "../utils/exportPdf.js";

// 리포트 DOM(reportRef가 가리키는 #report-content)을 PDF로 내려받거나 인쇄하는 동작, 그리고 그
// 순간에 더보기로 접힌 목록을 강제로 펼치는 상태(expandAll)를 관리한다. App.jsx는 reportRef를
// 리포트 컨테이너에 그대로 연결하고, 파일명 같은 도메인 지식(선택된 주소 등)은 모른 채로 둔다.
export function useReportExport() {
  const [expandAll, setExpandAll] = useState(false);
  const reportRef = useRef(null);

  // 인쇄(브라우저 Ctrl+P 포함) 직전/직후에 더보기로 접힌 목록(토지이용계획 규제, 층별개요)을
  // 강제로 펼친다. flushSync로 동기 반영해야 브라우저의 인쇄 렌더링이 펼쳐진 상태를 그대로 캡처한다.
  useEffect(() => {
    const onBeforePrint = () => flushSync(() => setExpandAll(true));
    const onAfterPrint = () => flushSync(() => setExpandAll(false));
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, []);

  const handlePrint = () => window.print();

  // 더보기로 접힌 목록을 강제로 펼친 뒤(flushSync로 동기 반영) 리포트 DOM을 캔버스로 캡처해 PDF로 내려받는다.
  const handleExportPdf = async (filename) => {
    if (!reportRef.current) return;
    flushSync(() => setExpandAll(true));
    try {
      await exportElementToPdf(reportRef.current, filename);
    } finally {
      setExpandAll(false);
    }
  };

  return { reportRef, expandAll, handlePrint, handleExportPdf };
}
