import { LoadingBlock, ErrorBlock } from "./StatusBlocks.jsx";

// 요약의 첫 번째 행(4열 값 타일)과 두 번째 행(건축물대장 4열)이 서로 다른 내용 구조를 갖고 있어도 같은 높이로 보이도록 두 행 모두 이 값을 minHeight로 준다 — 셋 중 가장 많은 줄(값+평 단위 줄+sub)이 들어가는
// 칸에 맞춘 값이다.
const TILE_MIN_HEIGHT = 148;

function SummaryTile({ s, borderRight }) {
  return (
    <div style={{ padding: "24px 26px", minHeight: TILE_MIN_HEIGHT, borderRight: borderRight ? "1px solid #EDEAE2" : "none" }}>
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
          {/* 평 단위 값 — ㎡/원 값 옆에 괄호로 붙이지 않고 그 아래 별도 줄로 병기한다. 크기는 ㎡ 값의
              80%, 굵기는 없앰(그 외 색 등은 동일). */}
          {s.valueNote && (
            <div
              style={{
                fontSize: 16,
                letterSpacing: "-.02em",
                marginTop: 2,
                color: s.ready ? "#171614" : "#C9C3B6",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {s.valueNote}
            </div>
          )}
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
        </>
      )}
    </div>
  );
}

// 건축물대장 데이터가 있을 때(status === "ok")만 쓰는 4열 표 — BuildingSection.jsx 상단 행과
// 완전히 같은 UI(라벨 + 단일 값, 또는 라벨 + 불릿 2줄)를 그대로 재사용한다. 연면적/층수, 건폐율/용적률은
// 각 쌍 안에서 굵기·크기가 서로 동일해야 하므로(둘 중 하나만 강조하지 않음) 불릿 li 스타일을 통일한다.
function BuildingSummaryRow({ s }) {
  const b = s.building;
  const cellStyle = (borderRight) => ({ padding: "24px 26px", minHeight: TILE_MIN_HEIGHT, borderRight: borderRight ? "1px solid #EDEAE2" : "none" });
  const ulStyle = { margin: "8px 0 0", padding: "0 0 0 18px", listStyle: "disc", display: "flex", flexDirection: "column", gap: 6 };
  const liLabelStyle = { fontSize: 14, color: "#6B665E" };
  const liValueStyle = { fontSize: 15.5, color: "#171614", fontWeight: 600 };
  const dash = "—";

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        <div style={cellStyle(true)}>
          <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>건축물 주구조</div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.02em", marginTop: 8 }}>{b.struct || dash}</div>
        </div>
        <div style={cellStyle(true)}>
          <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>건축물 주용도</div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.02em", marginTop: 8 }}>{b.purpose || dash}</div>
        </div>
        <div style={cellStyle(true)}>
          <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>건축 규모</div>
          <ul style={ulStyle}>
            <li style={liLabelStyle}>
              연면적 <span style={liValueStyle}>{b.totalFloorArea || dash}</span>
              {b.totalFloorAreaPyeong && (
                <div style={{ ...liValueStyle, fontSize: liValueStyle.fontSize * 0.9, fontWeight: undefined, marginTop: 2 }}>{b.totalFloorAreaPyeong}</div>
              )}
            </li>
            <li style={liLabelStyle}>
              층수 <span style={liValueStyle}>{b.floorRange || dash}</span>
            </li>
          </ul>
        </div>
        <div style={cellStyle(false)}>
          <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>건폐율 / 용적률</div>
          <ul style={ulStyle}>
            <li style={liLabelStyle}>
              건폐 <span style={liValueStyle}>{b.bcr || dash}</span>
            </li>
            <li style={liLabelStyle}>
              용적 <span style={liValueStyle}>{b.far || dash}</span>
            </li>
          </ul>
        </div>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", borderBottom: "1px solid #E5E1D8" }}>
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
