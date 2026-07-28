export default function LandSection({ status, rows, onRetry }) {
  const loading = status === "loading";
  const error = status === "error";

  return (
    <section id="land" data-screen-label="토지대장" style={{ scrollMarginTop: 190 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#1F4B43", letterSpacing: ".1em" }}>02</div>
        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-.025em" }}>토지대장</h2>
        <div style={{ fontSize: 14, color: "#8C877E" }}>국토교통부 · 토지대장 정보</div>
      </div>
      <div style={{ background: "#FFFFFF", border: "1px solid #E5E1D8", borderRadius: 3 }}>
        {loading && (
          <div style={{ padding: 26, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
            {[1, 2, 3].map((k) => (
              <div key={k} className="shimmer">
                <div style={{ height: 10, width: 48, background: "#EDEAE2" }} />
                <div style={{ height: 20, width: "70%", background: "#E7E3DA", marginTop: 12 }} />
              </div>
            ))}
          </div>
        )}
        {status === "ok" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {rows.map((l) => (
              <div key={l.label} style={{ padding: "24px 26px", borderRight: "1px solid #EDEAE2" }}>
                <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>{l.label}</div>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-.02em", marginTop: 8 }}>{l.value}</div>
                <div style={{ fontSize: 14, color: "#A6A19A", marginTop: 5 }}>{l.note}</div>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div style={{ padding: "34px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 14, color: "#8E3B21" }}>토지대장 조회 중 오류가 발생했습니다. (502 Bad Gateway)</div>
            <button onClick={onRetry} className="btn-retry" style={retryBtnStyle}>
              재시도
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

const retryBtnStyle = {
  border: "1px solid #C9C3B6",
  background: "#FFF",
  padding: "9px 18px",
  fontSize: 13,
  fontFamily: "inherit",
  borderRadius: 2,
  cursor: "pointer",
};
