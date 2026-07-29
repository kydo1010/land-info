"""토지·임야정보 API (VWorld ladfrlList) — 8-1 참조.

8-5 실제 호출 테스트(2026-07-29)로 성공 응답 구조 확인 완료: `{"ladfrlVOList": {"ladfrlVOList": [항목, ...]}}` —
안쪽 `ladfrlVOList`가 바로 항목 배열이다(`ladfrlVO` 키로 한 번 더 감싸져 있지 않음).
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

    items = root.get("ladfrlVOList") or []
    if not items:
        return None
    return LadfrlItem.model_validate(items[0])
