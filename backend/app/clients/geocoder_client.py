from ..config import get_settings
from ..errors import vworld_error
from ..schemas.coordinates import GeocoderPoint
from .base import get_json

BASE_URL = "https://api.vworld.kr/req/address"


async def get_coordinates(address: str, *, address_type: str = "road") -> GeocoderPoint:
    settings = get_settings()
    data = await get_json(
        BASE_URL,
        {
            "service": "address",
            "request": "getCoord",
            "version": "2.0",
            "crs": "epsg:4326",
            "address": address,
            "type": address_type,
            "key": settings.vworld_api_key,
        },
        service="vworld_geocoder",
    )

    response = data.get("response", {})
    status = response.get("status")
    if status != "OK":
        error = response.get("error", {})
        raise vworld_error(
            service="vworld_geocoder",
            code=error.get("code", status or "UNKNOWN"),
            message=error.get("text", ""),
        )

    point = response["result"]["point"]
    return GeocoderPoint.model_validate(point)
