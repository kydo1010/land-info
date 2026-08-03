const retryBtnStyle = {
  border: "1px solid #C9C3B6",
  background: "#FFF",
  padding: "9px 18px",
  fontSize: 13,
  fontFamily: "inherit",
  borderRadius: 2,
  cursor: "pointer",
};

const compactRetryBtnStyle = {
  ...retryBtnStyle,
  padding: "5px 12px",
  fontSize: 11.5,
};

export function LoadingBlock({ height = 200, compact = false, showText = true }) {
  const spinnerSize = compact ? 18 : 32;
  return (
    <div
      style={{
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? 8 : 14,
      }}
    >
      <div className="spinner" style={{ width: spinnerSize, height: spinnerSize, borderWidth: compact ? 2 : 3 }} />
      {showText && (
        <div style={{ fontSize: compact ? 11.5 : 13.5, color: "#8C877E", textAlign: "center" }}>데이터를 가져오는 중입니다...</div>
      )}
    </div>
  );
}

export function ErrorBlock({ onRetry, height = 200, compact = false, showText = true }) {
  return (
    <div
      style={{
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: compact ? 8 : 14,
        textAlign: "center",
        padding: compact ? "0 6px" : 0,
      }}
    >
      {showText && (
        <div style={{ fontSize: compact ? 11.5 : 14, color: "#8E3B21", lineHeight: 1.4 }}>
          조회 중 오류가 발생했습니다.
          <br />
          아래 재시도 버튼을 눌러주세요.
        </div>
      )}
      <button onClick={onRetry} className="btn-retry" style={compact ? compactRetryBtnStyle : retryBtnStyle}>
        재시도
      </button>
    </div>
  );
}
