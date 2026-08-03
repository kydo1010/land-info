import { useState } from "react";
import { LoadingBlock, ErrorBlock } from "./StatusBlocks.jsx";

const FLOORS_COLLAPSED_HEIGHT = 190;

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", padding: "10px 2px", borderBottom: "1px solid #F3F0E9", fontSize: 14.5, alignItems: "baseline" }}>
      <div style={{ color: "#8C877E" }}>{label}</div>
      <div style={{ color: "#171614", fontWeight: 500, letterSpacing: "-.01em" }}>{value}</div>
    </div>
  );
}

function InfoGroup({ title, rows }) {
  return (
    <div style={{ padding: "22px 26px", borderBottom: "1px solid #EDEAE2" }}>
      <div style={{ marginBottom: 10 }}>{title}</div>
      <div>
        {rows.map(([label, value]) => (
          <InfoRow key={label} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}

export default function BuildingSection({ status, building, onRetry }) {
  const loading = status === "loading";
  const empty = status === "empty";
  const error = status === "error";
  const b = building || {};
  const [floorsExpanded, setFloorsExpanded] = useState(false);
  const floors = b.floors || [];
  const canCollapseFloors = floors.length >= 5;
  const isFloorsCollapsed = canCollapseFloors && !floorsExpanded;

  return (
    <section id="bld" data-screen-label="건축물대장" style={{ scrollMarginTop: 190 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#1F4B43", letterSpacing: ".1em" }}>03</div>
        <h2 style={{ margin: 0, fontSize: 25, fontWeight: 700, letterSpacing: "-.025em" }}>건축물대장</h2>
        <div style={{ fontSize: 14, color: "#8C877E" }}>국토교통부 · 건축물대장 표제부 / 층별개요</div>
      </div>
      <div style={{ background: "#FFFFFF", border: "1px solid #E5E1D8", borderRadius: 3 }}>
        {loading && <LoadingBlock height={220} />}

        {status === "ok" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #EDEAE2" }}>
              <div style={{ padding: "24px 26px", borderRight: "1px solid #EDEAE2" }}>
                <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>주구조</div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.02em", marginTop: 8 }}>{b.struct}</div>
              </div>
              <div style={{ padding: "24px 26px", borderRight: "1px solid #EDEAE2" }}>
                <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>주용도</div>
                <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-.02em", marginTop: 8 }}>{b.purpose}</div>
              </div>
              <div style={{ padding: "24px 26px", borderRight: "1px solid #EDEAE2" }}>
                <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>면적</div>
                <ul style={{ margin: "8px 0 0", padding: "0 0 0 18px", listStyle: "disc", display: "flex", flexDirection: "column", gap: 6 }}>
                  <li style={{ fontSize: 14, color: "#6B665E" }}>
                    대지 <span style={{ fontSize: 15.5, color: "#171614", fontWeight: 600 }}>{b.siteArea}</span>
                  </li>
                  <li style={{ fontSize: 14, color: "#6B665E" }}>
                    건축 <span style={{ fontSize: 15.5, color: "#171614", fontWeight: 600 }}>{b.buildArea}</span>
                  </li>
                </ul>
              </div>
              <div style={{ padding: "24px 26px" }}>
                <div style={{ fontSize: 13.5, color: "#8C877E", letterSpacing: ".04em" }}>건폐율 / 용적률</div>
                <ul style={{ margin: "8px 0 0", padding: "0 0 0 18px", listStyle: "disc", display: "flex", flexDirection: "column", gap: 6 }}>
                  <li style={{ fontSize: 14, color: "#6B665E" }}>
                    건폐 <span style={{ fontSize: 15.5, color: "#171614", fontWeight: 600 }}>{b.bcr}</span>
                  </li>
                  <li style={{ fontSize: 14, color: "#6B665E" }}>
                    용적 <span style={{ fontSize: 15.5, color: "#171614", fontWeight: 600 }}>{b.far}</span>
                  </li>
                </ul>
              </div>
            </div>

            <InfoGroup
              title=<h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: "#777777" }}>대지 및 건물 기본 정보</h3>
              rows={[
                ["고유번호", b.uniqueNo],
                ["건물ID", b.buildingId || "-"],
                ["명칭", b.name],
                ["호수/가구수/세대수", b.householdSummary],
                ["대지위치", b.siteLocation],
                ["지번", b.jibun],
                ["도로명주소", b.roadAddress],
              ]}
            />

            <InfoGroup
              title=<h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: "#777777" }}>면적 및 구조 정보</h3>
              rows={[
                ["용적률 산정용 연면적", b.vlRatArea],
                ["지역", b.zoningRegion],
                ["지구", b.zoningDistrict],
                ["구역", b.zoningArea],
                ["높이", b.height],
                ["지붕", b.roof],
                ["부속건축물", b.annexSummary],
              ]}
            />

            <div style={{ padding: "22px 26px 26px", borderBottom: "1px solid #EDEAE2" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: "#777777" }}>사용승인일</h3>
                <div style={{ fontSize: 16 }}>{b.approved}</div>
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: "#777777" }}>층별 개요</h3>
                  <div style={{ fontSize: 16, color: "#A6A19A" }}>{b.floorSummary}</div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "70px 150px 130px 90px 1fr 130px 110px",
                    fontSize: 11.5,
                    color: "#8C877E",
                    padding: "0 2px 9px",
                    borderBottom: "1px solid #E5E1D8",
                  }}
                >
                  <div>구분</div>
                  <div>건물명</div>
                  <div>동명칭</div>
                  <div>층수</div>
                  <div>용도</div>
                  <div>구조</div>
                  <div style={{ textAlign: "right" }}>면적 (㎡)</div>
                </div>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      maxHeight: isFloorsCollapsed ? FLOORS_COLLAPSED_HEIGHT : 4000,
                      overflow: "hidden",
                      transition: "max-height .3s ease",
                    }}
                  >
                    {floors.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "70px 150px 130px 90px 1fr 130px 110px",
                          fontSize: 15.5,
                          padding: "11px 2px",
                          borderBottom: "1px solid #F3F0E9",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ color: "#6B665E", fontSize: 14 }}>{f.category}</div>
                        <div style={{ fontSize: 14.5, letterSpacing: "-.01em" }}>{f.buildingName}</div>
                        <div style={{ color: "#6B665E", fontSize: 14.5 }}>{f.dongName}</div>
                        <div style={{ color: "#3D3A34" }}>{f.floor}</div>
                        <div style={{ letterSpacing: "-.01em" }}>{f.purpose}</div>
                        <div style={{ color: "#6B665E", fontSize: 14.5 }}>{f.struct}</div>
                        <div style={{ textAlign: "right" }}>{f.area}</div>
                      </div>
                    ))}
                  </div>
                  {isFloorsCollapsed && (
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
                {canCollapseFloors && (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
                    <button
                      onClick={() => setFloorsExpanded((v) => !v)}
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
                      <span>{floorsExpanded ? "접기" : "더보기"}</span>
                      <span aria-hidden="true">{floorsExpanded ? "∧" : "∨"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <InfoGroup
              title=<h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: "#777777" }}>승강기 및 인허가 시기</h3>
              rows={[
                ["승강기(승용)", b.elevatorRide],
                ["승강기(비상용)", b.elevatorEmergency],
                ["허가일", b.permitDay],
                ["착공일", b.startDay],
                ["사용승인일", b.approved],
              ]}
            />

            {b.sewage && (
              <InfoGroup
                title=<h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: "#777777" }}>하수처리시설</h3>
                rows={[
                  ["형식", b.sewage.type],
                  ["용량", b.sewage.capacity],
                ]}
              />
            )}

            {b.parking && (
              <div style={{ padding: "22px 26px", borderBottom: "1px solid #EDEAE2" }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: "#777777" }}>주차장 현황</h3>
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", fontSize: 11.5, color: "#8C877E", padding: "0 2px 9px", borderBottom: "1px solid #E5E1D8" }}>
                  <div />
                  <div>옥내</div>
                  <div>옥외</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", fontSize: 14.5, padding: "11px 2px", borderBottom: "1px solid #F3F0E9", alignItems: "center" }}>
                  <div style={{ color: "#8C877E" }}>자주식</div>
                  <div>
                    {b.parking.indoorAutoCount} / {b.parking.indoorAutoArea}
                  </div>
                  <div>
                    {b.parking.outdoorAutoCount} / {b.parking.outdoorAutoArea}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr", fontSize: 14.5, padding: "11px 2px", alignItems: "center" }}>
                  <div style={{ color: "#8C877E" }}>기계식</div>
                  <div>
                    {b.parking.indoorMechCount} / {b.parking.indoorMechArea}
                  </div>
                  <div>
                    {b.parking.outdoorMechCount} / {b.parking.outdoorMechArea}
                  </div>
                </div>
              </div>
            )}

            {b.certifications && b.certifications.length > 0 && (
              <InfoGroup
                title=<h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: "#777777" }}>건축물 인증 현황</h3>
                rows={b.certifications.map((c) => [c.name, c.grade])}
              />
            )}

            <InfoGroup
              title=<h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: "-.02em", color: "#777777" }}>건축물 구조 및 관리 현황</h3>
              rows={[
                ["내진설계 적용 여부", b.seismicApplied],
                ["내진능력", b.seismicCapacity],
              ]}
            />
          </div>
        )}

        {empty && (
          <div style={{ padding: "46px 26px", textAlign: "center" }}>
            <div style={{ width: 34, height: 34, margin: "0 auto 14px", border: "1.5px dashed #C9C3B6" }} />
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-.02em" }}>해당 필지에 건축물이 없습니다</div>
            <div style={{ fontSize: 13, color: "#8C877E", marginTop: 6 }}>건축물대장이 발급되지 않은 나지(裸地)입니다.</div>
          </div>
        )}

        {error && <ErrorBlock onRetry={onRetry} height={220} />}
      </div>
    </section>
  );
}
