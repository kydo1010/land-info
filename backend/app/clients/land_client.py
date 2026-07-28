"""토지·임야정보 API (VWorld ladfrlList) — 8-1 참조.

⚠️ 미검증: 8-3 실제 호출 테스트에서 이 API(국가중점데이터 카테고리)는 계속 INCORRECT_KEY만
받아서, 성공 응답의 실제 JSON 구조를 한 번도 못 봤다. 아래 파싱은 오류 응답 때 본
`{"ladfrlVOList": {...}}` 래퍼를 근거로 한 최선의 추정이다 — VWorld에 국가중점데이터
활용신청이 승인되면 실제 응답으로 반드시 재확인해야 한다(11장 "즉시 조치 필요" 참조).
"""

from ..config import get_settings
from ..errors import vworld_error
from ..schemas.land import LadfrlItem
from .base import get_json

BASE_URL = "https://api.vworld.kr/ned/data/ladfrlList"


async def get_land(pnu: str) -> LadfrlItem | None:
    settings = get_settings()
    data = await get_json(
        BASE_URL,
        {"key": settings.vworld_api_key, "pnu": pnu, "format": "json", "numOfRows": 1, "pageNo": 1},
        service="vworld_land",
    )

    root = data.get("ladfrlVOList", {})
    error_code = root.get("error")
    if error_code:
        raise vworld_error(service="vworld_land", code=error_code, message=root.get("message", ""))

    # ⚠️ 미검증 구간(위 파일 docstring 참조)
    items = (root.get("ladfrlVOList") or {}).get("ladfrlVO") or []
    if not items:
        return None
    return LadfrlItem.model_validate(items[0])
