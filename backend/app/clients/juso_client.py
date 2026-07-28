"""도로명주소 API (juso.go.kr) — 8-1 참조.

주의(8-3 실제 호출 테스트, 11장 "즉시 조치 필요"): VWORLD_API_KEY는 이 API에 통하지 않는다.
별도로 business.juso.go.kr에서 승인키를 발급받아 JUSO_API_KEY에 넣어야 실제로 동작한다.
"""

from ..config import get_settings
from ..errors import generic_error
from ..schemas.address import JusoAddressItem
from .base import get_json

BASE_URL = "https://business.juso.go.kr/addrlink/addrLinkApi.do"


async def search_address(keyword: str, *, current_page: int = 1, count_per_page: int = 10) -> list[JusoAddressItem]:
    settings = get_settings()
    if not settings.juso_api_key:
        raise generic_error(
            service="juso_address",
            code="MISSING_KEY",
            message="JUSO_API_KEY가 설정되지 않았습니다.",
            status_code=500,
        )

    data = await get_json(
        BASE_URL,
        {
            "confmKey": settings.juso_api_key,
            "currentPage": current_page,
            "countPerPage": count_per_page,
            "keyword": keyword,
            "resultType": "json",
        },
        service="juso_address",
    )

    common = data.get("results", {}).get("common", {})
    error_code = common.get("errorCode", "0")
    if error_code != "0":
        raise generic_error(
            service="juso_address",
            code=error_code,
            message=common.get("errorMessage", ""),
            status_code=401 if error_code == "E0001" else 502,
        )

    juso_list = data["results"].get("juso") or []
    return [JusoAddressItem.model_validate(item) for item in juso_list]
