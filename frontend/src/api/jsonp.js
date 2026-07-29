// 브라우저에서 <script> 태그로 외부 API를 호출하는 JSONP 유틸.
// fetch/XHR과 달리 <script src="...">는 브라우저의 CORS(동일-출처 정책) 제한을 받지 않기 때문에,
// 서버 쪽에 CORS 헤더가 없어도(VWorld가 그렇다) 호출이 가능하다. 대신 서버가 응답을
// `callback이름(JSON)` 형태의 JS 코드로 감싸서 내려줘야 하는데, VWorld는 `callback` 쿼리
// 파라미터를 지원한다(8-5 실제 호출 테스트로 확인).
let seq = 0;

export function jsonp(url, params, { timeoutMs = 8000 } = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = `__vworldJsonp${Date.now()}_${seq++}`;
    const script = document.createElement("script");
    let settled = false;

    const cleanup = () => {
      clearTimeout(timer);
      delete window[callbackName];
      script.remove();
    };

    window[callbackName] = (data) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(data);
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(`JSONP 요청 시간 초과: ${url}`));
    }, timeoutMs);

    script.onerror = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(`JSONP 스크립트 로드 실패: ${url}`));
    };

    const qs = new URLSearchParams({ ...params, callback: callbackName }).toString();
    script.src = `${url}?${qs}`;
    document.head.appendChild(script);
  });
}
