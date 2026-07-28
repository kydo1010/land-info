export default function SummarySection({ items }) {
  return (
    <section id="summary" data-screen-label="요약" style={{ scrollMarginTop: 190 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#1F4B43", letterSpacing: ".1em" }}>00</div>
        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-.025em" }}>요약</h2>
        <div style={{ fontSize: 14, color: "#8C877E" }}>4개 대장의 핵심 항목</div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          border: "1px solid #E5E1D8",
          borderRadius: 3,
          background: "#FFFFFF",
        }}
      >
        {items.map((s) => (
          <div key={s.label} style={{ padding: "24px 26px", borderRight: "1px solid #EDEAE2" }}>
            <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>{s.label}</div>
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
          </div>
        ))}
      </div>
    </section>
  );
}
