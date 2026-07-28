"""건축HUB 표제부/층별개요 API (data.go.kr) — 8-1 참조.

8-3 실제 호출 테스트로 getBrTitleInfo 성공 응답 구조(response.header/body.items.item)를
확인했다(강남파이낸스센터 실제 데이터로 검증됨). 이 사실을 근거로 getBrFlrOulnInfo도 같은
data.go.kr Swagger 컨벤션을 따를 것으로 보고 동일하게 파싱한다.

건축물이 없는 필지가 totalCount "0"으로 응답한다는 것(8-1)은 실제 호출로 검증된 적은
없다 — 실제 나지 주소로 한 번 더 확인해보는 게 좋다.
"""

from ..config import get_settings
from ..errors import generic_error
from ..schemas.building import BrFlrOulnItem, BrTitleItem
from .base import get_json

BASE_URL = "https://apis.data.go.kr/1613000/BldRgstHubService"


def _check_header(data: dict, *, service: str) -> dict:
    header = data.get("response", {}).get("header", {})
    if header.get("resultCode") != "00":
        raise generic_error(
            service=service,
            code=header.get("resultCode", "UNKNOWN"),
            message=header.get("resultMsg", ""),
            status_code=502,
        )
    return data["response"]["body"]


async def get_title(sigungu_cd: str, bjdong_cd: str, plat_gb_cd: str, bun: str, ji: str) -> BrTitleItem | None:
    settings = get_settings()
    data = await get_json(
        f"{BASE_URL}/getBrTitleInfo",
        {
            "serviceKey": settings.building_api_key,
            "sigunguCd": sigungu_cd,
            "bjdongCd": bjdong_cd,
            "platGbCd": plat_gb_cd,
            "bun": bun,
            "ji": ji,
            "_type": "json",
            "numOfRows": 1,
            "pageNo": 1,
        },
        service="building_title",
    )
    body = _check_header(data, service="building_title")
    if body.get("totalCount") in ("0", 0):
        return None
    item = body["items"]["item"]
    if isinstance(item, list):
        item = item[0]
    return BrTitleItem.model_validate(item)


async def get_floors(sigungu_cd: str, bjdong_cd: str, plat_gb_cd: str, bun: str, ji: str) -> list[BrFlrOulnItem]:
    settings = get_settings()
    data = await get_json(
        f"{BASE_URL}/getBrFlrOulnInfo",
        {
            "serviceKey": settings.building_api_key,
            "sigunguCd": sigungu_cd,
            "bjdongCd": bjdong_cd,
            "platGbCd": plat_gb_cd,
            "bun": bun,
            "ji": ji,
            "_type": "json",
            "numOfRows": 100,
            "pageNo": 1,
        },
        service="building_floors",
    )
    body = _check_header(data, service="building_floors")
    if body.get("totalCount") in ("0", 0):
        return []
    items = body["items"]["item"]
    if isinstance(items, dict):
        items = [items]
    return [BrFlrOulnItem.model_validate(item) for item in items]
