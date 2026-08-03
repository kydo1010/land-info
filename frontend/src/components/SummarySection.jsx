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

// 건축물대장 데이터가 있을 때(status === "ok")만 쓰는 4열 표 — 건축물대장 섹션 상단 행과 같은 항목
// (주구조/주용도/건축 규모/건폐율·용적률)을, 위 3열 요약 타일과 같은 느낌(라벨-값-보조값)으로 보여준다.
function BuildingSummaryRow({ s }) {
  const b = s.building;
  const dash = "—";
  const cols = [
    { label: "주구조", value: b.struct || dash, sub: null },
    { label: "주용도", value: b.purpose || dash, sub: null },
    { label: "건축 규모", value: b.totalFloorArea || dash, sub: b.floorRange || dash },
    { label: "건폐율 · 용적률", value: b.bcr || dash, sub: b.far ? `용적률 ${b.far}` : dash },
  ];
  return (
    <div>
      <div style={{ padding: "24px 26px 4px", fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>{s.label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        {cols.map((c, i) => (
          <div key={c.label} style={{ padding: "8px 26px 24px", borderRight: i < cols.length - 1 ? "1px solid #EDEAE2" : "none" }}>
            <div style={{ fontSize: 11.5, color: "#8C877E" }}>{c.label}</div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-.02em", marginTop: 6, color: "#171614" }}>{c.value}</div>
            {c.sub && <div style={{ fontSize: 13, color: "#A6A19A", marginTop: 5 }}>{c.sub}</div>}
          </div>
        ))}
      </div>
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
        {buildingItem.status === "ok" ? (
          <BuildingSummaryRow s={buildingItem} />
        ) : (
          <SummaryTile s={buildingItem} borderRight={false} />
        )}
      </div>
    </section>
  );
}
