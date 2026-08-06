import ParcelMap from "./ParcelMap.jsx";
import { LoadingBlock, ErrorBlock } from "./StatusBlocks.jsx";

export default function PriceSection({ status, selShort, coords, chart, landPriceLatest, landPriceRows, onRetry }) {
  const loading = status === "loading";
  const empty = status === "empty";
  const error = status === "error";

  return (
    <section id="price" data-screen-label="토지 개별공시지가 트래커" style={{ scrollMarginTop: 190 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#1F4B43", letterSpacing: ".1em" }}>01</div>
        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-.025em" }}>토지 개별공시지가 트래커</h2>
        <div style={{ fontSize: 14, color: "#8C877E" }}>국토교통부 · 토지 개별공시지가 (최근 5개년)</div>
      </div>

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
          <div style={{ height: 300, border: "1px solid #E5E1D8", overflow: "hidden", position: "relative", zIndex: 0 }}>
            {coords ? (
              // 좌표(=필지)가 바뀌면 ParcelMap을 완전히 새로 마운트해서 이전 필지의 로딩/재시도
              // 상태(예: 에러로 멈춘 상태)가 새 필지에 그대로 남지 않게 한다.
              <ParcelMap key={`${coords.lat},${coords.lng}`} lat={coords.lat} lng={coords.lng} label={selShort} />
            ) : (
              <div
                style={{
                  height: "100%",
                  backgroundColor: "#F1EFE8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  color: "#A6A19A",
                }}
              >
                좌표를 확인하는 중입니다…
              </div>
            )}
          </div>
          <div style={{ fontSize: 11.5, color: "#A6A19A", marginTop: 10, lineHeight: 1.6 }}>
            좌표는 VWorld Geocoder(주소 문자열 기반), 지도는 OpenStreetMap(Leaflet)
          </div>
        </div>

        <div style={{ padding: "20px 24px 24px" }}>
          {loading && <LoadingBlock height={300} />}

          {status === "ok" && (
            <div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>{chart.priceLatestYear} 토지 개별공시지가</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
                    <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-.02em" }}>{chart.priceLatest}</div>
                    <div style={{ fontSize: 13, color: "#6B665E" }}>원/㎡</div>
                    <div style={{ fontSize: 12.5, color: "#1F4B43" }}>{chart.priceDelta}</div>
                  </div>
                  {/* 평 단위 값 — 원/㎡ 값 옆에 괄호로 붙이지 않고 그 아래 별도 줄로 병기한다. 크기는
                      ㎡ 값의 80%, 굵기는 없앰(그 외는 동일). */}
                  <div style={{ fontSize: 26 * 0.8, letterSpacing: "-.02em", marginTop: 3 }}>{chart.priceLatestPyeong}원/평</div>
                  {/* 토지 공시가격은 총면적에 대한 가격(면적×개별공시지가)이라 개별공시지가와 달리
                      "평당" 값이 성립하지 않는다 — 평 단위 병기 없음. */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 10 }}>
                    <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>토지 공시가격</div>
                    <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.02em", color: "#171614" }}>{landPriceLatest}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: "#A6A19A" }}>단위 원/㎡ (원/평) · 기준일 1월 1일</div>
              </div>

              <div style={{ position: "relative", width: "100%", height: 190 }}>
                <svg
                  className="price-chart-svg"
                  viewBox="0 0 560 210"
                  preserveAspectRatio="none"
                  style={{ width: "100%", height: 190, display: "block" }}
                >
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
                <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 170px 110px", fontSize: 11.5, color: "#8C877E", padding: "9px 2px", borderBottom: "1px solid #EDEAE2" }}>
                  <div>연도</div>
                  <div style={{ textAlign: "right" }}>토지 개별공시지가</div>
                  <div style={{ textAlign: "right" }}>토지 공시가격 (원)</div>
                  <div style={{ textAlign: "right" }}>전년 대비</div>
                </div>
                {chart.priceRows.map((r, i) => (
                  <div key={r.year} style={{ display: "grid", gridTemplateColumns: "80px 1fr 170px 110px", fontSize: 15.5, padding: "10px 2px", borderBottom: "1px solid #F3F0E9" }}>
                    <div style={{ color: "#3D3A34" }}>{r.year}</div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: r.valueColor }}>{r.value} 원/㎡</div>
                      <div style={{ color: r.valueColor, marginTop: 2 }}>{r.pyeongValue != null ? `${r.pyeongValue} 원/평` : "—"}</div>
                    </div>
                    <div style={{ textAlign: "right", color: r.valueColor }}>{landPriceRows[i]?.value ?? "—"}</div>
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
            </div>
          )}

          {empty && (
            <div style={{ height: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div style={{ width: 34, height: 34, marginBottom: 14, border: "1.5px dashed #C9C3B6" }} />
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-.02em" }}>토지 개별공시지가 정보를 찾을 수 없습니다</div>
              <div style={{ fontSize: 13, color: "#8C877E", marginTop: 6 }}>이 필지의 토지 개별공시지가 이력이 등록돼 있지 않습니다.</div>
            </div>
          )}

          {error && <ErrorBlock onRetry={onRetry} height={300} />}
        </div>
      </div>
    </section>
  );
}
