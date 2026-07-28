"""토지이용계획 API (VWorld getLandUseAttr) — 8-1 참조.

⚠️ 미검증: 8-3 실제 호출 테스트에서 오류 응답 래퍼(`{"landUses": {"resultCode":..,"resultMsg":..}}`)는
실제로 확인했지만, 이 API도 국가중점데이터 카테고리라 성공 응답은 아직 못 봤다. 아래 성공 응답
아이템 목록의 정확한 키 경로는 최선의 추정이며, 활용신청 승인 후 재확인이 필요하다.
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

    # ⚠️ 미검증 구간(위 파일 docstring 참조)
    items = root.get("field") or []
    return [LandUseItem.model_validate(item) for item in items]
