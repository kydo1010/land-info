import { LoadingBlock, ErrorBlock } from "./StatusBlocks.jsx";

function SummaryTile({ s, borderRight }) {
  return (
    <div style={{ padding: "24px 26px", borderRight: borderRight ? "1px solid #EDEAE2" : "none" }}>
      <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>{s.label}</div>
      {s.status === "loading" ? (
        <LoadingBlock height={56} compact showText={false} />
      ) : s.status === "error" ? (
        <ErrorBlock onRetry={s.onRetry} height={56} compact showText={false} />
      ) : (
        <>
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-.02em",
              marginTop: 8,
              color: s.ready ? "#171614" : "#C9C3B6",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#A6A19A",
              marginTop: 5,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {s.sub}
          </div>
          {s.extra && (
            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #F1EEE7" }}>
              <div style={{ fontSize: 11.5, color: "#8C877E" }}>{s.extra.label}</div>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-.02em", marginTop: 3, color: "#171614" }}>{s.extra.value}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SummarySection({ items, buildingItem }) {
  return (
    <section id="summary" data-screen-label="요약" style={{ scrollMarginTop: 190 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#1F4B43", letterSpacing: ".1em" }}>00</div>
        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-.025em" }}>요약</h2>
        <div style={{ fontSize: 14, color: "#8C877E" }}>4개 대장의 핵심 항목</div>
      </div>
      <div style={{ border: "1px solid #E5E1D8", borderRadius: 3, background: "#FFFFFF" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: "1px solid #E5E1D8" }}>
          {items.map((s, i) => (
            <SummaryTile key={s.label} s={s} borderRight={i < items.length - 1} />
          ))}
        </div>
        <SummaryTile s={buildingItem} borderRight={false} />
      </div>
    </section>
  );
}
