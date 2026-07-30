import asyncio

from ..clients import building_client
from ..schemas.building import BuildingRecord, empty_building_record, to_building_record


async def get_building_record(sigungu_cd: str, bjdong_cd: str, plat_gb_cd: str, bun: str, ji: str) -> BuildingRecord:
    """건축HUB 표제부 + 기본개요/층별개요/총괄표제부/오수정화시설을 조합한다.

    표제부가 없으면(나지) 나머지 4개는 호출할 필요가 없다 — planning.md 9장: Service 레이어 —
    조회 흐름 조합. 나머지 4개는 서로 독립적인 호출이라 병렬로 묶는다.
    """
    title = await building_client.get_title(sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji)
    if title is None:
        return empty_building_record()
    basis, floors, recap, wclf = await asyncio.gather(
        building_client.get_basis_ouln(sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji),
        building_client.get_floors(sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji),
        building_client.get_recap_title(sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji),
        building_client.get_wclf(sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji),
    )
    return to_building_record(sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji, title, basis, floors, recap, wclf)
