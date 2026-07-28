from .common import CamelModel


class GeocoderPoint(CamelModel):
    x: str  # 경도(longitude)
    y: str  # 위도(latitude)


class Coordinates(CamelModel):
    """F-04 지도 UI 좌표 — frontend가 selCoords로 쓰는 것과 동일한 모양."""

    lat: str
    lng: str


def to_coordinates(point: GeocoderPoint) -> Coordinates:
    return Coordinates(lat=point.y, lng=point.x)
