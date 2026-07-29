from ..clients import building_client
from ..schemas.building import BuildingRecord, empty_building_record, to_building_record


async def get_building_record(sigungu_cd: str, bjdong_cd: str, plat_gb_cd: str, bun: str, ji: str) -> BuildingRecord:
    """건축HUB 표제부 + 층별개요를 조합한다 (planning.md 9장: Service 레이어 — 조회 흐름 조합)."""
    title = await building_client.get_title(sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji)
    if title is None:
        return empty_building_record()
    floors = await building_client.get_floors(sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji)
    return to_building_record(title, floors)
