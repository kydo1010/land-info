# python 샘플 코드
# 개별공시지가
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from _common import load_env_key

url = "https://api.vworld.kr/ned/data/getIndvdLandPrice"
query_params = "?" + urlencode({
    "key": load_env_key("VWORLD_API_KEY"),
    "stdrYear": "2025",  # 기준연도(YYYY: 4자리)
    "reqLvl": "3",  # 요청구분(1: 시도단위, 2: 시군구단위, 3: 읍면동리단위)
    "ldCode": "1165010800",  # 법정동코드(reqLvl값이 3일 경우: 2~10자리)
    "format": "json",  # 응답결과 형식(xml 또는 json)
    "numOfRows": "10",  # 검색건수 (최대 1000)
    "pageNo": "1",  # 페이지 번호
})

request = Request(url + query_params)
request.get_method = lambda: "GET"

try:
    response_body = urlopen(request).read()
except HTTPError as e:
    response_body = e.read()

print(response_body.decode("utf-8"))
