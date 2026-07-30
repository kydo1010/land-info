"""건축HUB 표제부/층별개요/기본개요/총괄표제부/오수정화시설 API (data.go.kr) — 8-1, 8-9 참조.

8-3 실제 호출 테스트로 getBrTitleInfo 성공 응답 구조(response.header/body.items.item)를
확인했다(강남파이낸스센터 실제 데이터로 검증됨). 이 사실을 근거로 나머지 4개 오퍼레이션도
같은 data.go.kr Swagger 컨벤션을 따를 것으로 보고 동일하게 파싱하며, 8-9에서 실제 호출로
그 가정을 확인했다.

건축물이 없는 필지가 totalCount "0"으로 응답한다는 것(8-1)은 실제 호출로 검증된 적은
없다 — 실제 나지 주소로 한 번 더 확인해보는 게 좋다. 반면 getBrRecapTitleInfo(총괄표제부)가
단일 동 건물에서 totalCount "0"으로 응답하는 것은 8-9에서 실제로 확인됐다 — 여러 동으로
이루어진 대지에만 존재하는 레코드라 정상적인 "데이터 없음"이다.
"""

from ..config import get_settings
from ..errors import generic_error
from ..schemas.building import BrBasisOulnItem, BrFlrOulnItem, BrRecapTitleItem, BrTitleItem, BrWclfItem
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


def _params(sigungu_cd: str, bjdong_cd: str, plat_gb_cd: str, bun: str, ji: str, num_of_rows: int) -> dict:
    return {
        "serviceKey": get_settings().building_api_key,
        "sigunguCd": sigungu_cd,
        "bjdongCd": bjdong_cd,
        "platGbCd": plat_gb_cd,
        "bun": bun,
        "ji": ji,
        "_type": "json",
        "numOfRows": num_of_rows,
        "pageNo": 1,
    }


async def _fetch_one(operation: str, service: str, sigungu_cd: str, bjdong_cd: str, plat_gb_cd: str, bun: str, ji: str) -> dict | None:
    data = await get_json(
        f"{BASE_URL}/{operation}",
        _params(sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji, 1),
        service=service,
    )
    body = _check_header(data, service=service)
    if body.get("totalCount") in ("0", 0):
        return None
    item = body["items"]["item"]
    return item[0] if isinstance(item, list) else item


async def get_title(sigungu_cd: str, bjdong_cd: str, plat_gb_cd: str, bun: str, ji: str) -> BrTitleItem | None:
    item = await _fetch_one("getBrTitleInfo", "building_title", sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji)
    return BrTitleItem.model_validate(item) if item else None


async def get_basis_ouln(sigungu_cd: str, bjdong_cd: str, plat_gb_cd: str, bun: str, ji: str) -> BrBasisOulnItem | None:
    item = await _fetch_one("getBrBasisOulnInfo", "building_basis", sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji)
    return BrBasisOulnItem.model_validate(item) if item else None


async def get_recap_title(sigungu_cd: str, bjdong_cd: str, plat_gb_cd: str, bun: str, ji: str) -> BrRecapTitleItem | None:
    item = await _fetch_one("getBrRecapTitleInfo", "building_recap", sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji)
    return BrRecapTitleItem.model_validate(item) if item else None


async def get_wclf(sigungu_cd: str, bjdong_cd: str, plat_gb_cd: str, bun: str, ji: str) -> BrWclfItem | None:
    item = await _fetch_one("getBrWclfInfo", "building_wclf", sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji)
    return BrWclfItem.model_validate(item) if item else None


async def get_floors(sigungu_cd: str, bjdong_cd: str, plat_gb_cd: str, bun: str, ji: str) -> list[BrFlrOulnItem]:
    data = await get_json(
        f"{BASE_URL}/getBrFlrOulnInfo",
        _params(sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji, 100),
        service="building_floors",
    )
    body = _check_header(data, service="building_floors")
    if body.get("totalCount") in ("0", 0):
        return []
    items = body["items"]["item"]
    if isinstance(items, dict):
        items = [items]
    return [BrFlrOulnItem.model_validate(item) for item in items]
