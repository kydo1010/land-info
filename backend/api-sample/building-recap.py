# python 샘플 코드
# 건축물대장 총괄표제부 조회 (건축HUB, data.go.kr)
# 참고: https://www.data.go.kr/data/15134735/openapi.do (getBrRecapTitleInfo)
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from _common import load_env_key

url = "https://apis.data.go.kr/1613000/BldRgstHubService/getBrRecapTitleInfo"
query_params = "?" + urlencode({
    "serviceKey": load_env_key("BUILDING_API_KEY"),
    "sigunguCd": "11680",  # 시군구코드 (강남구)
    "bjdongCd": "10100",  # 법정동코드 (역삼동)
    "platGbCd": "0",  # 대지구분코드(0:대지, 1:산, 2:블록)
    "bun": "0737",  # 번
    "ji": "0000",  # 지
    "_type": "json",  # 응답결과 형식(xml 또는 json)
    "numOfRows": "10",  # 검색건수
    "pageNo": "1",  # 페이지 번호
})

request = Request(url + query_params)
request.get_method = lambda: "GET"
request.add_header("Accept", "application/json")  # 없으면 200에 빈 바디가 옴(실제 호출로 확인)

try:
    response_body = urlopen(request).read()
except HTTPError as e:
    response_body = e.read()

print(response_body.decode("utf-8"))
