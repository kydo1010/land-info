from fastapi import APIRouter, Query

from ..schemas.building import BuildingRecord
from ..schemas.envelope import Envelope
from ..services.building_service import get_building_record

router = APIRouter(prefix="/api/building", tags=["building"])


@router.get("")
async def get_building(
    sigungu_cd: str = Query(alias="sigunguCd"),
    bjdong_cd: str = Query(alias="bjdongCd"),
    plat_gb_cd: str = Query(alias="platGbCd"),
    bun: str = Query(),
    ji: str = Query(),
) -> Envelope[BuildingRecord]:
    record = await get_building_record(sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji)
    return Envelope(data=record)
