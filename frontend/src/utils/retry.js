// VWorld JSONP 호출이 실패할 때 오는 응답은 정상 응답과 달리 JS로 감싸지지 않은 맨 JSON인 경우가
// 있는데, 이걸 크롬 ORB(Cross-Origin Read Blocking)가 즉시 차단해버려서 타임아웃을 기다리지도 않고
// 곧바로 실패로 뜬다(root cause: 여러 VWorld 호출을 거의 동시에 쏘다 보니 그중 일부가 업스트림에서
// 산발적으로 오류/rate limit 응답을 주는 것으로 보임 — 매번 같은 호출이 실패하는 게 아니라 그때그때
// 다름). 대부분 몇 번만 다시 부르면 성공하므로, 실패해도 화면에 바로 에러를 보여주지 않고 여기서
// 몇 번 더 시도해본다. 다 실패하면 그제서야 호출부의 .catch()로 넘어가 기존 재시도 버튼 UI가 뜬다.
export async function withRetry(fn, { attempts = 9, delayMs = 300 } = {}) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastErr;
}
