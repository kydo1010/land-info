export default function BuildingSection({ status, struct, purpose, siteArea, buildArea, bcr, far, approved, floorSummary, floors, onRetry }) {
  const loading = status === "loading";
  const empty = status === "empty";
  const error = status === "error";

  return (
    <section id="bld" data-screen-label="건축물대장" style={{ scrollMarginTop: 190 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#1F4B43", letterSpacing: ".1em" }}>03</div>
        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-.025em" }}>건축물대장</h2>
        <div style={{ fontSize: 14, color: "#8C877E" }}>국토교통부 · 건축물대장 표제부 / 층별개요</div>
      </div>
      <div style={{ background: "#FFFFFF", border: "1px solid #E5E1D8", borderRadius: 3 }}>
        {loading && (
          <div style={{ padding: 26 }}>
            <div className="shimmer" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
              {[1, 2, 3].map((k) => (
                <div key={k}>
                  <div style={{ height: 10, width: 52, background: "#EDEAE2" }} />
                  <div style={{ height: 20, width: "76%", background: "#E7E3DA", marginTop: 12 }} />
                </div>
              ))}
            </div>
            <div className="shimmer" style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 9 }}>
              {[1, 2, 3, 4].map((k) => (
                <div key={k} style={{ height: 14, background: "#F0EDE6" }} />
              ))}
            </div>
          </div>
        )}

        {status === "ok" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #EDEAE2" }}>
              <div style={{ padding: "24px 26px", borderRight: "1px solid #EDEAE2" }}>
                <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>주구조</div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.02em", marginTop: 8 }}>{struct}</div>
              </div>
              <div style={{ padding: "24px 26px", borderRight: "1px solid #EDEAE2" }}>
                <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>주용도</div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.02em", marginTop: 8 }}>{purpose}</div>
              </div>
              <div style={{ padding: "24px 26px", borderRight: "1px solid #EDEAE2" }}>
                <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>면적</div>
                <ul style={{ margin: "8px 0 0", padding: "0 0 0 18px", listStyle: "disc", display: "flex", flexDirection: "column", gap: 6 }}>
                  <li style={{ fontSize: 14, color: "#6B665E" }}>
                    대지 <span style={{ fontSize: 15.5, color: "#171614", fontWeight: 600 }}>{siteArea}</span>
                  </li>
                  <li style={{ fontSize: 14, color: "#6B665E" }}>
                    건축 <span style={{ fontSize: 15.5, color: "#171614", fontWeight: 600 }}>{buildArea}</span>
                  </li>
                </ul>
              </div>
              <div style={{ padding: "24px 26px" }}>
                <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>건폐율 / 용적률</div>
                <ul style={{ margin: "8px 0 0", padding: "0 0 0 18px", listStyle: "disc", display: "flex", flexDirection: "column", gap: 6 }}>
                  <li style={{ fontSize: 14, color: "#6B665E" }}>
                    건폐 <span style={{ fontSize: 15.5, color: "#171614", fontWeight: 600 }}>{bcr}</span>
                  </li>
                  <li style={{ fontSize: 14, color: "#6B665E" }}>
                    용적 <span style={{ fontSize: 15.5, color: "#171614", fontWeight: 600 }}>{far}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div style={{ padding: "22px 26px 26px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>사용승인일</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{approved}</div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>층별 개요</div>
                <div style={{ fontSize: 11.5, color: "#A6A19A" }}>{floorSummary}</div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "110px 1fr 130px 120px",
                  fontSize: 11.5,
                  color: "#8C877E",
                  padding: "0 2px 9px",
                  borderBottom: "1px solid #E5E1D8",
                }}
              >
                <div>층</div>
                <div>용도</div>
                <div>구조</div>
                <div style={{ textAlign: "right" }}>면적 (㎡)</div>
              </div>
              {floors.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 1fr 130px 120px",
                    fontSize: 15.5,
                    padding: "11px 2px",
                    borderBottom: "1px solid #F3F0E9",
                    alignItems: "center",
                  }}
                >
                  <div style={{ color: "#3D3A34" }}>{f.floor}</div>
                  <div style={{ letterSpacing: "-.01em" }}>{f.purpose}</div>
                  <div style={{ color: "#6B665E", fontSize: 14.5 }}>{f.struct}</div>
                  <div style={{ textAlign: "right" }}>{f.area}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {empty && (
          <div style={{ padding: "46px 26px", textAlign: "center" }}>
            <div style={{ width: 34, height: 34, margin: "0 auto 14px", border: "1.5px dashed #C9C3B6" }} />
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-.02em" }}>해당 필지에 건축물이 없습니다</div>
            <div style={{ fontSize: 13, color: "#8C877E", marginTop: 6 }}>건축물대장이 발급되지 않은 나지(裸地)입니다.</div>
          </div>
        )}

        {error && (
          <div style={{ padding: "34px 26px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 14, color: "#8E3B21" }}>건축물대장 조회 중 오류가 발생했습니다. (응답 시간 초과)</div>
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
