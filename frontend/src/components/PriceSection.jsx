const TAG_COL_STYLE = { display: "grid", gridTemplateColumns: "1fr 1fr 110px 150px" };

export default function PriceSection({
  status,
  selShort,
  selCoords,
  chart,
  ldCodeNm,
  ldCode,
  breakdownYears,
  breakdown,
  selectedYear,
  onSelectYear,
}) {
  const loading = status === "loading";

  return (
    <section id="price" data-screen-label="공시지가 트래커" style={{ scrollMarginTop: 190 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#1F4B43", letterSpacing: ".1em" }}>04</div>
        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-.025em" }}>공시지가 트래커</h2>
        <div style={{ fontSize: 14, color: "#8C877E" }}>국토교통부 · 개별공시지가 (최근 5개년)</div>
      </div>

      {status === "ok" && (
        <div
          style={{
            fontSize: 12.5,
            color: "#6B665E",
            background: "#F7F5EF",
            border: "1px solid #EDEAE2",
            borderRadius: 3,
            padding: "10px 14px",
            marginBottom: 14,
            lineHeight: 1.6,
          }}
        >
          개별공시지가 API는 <strong>필지 단위 조회가 불가능</strong>해, 아래 수치·표는 이 주소가 속한 법정동{" "}
          <strong>
            {ldCodeNm}({ldCode})
          </strong>{" "}
          전체의 통계입니다 — 이 필지만의 값이 아닙니다.
        </div>
      )}

      <div
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E1D8",
          borderRadius: 3,
          display: "grid",
          gridTemplateColumns: "380px 1fr",
        }}
      >
        <div style={{ borderRight: "1px solid #EDEAE2", padding: 20 }}>
          <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em", marginBottom: 12 }}>위치</div>
          <div
            style={{
              position: "relative",
              height: 300,
              border: "1px solid #E5E1D8",
              backgroundColor: "#F1EFE8",
              backgroundImage:
                "linear-gradient(#E4E0D6 1px, transparent 1px), linear-gradient(90deg, #E4E0D6 1px, transparent 1px), linear-gradient(#EAE6DC 1px, transparent 1px), linear-gradient(90deg, #EAE6DC 1px, transparent 1px)",
              backgroundSize: "96px 96px, 96px 96px, 24px 24px, 24px 24px",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", left: 0, right: 0, top: 116, height: 26, background: "#FFFFFF", borderTop: "1px solid #DED9CE", borderBottom: "1px solid #DED9CE" }} />
            <div style={{ position: "absolute", top: 0, bottom: 0, left: 196, width: 18, background: "#FFFFFF", borderLeft: "1px solid #DED9CE", borderRight: "1px solid #DED9CE" }} />
            <div style={{ position: "absolute", left: 130, top: 148, width: 58, height: 46, background: "#DCD6C9", border: "1px solid #CFC8B9" }} />
            <div style={{ position: "absolute", left: 232, top: 62, width: 44, height: 40, background: "#DCD6C9", border: "1px solid #CFC8B9" }} />
            <div style={{ position: "absolute", left: 150, top: 78, width: 34, height: 34, background: "#1F4B43", opacity: 0.1 }} />
            <div style={{ position: "absolute", left: 158, top: 82, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ background: "#171614", color: "#FBFAF7", fontSize: 11, padding: "4px 8px", borderRadius: 2, whiteSpace: "nowrap" }}>
                {selShort}
              </div>
              <div style={{ width: 1, height: 14, background: "#171614" }} />
              <div style={{ width: 9, height: 9, borderRadius: 999, background: "#171614", border: "2px solid #FBFAF7" }} />
            </div>
            <div style={{ position: "absolute", right: 8, bottom: 8, fontSize: 10, color: "#A19B90", background: "rgba(250,249,246,.8)", padding: "3px 6px" }}>
              {selCoords}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "#A6A19A", marginTop: 10, lineHeight: 1.6 }}>
            좌표는 VWorld Geocoder(주소 문자열 기반) — 지도 위 위치 표시는 목업이며, 실제 지도 라이브러리는 미정(11장 참조)
          </div>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          {loading && (
            <div className="shimmer" style={{ height: 300, display: "flex", alignItems: "flex-end", gap: 14 }}>
              {[1, 2, 3, 4, 5].map((k) => (
                <div key={k} style={{ flex: 1, height: "60%", background: "#F0EDE6" }} />
              ))}
            </div>
          )}

          {status === "ok" && (
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>{chart.priceLatestYear} 개별공시지가</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
                    <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-.02em" }}>{chart.priceLatest}</div>
                    <div style={{ fontSize: 13, color: "#6B665E" }}>원/㎡</div>
                    <div style={{ fontSize: 12.5, color: "#1F4B43" }}>{chart.priceDelta}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: "#A6A19A" }}>단위 원/㎡ · 기준일 1월 1일</div>
              </div>

              <div style={{ position: "relative", width: "100%", height: 190 }}>
                <svg viewBox="0 0 560 210" preserveAspectRatio="none" style={{ width: "100%", height: 190, display: "block" }}>
                  {chart.gridLines.map((g, i) => (
                    <line key={i} x1={102} x2={556} y1={g.y} y2={g.y} stroke="#EDEAE2" strokeWidth={1} />
                  ))}
                  {chart.segments.map((s, i) => (
                    <polyline key={i} points={s.points} fill="none" stroke="#DC143C" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                  ))}
                  {chart.gapLines.map((g, i) => (
                    <line key={i} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} stroke="#171614" strokeWidth={1.5} strokeDasharray="3 5" />
                  ))}
                  {chart.dots.map((d, i) => (
                    <circle key={i} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} stroke={d.stroke} strokeWidth={2} />
                  ))}
                </svg>
                {chart.gridLines.map((g, i) => (
                  <div
                    key={i}
                    style={{ position: "absolute", left: 0, width: "15%", textAlign: "right", paddingRight: 10, boxSizing: "border-box", fontSize: 10.5, color: "#A6A19A", transform: "translateY(-50%)", top: g.top }}
                  >
                    {g.label}
                  </div>
                ))}
                {chart.dots.map((d, i) => (
                  <div
                    key={i}
                    style={{ position: "absolute", transform: "translate(-50%, -100%)", whiteSpace: "nowrap", fontSize: 11, color: d.labelFill, left: d.left, top: d.labelTop }}
                  >
                    {d.label}
                  </div>
                ))}
                {chart.dots.map((d, i) => (
                  <div key={i} style={{ position: "absolute", bottom: -4, transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: 12, color: "#6B665E", left: d.left }}>
                    {d.year}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18, borderTop: "1px solid #E5E1D8" }}>
                <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px", fontSize: 11.5, color: "#8C877E", padding: "9px 2px", borderBottom: "1px solid #EDEAE2" }}>
                  <div>연도</div>
                  <div style={{ textAlign: "right" }}>공시지가 (원/㎡)</div>
                  <div style={{ textAlign: "right" }}>전년 대비</div>
                </div>
                {chart.priceRows.map((r) => (
                  <div key={r.year} style={{ display: "grid", gridTemplateColumns: "80px 1fr 120px", fontSize: 15.5, padding: "10px 2px", borderBottom: "1px solid #F3F0E9" }}>
                    <div style={{ color: "#3D3A34" }}>{r.year}</div>
                    <div style={{ textAlign: "right", color: r.valueColor }}>{r.value}</div>
                    <div style={{ textAlign: "right", fontSize: 14.5, color: r.deltaColor }}>{r.delta}</div>
                  </div>
                ))}
              </div>

              {chart.hasGap && (
                <div style={{ marginTop: 12, fontSize: 14, color: "#8C877E", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 18, height: 0, borderTop: "1.5px dashed #C9C3B6" }} />
                  <span>데이터가 없는 연도는 선을 끊어 표시합니다.</span>
                </div>
              )}

              <div style={{ marginTop: 26 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>
                    {ldCodeNm} 지목·용도지역별 세부 내역
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {breakdownYears.map((y) => (
                      <button
                        key={y}
                        onClick={() => onSelectYear(y)}
                        style={{
                          border: "1px solid " + (y === selectedYear ? "#171614" : "#E5E1D8"),
                          background: y === selectedYear ? "#171614" : "#FFFFFF",
                          color: y === selectedYear ? "#FBFAF7" : "#3D3A34",
                          borderRadius: 999,
                          padding: "4px 12px",
                          fontSize: 12.5,
                          fontFamily: "inherit",
                          cursor: "pointer",
                        }}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                {breakdown && breakdown.length > 0 ? (
                  <div style={{ border: "1px solid #E5E1D8", borderRadius: 3 }}>
                    <div style={{ ...TAG_COL_STYLE, fontSize: 11.5, color: "#8C877E", padding: "9px 12px", borderBottom: "1px solid #EDEAE2" }}>
                      <div>지목</div>
                      <div>용도지역</div>
                      <div style={{ textAlign: "right" }}>면적</div>
                      <div style={{ textAlign: "right" }}>공시지가 (원/㎡)</div>
                    </div>
                    {breakdown.map((r, i) => (
                      <div key={i} style={{ ...TAG_COL_STYLE, fontSize: 14, padding: "9px 12px", borderBottom: "1px solid #F3F0E9" }}>
                        <div>{r.jimok}</div>
                        <div>{r.use}</div>
                        <div style={{ textAlign: "right" }}>{r.area}</div>
                        <div style={{ textAlign: "right" }}>{r.price}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "#A6A19A", padding: "14px 2px" }}>{selectedYear}년 데이터가 없습니다.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
