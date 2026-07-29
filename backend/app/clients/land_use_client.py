"""토지이용계획 API (VWorld getLandUseAttr) — 8-1 참조.

8-5 실제 호출 테스트(2026-07-29)로 성공 응답 구조 확인 완료: `{"landUses": {"field": [항목, ...]}}` — 아래 파싱과 일치.
"""

from ..config import get_settings
from ..errors import vworld_error
from ..schemas.land_use import LandUseItem
from .base import get_json

BASE_URL = "https://api.vworld.kr/ned/data/getLandUseAttr"


async def get_land_use(pnu: str) -> list[LandUseItem]:
    settings = get_settings()
    data = await get_json(
        BASE_URL,
        {"key": settings.vworld_api_key, "pnu": pnu, "format": "json", "numOfRows": 100, "pageNo": 1},
        service="vworld_land_use",
    )

    root = data.get("landUses", {})
    result_code = root.get("resultCode")
    if result_code and result_code != "OK":
        raise vworld_error(service="vworld_land_use", code=result_code, message=root.get("resultMsg", ""))

    items = root.get("field") or []
    return [LandUseItem.model_validate(item) for item in items]
