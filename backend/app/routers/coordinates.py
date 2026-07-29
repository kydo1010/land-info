from fastapi import APIRouter, Query

from ..clients import geocoder_client
from ..schemas.coordinates import Coordinates, to_coordinates
from ..schemas.envelope import Envelope

router = APIRouter(prefix="/api/coordinates", tags=["coordinates"])


@router.get("")
async def get_coordinates(address: str = Query(min_length=1)) -> Envelope[Coordinates]:
    point = await geocoder_client.get_coordinates(address)
    return Envelope(data=to_coordinates(point))
