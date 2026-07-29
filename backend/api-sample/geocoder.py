# python 샘플 코드
# Geocoder (주소 → 좌표, VWorld)
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from _common import load_env_key

url = "https://api.vworld.kr/req/address"
query_params = "?" + urlencode({
    "service": "address",
    "request": "getCoord",
    "version": "2.0",
    "crs": "epsg:4326",
    "address": "서울특별시 강남구 테헤란로 152",  # 도로명주소 문자열 (PNU 불필요)
    "type": "road",  # 주소 유형(PARCEL: 지번, ROAD: 도로명)
    "key": load_env_key("VWORLD_API_KEY"),
})

request = Request(url + query_params)
request.get_method = lambda: "GET"

try:
    response_body = urlopen(request).read()
except HTTPError as e:
    response_body = e.read()

print(response_body.decode("utf-8"))
