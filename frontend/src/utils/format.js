export const num = (n) => n.toLocaleString("en-US");

// 숫자와 단위(㎡, %, 건, 평, 원/㎡ 등) 사이에 얇은 공백을 넣어 가독성을 높인다.
const UNIT = /([\d.,]) ?(㎡|%|건|평|원\/㎡|원|만|층|㎡\))/g;
export const sp = (v) => (typeof v === "string" ? v.replace(UNIT, "$1 $2") : v);

// 공시지가 5개년 꺾은선 차트 좌표 계산. rows는 [{year, value|null}, ...] — value가 null인
// 연도는 선이 끊기는 모습(F-04 요구사항)으로 표시된다.
export function buildChart(rows) {
  const vals = rows.filter((r) => r.value).map((r) => r.value);
  const min = Math.min(...vals) * 0.94;
  const max = Math.max(...vals) * 1.04;
  const X = (i) => 124 + i * ((540 - 124) / (rows.length - 1));
  const Y = (v) => 24 + (1 - (v - min) / (max - min)) * 128;

  const segments = [];
  let cur = [];
  rows.forEach((r, i) => {
    if (r.value) {
      cur.push(X(i).toFixed(1) + "," + Y(r.value).toFixed(1));
    } else {
      if (cur.length > 1) segments.push({ points: cur.join(" ") });
      cur = [];
    }
  });
  if (cur.length > 1) segments.push({ points: cur.join(" ") });

  const gapLines = [];
  rows.forEach((r, i) => {
    if (!r.value) {
      const prev = rows[i - 1];
      const next = rows[i + 1];
      if (prev && prev.value && next && next.value) {
        gapLines.push({ x1: X(i - 1), y1: Y(prev.value), x2: X(i + 1), y2: Y(next.value) });
      }
    }
  });

  const L = (x) => ((x / 560) * 100).toFixed(3) + "%";
  const T = (y) => ((y / 210) * 190).toFixed(1) + "px";
  const dots = rows.map((r, i) =>
    r.value
      ? { cx: X(i), cy: Y(r.value), r: 4, fill: "#FFFFFF", stroke: "#DC143C", label: (r.value / 10000).toFixed(0) + "만", left: L(X(i)), labelTop: T(Y(r.value) - 10), labelFill: "#3D3A34", year: r.year }
      : { cx: X(i), cy: 152, r: 3, fill: "#EDEAE2", stroke: "#D8D3C8", label: "미제공", left: L(X(i)), labelTop: T(178), labelFill: "#A6A19A", year: r.year }
  );

  const gridLines = [0, 1, 2, 3].map((k) => {
    const v = min + ((max - min) * k) / 3;
    const y = Y(v);
    return { y, top: T(y), label: (v / 10000).toFixed(0) + "만" };
  });

  const priceRows = rows.map((r, i) => {
    const prev = rows[i - 1];
    let delta = "—";
    if (r.value && prev && prev.value) {
      delta = (r.value > prev.value ? "+" : "") + (((r.value - prev.value) / prev.value) * 100).toFixed(1) + "%";
    }
    return {
      year: r.year,
      value: r.value ? num(r.value) : "데이터 미제공",
      delta,
      valueColor: r.value ? "#171614" : "#A6A19A",
      deltaColor: delta.startsWith("+") ? "#1F4B43" : "#A6A19A",
    };
  });

  const withVal = rows.filter((r) => r.value);
  const last = withVal[withVal.length - 1];
  const prev = withVal[withVal.length - 2];

  return {
    segments,
    gapLines,
    dots,
    gridLines,
    priceRows,
    hasGap: rows.some((r) => r.value == null),
    priceLatest: num(last.value),
    priceLatestYear: last.year,
    priceDelta: prev ? "전년 대비 +" + (((last.value - prev.value) / prev.value) * 100).toFixed(1) + "%" : "—",
  };
}
