"""개별공시지가 API (VWorld getIndvdLandPrice) — 8-1 참조.

⚠️ 미검증: 오류 응답 래퍼(`{"statelndvdLandPrices": {"resultCode":..,"resultMsg":..}}`)는 실제로
확인했지만, 국가중점데이터 카테고리라 성공 응답은 아직 못 봤다. 성공 시 아이템 키 경로는 추정이다.

11장 미결정 사항: 이 API는 pnu가 아니라 ldCode(법정동코드)로만 조회되는 것으로 문서에 나와
있어서, 필지 단위로 세분화되는지는 여전히 불명확하다 — 활용신청 승인 후 확인 필요.
"""

from ..config import get_settings
from ..errors import vworld_error
from ..schemas.land_price import IndvdLandPriceItem
from .base import get_json

BASE_URL = "https://api.vworld.kr/ned/data/getIndvdLandPrice"


async def get_land_price_for_year(ld_code: str, year: int) -> IndvdLandPriceItem | None:
    settings = get_settings()
    data = await get_json(
        BASE_URL,
        {"key": settings.vworld_api_key, "ldCode": ld_code, "stdrYear": year, "format": "json"},
        service="vworld_land_price",
    )

    root = data.get("statelndvdLandPrices", {})
    result_code = root.get("resultCode")
    if result_code and result_code != "OK":
        raise vworld_error(service="vworld_land_price", code=result_code, message=root.get("resultMsg", ""))

    # ⚠️ 미검증 구간(위 파일 docstring 참조) — 해당 연도 데이터가 없으면 빈 목록일 것으로 추정
    items = root.get("field") or []
    if not items:
        return None
    return IndvdLandPriceItem.model_validate(items[0])
