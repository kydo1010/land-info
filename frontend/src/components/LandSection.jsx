import { LoadingBlock, ErrorBlock } from "./StatusBlocks.jsx";

export default function LandSection({ status, rows, onRetry }) {
  const loading = status === "loading";
  const empty = status === "empty";
  const error = status === "error";

  return (
    <section id="land" data-screen-label="토지대장" style={{ scrollMarginTop: 190 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#1F4B43", letterSpacing: ".1em" }}>02</div>
        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-.025em" }}>토지대장</h2>
        <div style={{ fontSize: 14, color: "#8C877E" }}>국토교통부 · 토지대장 정보</div>
      </div>
      <div style={{ background: "#FFFFFF", border: "1px solid #E5E1D8", borderRadius: 3 }}>
        {loading && <LoadingBlock height={180} />}
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
        {empty && (
          <div style={{ padding: "46px 26px", textAlign: "center" }}>
            <div style={{ width: 34, height: 34, margin: "0 auto 14px", border: "1.5px dashed #C9C3B6" }} />
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-.02em" }}>토지대장 정보를 찾을 수 없습니다</div>
            <div style={{ fontSize: 13, color: "#8C877E", marginTop: 6 }}>이 필지의 토지·임야정보가 등록돼 있지 않습니다.</div>
          </div>
        )}

        {error && <ErrorBlock onRetry={onRetry} height={180} />}
      </div>
    </section>
  );
}
