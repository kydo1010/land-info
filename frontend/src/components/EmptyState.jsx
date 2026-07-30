const EXAMPLES = ["역삼동 737", "제주시 애월읍 광령리 1234", "부산대학로 63번길 2"];

export default function EmptyState({ onUseExample }) {
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "120px 32px" }}>
      <div style={{ maxWidth: 560 }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-.035em", lineHeight: 1.25 }}>
          주소 하나로
          <br />
          필지의 네 가지 기록을 한 번에.
        </div>
        <div style={{ fontSize: 15, color: "#6B665E", lineHeight: 1.7, marginTop: 18 }}>
          토지이용계획 · 토지대장 · 건축물대장 · 개별공시지가를 각 기관 사이트를 오가지 않고 <br />한 화면의 보고서로
          확인합니다.
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 28, flexWrap: "wrap" }}>
          {EXAMPLES.map((label) => (
            <button
              key={label}
              onClick={() => onUseExample(label)}
              className="btn-example"
              style={{
                border: "1px solid #D8D3C8",
                background: "#FFF",
                padding: "9px 15px",
                fontSize: 13,
                fontFamily: "inherit",
                borderRadius: 999,
                cursor: "pointer",
                color: "#3D3A34",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
