import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { LoadingBlock, ErrorBlock } from "./StatusBlocks.jsx";

// Vite가 번들링하면 Leaflet 기본 마커 아이콘의 상대 경로가 깨진다 — 아이콘 자산을 직접 import해서 고정한다.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// OpenStreetMap 타일 요청이 산발적으로 실패할 때가 있다(다른 외부 API들과 마찬가지로 일시적인 업스트림
// 문제로 보임) — Leaflet은 실패한 타일을 스스로 재시도하지 않으므로, 지도를 통째로 다시 마운트(key
// 변경)해서 재요청을 유도한다. MAX_AUTO_ATTEMPTS는 최초 시도를 포함한 총 시도 횟수다(utils/retry.js의
// withRetry와 같은 셈법) — 이 횟수를 다 써도 실패하면 자동 재시도를 멈추고 수동 재시도 버튼을 보여준다.
const MAX_AUTO_ATTEMPTS = 5;
const RETRY_DELAY_MS = 300;
// 타일 요청이 응답 없이 멈춰버려 load 이벤트 자체가 안 오는 경우를 대비한 안전장치 타임아웃.
const LOAD_TIMEOUT_MS = 8000;

export default function ParcelMap({ lat, lng, label }) {
  const position = [Number(lat), Number(lng)];
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(1);
  const hadTileErrorRef = useRef(false);
  const settledRef = useRef(false);

  // 이번 시도가 끝났을 때 성공이면 지도를 보여주고, 실패면 남은 자동 재시도 횟수가 있는 동안은
  // 조용히 다음 시도로 넘어가고 다 썼으면 수동 재시도 버튼을 보여준다. load 이벤트와 타임아웃
  // 둘 중 먼저 온 쪽만 처리하도록(둘 다 이 시도를 "끝난 것"으로 취급하려 들 수 있어서) settledRef로 막는다.
  const settleAttempt = (success) => {
    if (settledRef.current) return;
    settledRef.current = true;
    if (success) {
      setStatus("ok");
    } else if (attempt < MAX_AUTO_ATTEMPTS) {
      setTimeout(() => setAttempt((a) => a + 1), RETRY_DELAY_MS);
    } else {
      setStatus("error");
    }
  };

  // attempt가 바뀔 때마다(자동/수동 재시도 포함) 한 번의 시도를 새로 시작한다 — 이전 시도의
  // 타일 오류 기록을 지우고, load 이벤트가 끝까지 안 오는 경우에 대비한 타임아웃을 건다.
  useEffect(() => {
    setStatus("loading");
    hadTileErrorRef.current = false;
    settledRef.current = false;
    const timer = setTimeout(() => settleAttempt(false), LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  // TileLayer의 load는 현재 화면에 필요한 타일들이 성공/실패 여부와 무관하게 전부 응답을 받았을 때
  // 한 번 발생한다 — 그 사이 tileerror가 한 번이라도 있었으면 이번 시도는 실패로 본다.
  const handleTileLoadEnd = () => settleAttempt(!hadTileErrorRef.current);
  const handleTileError = () => {
    hadTileErrorRef.current = true;
  };

  const retry = () => setAttempt((a) => a + 1);

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      {status === "error" ? (
        <ErrorBlock onRetry={retry} height="100%" />
      ) : (
        <>
          <MapContainer key={attempt} center={position} zoom={17} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              eventHandlers={{ load: handleTileLoadEnd, tileerror: handleTileError }}
            />
            <Marker position={position}>
              <Popup>{label}</Popup>
            </Marker>
          </MapContainer>
          {status === "loading" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LoadingBlock height="auto" compact />
            </div>
          )}
        </>
      )}
    </div>
  );
}
