import { RULES } from "../data/mockData.js";

const TAG_STYLE = {
  저촉: { bg: "#F6E7E0", fg: "#8E3B21" },
  접함: { bg: "#EFEDE5", fg: "#6B665E" },
  해당: { bg: "#E7EFEC", fg: "#1F4B43" },
};

export default function ZoneSection({ status, use, ruleIndices }) {
  const loading = status === "loading";
  const rules = ruleIndices.map((ri) => RULES[ri]);
  const counts = ["해당", "저촉", "접함"].map((kind) => {
    const n = rules.filter((r) => r.kind === kind).length;
    return { kind, count: n + "건", color: n ? "#171614" : "#C9C3B6", ...TAG_STYLE[kind] };
  });

  return (
    <section id="zone" data-screen-label="토지이용계획" style={{ scrollMarginTop: 190 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#1F4B43", letterSpacing: ".1em" }}>01</div>
        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-.025em" }}>토지이용계획</h2>
        <div style={{ fontSize: 14, color: "#8C877E" }}>국토교통부 · 토지이용규제정보서비스</div>
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
                  gap: 6,
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
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ padding: "22px 26px 26px" }}>
              <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em", marginBottom: 12 }}>
                저촉·해당 규제 {rules.length}건
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#EDEAE2" }}>
                {rules.map((r, i) => (
                  <div
                    key={r.name}
                    style={{
                      background: "#FFFFFF",
                      padding: "12px 2px",
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                    }}
                  >
                    <span style={{ fontSize: 10.5, color: "#8C877E", width: 22 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
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
                    <span style={{ fontSize: 16, flex: 1, letterSpacing: "-.01em" }}>{r.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
