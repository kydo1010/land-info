import { useState } from "react";

const TAG_STYLE = {
  저촉: { bg: "#d1e2ccff", fg: "#246c7bff" },
  접함: { bg: "#d5ddecff", fg: "#3e4460ff" },
  포함: { bg: "#edcdc4ff", fg: "#8E3B21" },
};

const TAG_DESC = {
  포함: "토지 전체나 특정 구역이 해당 용도(지번 등) 안에 온전히 속해 있는 상태",
  저촉: "토지의 일부가 계획선(도로선 등)에 침범되어 걸쳐 있는 상태. 건축이나 형질 변경 등 토지 이용에서 제한을 받음.",
  접함: "대상 토지가 도시 계획선을 침범하지 않고 도로에 접해있는 상태. 건축법상 통행이나 허가에 유리함.",
};

const COLLAPSED_HEIGHT = 190;

export default function ZoneSection({ status, use, rules }) {
  const loading = status === "loading";
  const [expanded, setExpanded] = useState(false);
  const canCollapse = rules.length >= 5;
  const isCollapsed = canCollapse && !expanded;
  const counts = ["포함", "저촉", "접함"].map((kind) => {
    const n = rules.filter((r) => r.kind === kind).length;
    return { kind, count: n + "건", color: n ? "#171614" : "#C9C3B6", ...TAG_STYLE[kind] };
  });
  const byTag = ["포함", "저촉", "접함"].map((kind) => ({
    kind,
    items: rules.filter((r) => r.kind === kind).slice().sort((a, b) => a.name.localeCompare(b.name, "ko")),
  }));

  return (
    <section id="zone" data-screen-label="토지이용계획" style={{ scrollMarginTop: 190 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#1F4B43", letterSpacing: ".1em" }}>01</div>
        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-.025em" }}>토지이용계획</h2>
        <div style={{ fontSize: 14, color: "#8C877E" }}>국토교통부 / 토지이용규제정보서비스</div>
      </div>
      <div style={{ background: "#FFFFFF", border: "1px solid #E5E1D8", borderRadius: 3 }}>
        {loading ? (
          <div style={{ padding: 26, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
            {[1, 2, 3].map((k) => (
              <div key={k} className="shimmer">
                <div style={{ height: 10, width: 54, background: "#EDEAE2" }} />
                <div style={{ height: 20, width: "74%", background: "#E7E3DA", marginTop: 12 }} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 40,
                padding: "24px 26px",
                borderBottom: "1px solid #EDEAE2",
              }}
            >
              <div>
                <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>용도지역</div>
                <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-.02em", marginTop: 8 }}>{use}</div>
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: "0 0 0 18px",
                  listStyle: "disc",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  alignSelf: "center",
                }}
              >
                {counts.map((k) => (
                  <li key={k.kind} style={{ fontSize: 15.5, color: k.color }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          fontSize: 11.5,
                          padding: "3px 9px",
                          borderRadius: 999,
                          background: k.bg,
                          color: k.fg,
                          width: 44,
                          textAlign: "center",
                        }}
                      >
                        {k.kind}
                      </span>
                      <span style={{ color: k.color }}>{k.count}</span>
                    </span>
                    <div style={{ fontSize: 11.5, color: "#A6A19A", marginTop: 4, lineHeight: 1.4 }}>
                      {TAG_DESC[k.kind]}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ padding: "22px 26px 26px" }}>
              <div style={{ fontSize: 14, color: "#8C877E", letterSpacing: ".04em", marginBottom: 12 }}>
                저촉·포함 규제 {rules.length}건
              </div>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    background: "#FFFFFF",
                    maxHeight: isCollapsed ? COLLAPSED_HEIGHT : 4000,
                    overflow: "hidden",
                    transition: "max-height .3s ease",
                  }}
                >
                  {byTag.map(({ kind, items }, idx) => (
                    <div
                      key={kind}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        borderRight: idx < 2 ? "1px solid #E5E1D8" : "none",
                      }}
                    >
                      <div style={{ padding: "10px 14px", borderBottom: "1px solid #EDEAE2", display: "flex", justifyContent: "center" }}>
                        <span
                          style={{
                            fontSize: 15, // 헤더 글자 크기
                            fontWeight: 600,
                            color: "#171614",
                            padding: "3px 9px",
                            width: 44,
                            textAlign: "center",
                          }}
                        >
                          {kind}
                        </span>
                      </div>
                      {items.length ? (
                        items.map((r, i) => (
                          <div
                            key={r.no}
                            style={{
                              padding: "12px 14px",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <span style={{ fontSize: 10.5, color: "#8C877E", width: 18, flex: "none" }}>{i + 1}</span>
                            <span
                              style={{
                                fontSize: 11.5,
                                padding: "3px 9px",
                                borderRadius: 999,
                                background: TAG_STYLE[r.kind].bg,
                                color: TAG_STYLE[r.kind].fg,
                                width: 44,
                                textAlign: "center",
                                flex: "none",
                              }}
                            >
                              {r.kind}
                            </span>
                            <span style={{ fontSize: 15, flex: 1, letterSpacing: "-.01em" }}>{r.name}</span>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: "12px 14px", fontSize: 13.5, color: "#C9C3B6" }}>-</div>
                      )}
                    </div>
                  ))}
                </div>
                {isCollapsed && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 72,
                      background: "linear-gradient(to bottom, rgba(255,255,255,0), #FFFFFF 85%)",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>
              {canCollapse && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="btn-showmore"
                    style={{
                      width: "80%",
                      border: "1px solid #D8D3C8",
                      background: "#FFFFFF",
                      borderRadius: 999,
                      padding: "8px 20px",
                      fontSize: 13,
                      fontFamily: "inherit",
                      color: "#3D3A34",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <span>{expanded ? "접기" : "더보기"}</span>
                    <span aria-hidden="true">{expanded ? "∧" : "∨"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
