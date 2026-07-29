"""개별공시지가 API (VWorld getIndvdLandPrice) — 8-1 참조.

8-5 실제 호출 테스트(2026-07-29)로 확인된 사항:
- 성공 시 래퍼는 `{"statelndvdLandPrices": {"field": [항목, ...]}}` (데이터 없음일 땐 대신
  `{"response": {"totalCount": "0", ...}}`가 내려온다 — 래퍼 키 자체가 다르다).
- ⚠️ **필지 단위 조회 불가 확정**: 응답 항목에 지번(`mnnmSlno`) 필드가 아예 없다. `ldCode`(법정동)
  기준으로 지목×용도지역 조합별 통계 전체가 내려오며(테스트한 동 하나에 75건), 특정 PNU로 좁힐 수
  없다 — 11장 미결정 사항 1번 "필지 단위 조회 방법"은 "불가능"으로 확정. 아래 `items[0]`로 첫 항목만
  쓰는 로직은 F-04 설계가 확정되기 전까지의 임시 상태다.
- 최근 연도(2023~2025)는 테스트한 지역 기준 데이터가 없고 2022년까지만 있었다 — 실제 서비스에서
  "최근 5개년"을 그대로 보여줄 수 없을 가능성이 있다.
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
