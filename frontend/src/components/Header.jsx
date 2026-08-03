import { LoadingBlock } from "./StatusBlocks.jsx";

const SECTIONS = [
  { id: "summary", label: "요약" },
  { id: "price", label: "토지 개별공시지가" },
  { id: "zone", label: "토지이용계획" },
  { id: "land", label: "토지대장" },
  { id: "bld", label: "건축물대장" },
];

export default function Header({
  tabs,
  activeId,
  onFocusTab,
  onCloseTab,
  onNewTab,
  query,
  onQueryChange,
  onKeyDown,
  onSearch,
  searchState,
  candidates,
  onPickCandidate,
  sel,
  activeSection,
  onGoTo,
  onExportPdf,
  onPrint,
}) {
  const hasTabs = tabs.length > 0;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "#F4F2EC",
        borderBottom: "1px solid #DCD7CB",
        boxShadow: "0 10px 24px -18px rgba(23,22,20,.45)",
      }}
    >
      {hasTabs && (
        <div style={{ background: "#DEDAD0" }}>
          <div
            style={{
              maxWidth: 1180,
              margin: "0 auto",
              padding: "9px 32px 0 0",
              display: "flex",
              alignItems: "flex-end",
              gap: 0,
              overflowX: "auto",
            }}
          >
            {tabs.map((t) => {
              const on = t.id === activeId;
              const busy = [t.zone, t.land, t.bld, t.price].some((x) => x === "loading");
              return (
                <div
                  key={t.id}
                  onClick={() => onFocusTab(t.id)}
                  title={busy ? "조회 중…" : t.subtitle}
                  className={on ? "tab-item is-active" : "tab-item is-inactive"}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    height: 36,
                    padding: "0 8px 0 12px",
                    borderRadius: "9px 9px 0 0",
                    background: on ? "#F4F2EC" : "transparent",
                    color: on ? "#171614" : "#4F4B44",
                    cursor: "pointer",
                    width: 214,
                    flex: "none",
                    boxShadow: on ? "0 -1px 3px rgba(23,22,20,.10)" : "none",
                    zIndex: on ? 2 : 1,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontSize: 12.5,
                      fontWeight: on ? 600 : 500,
                      letterSpacing: "-.015em",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {t.title}
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(t.id);
                    }}
                    className="tab-close"
                    style={{
                      width: 20,
                      height: 20,
                      flex: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 999,
                      fontSize: 15,
                      lineHeight: 1,
                      color: "#6B665E",
                    }}
                  >
                    ×
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 10,
                      bottom: 10,
                      width: 1,
                      background: on ? "transparent" : "#C7C1B3",
                    }}
                  />
                </div>
              );
            })}
            <div
              onClick={onNewTab}
              title="주소 추가"
              className="new-tab-btn"
              style={{
                width: 30,
                height: 30,
                margin: "0 0 3px 6px",
                flex: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                fontSize: 18,
                color: "#4F4B44",
                cursor: "pointer",
              }}
            >
              +
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "18px 32px 16px",
          display: "flex",
          alignItems: "center",
          gap: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flex: "none" }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-.02em" }}>필지종합조회</div>
          <div style={{ fontSize: 11, color: "#8C877E", letterSpacing: ".04em" }}>v0.1</div>
        </div>

        <div style={{ flex: 1, display: "flex", gap: 8, position: "relative", maxWidth: 640 }}>
          <input
            value={query}
            onChange={onQueryChange}
            onKeyDown={onKeyDown}
            placeholder="주소를 입력하세요 — 예: 역삼동 737"
            className="search-input"
            style={{
              flex: 1,
              height: 44,
              padding: "0 16px",
              border: "1px solid #D8D3C8",
              background: "#FFFFFF",
              borderRadius: 2,
              fontSize: 15,
              fontFamily: "inherit",
              color: "#171614",
              outline: "none",
            }}
          />
          <button onClick={onSearch} className="btn-search" style={btnSearchStyle}>
            검색
          </button>

          {searchState === "loading" && (
            <div className="rise-in" style={dropdownStyle}>
              <LoadingBlock height={72} compact />
            </div>
          )}

          {searchState === "results" && (
            <div className="rise-in" style={dropdownStyle}>
              <div
                style={{
                  padding: "10px 16px",
                  borderBottom: "1px solid #EDEAE2",
                  fontSize: 14,
                  color: "#8C877E",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>후보 주소</span>
                <span>{candidates.length}건</span>
              </div>
              {candidates.map((c) => (
                <div
                  key={c.pnu}
                  onClick={() => onPickCandidate(c)}
                  className="candidate-row"
                  style={{
                    padding: "13px 16px",
                    borderBottom: "1px solid #F1EEE7",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 500, letterSpacing: "-.01em" }}>{c.jibun}</div>
                    <div style={{ fontSize: 12.5, color: "#8C877E", marginTop: 3 }}>{c.road}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#A6A19A" }}>{c.pnu}</div>
                </div>
              ))}
            </div>
          )}

          {searchState === "none" && (
            <div style={{ ...dropdownStyle, padding: "18px 16px", fontSize: 13.5, color: "#6B665E" }}>
              검색 결과가 없습니다. 시·군·구를 포함해 다시 입력해 보세요.
            </div>
          )}

          {searchState === "error" && (
            <div
              style={{
                ...dropdownStyle,
                border: "1px solid #E0BFB3",
                padding: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 13.5, color: "#8E3B21" }}>주소 검색 서비스에 연결할 수 없습니다.</span>
              <button onClick={onSearch} className="btn-retry" style={retryBtnStyle}>
                재시도
              </button>
            </div>
          )}
        </div>
      </div>

      {sel && (
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 32px 0" }}>
          <div
            style={{
              borderTop: "1px solid #E1DCD0",
              padding: "14px 0 12px",
              display: "flex",
              alignItems: "flex-end",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.025em", marginTop: 4 }}>
                {sel.road}
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#6B665E", paddingBottom: 4 }}>
              {sel.jibun}
            </div>
            <div style={{ marginLeft: "auto", fontSize: 11.5, color: "#8C877E", paddingBottom: 5 }}>
              PNU {sel.pnu}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, paddingBottom: 14, flexWrap: "wrap" }}>
            {SECTIONS.map((s) => {
              const on = activeSection === s.id;
              return (
                <a
                  key={s.id}
                  href={"#" + s.id}
                  onClick={(e) => {
                    e.preventDefault();
                    onGoTo(s.id);
                  }}
                  className="pill"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    fontSize: 13.5,
                    fontWeight: 500,
                    letterSpacing: "-.01em",
                    border: "1px solid #D8D3C8",
                    background: on ? "#1F4B43" : "#FFFFFF",
                    color: on ? "#FBFAF7" : "#3D3A34",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span>{s.label}</span>
                </a>
              );
            })}
            <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
              <button onClick={onExportPdf} className="btn-pdf" style={btnPdfStyle}>
                pdf 추출하기
              </button>
              <button onClick={onPrint} className="btn-print" style={btnPrintStyle}>
                인쇄하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnSearchStyle = {
  height: 44,
  padding: "0 26px",
  border: "none",
  background: "#1F4B43",
  color: "#FBFAF7",
  fontSize: 15,
  fontWeight: 600,
  fontFamily: "inherit",
  borderRadius: 2,
  cursor: "pointer",
  letterSpacing: "-.01em",
};

const retryBtnStyle = {
  border: "1px solid #C9C3B6",
  background: "#FFF",
  padding: "7px 14px",
  fontSize: 12.5,
  fontFamily: "inherit",
  borderRadius: 2,
  cursor: "pointer",
};

// 두 버튼 폭을 동일하게 맞추기 위해 더 긴 라벨("pdf 추출하기")이 필요로 하는 값을 공용으로 사용한다.
const actionBtnWidth = 136;

const btnPdfStyle = {
  width: actionBtnWidth,
  padding: "8px 16px",
  borderRadius: 0,
  fontSize: 13.5,
  fontWeight: 600,
  fontFamily: "inherit",
  letterSpacing: "-.01em",
  border: "none",
  background: "#1F4B43",
  color: "#FBFAF7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const btnPrintStyle = {
  width: actionBtnWidth,
  padding: "8px 16px",
  borderRadius: 0,
  fontSize: 13.5,
  fontWeight: 500,
  fontFamily: "inherit",
  letterSpacing: "-.01em",
  border: "1px solid #D8D3C8",
  background: "#FFFFFF",
  color: "#726f6aff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const dropdownStyle = {
  position: "absolute",
  top: 52,
  left: 0,
  right: 0,
  background: "#FFFFFF",
  border: "1px solid #D8D3C8",
  borderRadius: 2,
  boxShadow: "0 18px 40px -18px rgba(23,22,20,.28)",
  overflow: "hidden",
};
