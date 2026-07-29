# python 샘플 코드
# 토지이용계획
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from _common import load_env_key

url = "https://api.vworld.kr/ned/data/getLandUseAttr"
query_params = ".?" + urlencode({
    "format": "json",  # 응답결과 형식(xml 또는 json)
    "key": load_env_key("VWORLD_API_KEY"),
    "pnu": "1165010800113320002",  # 고유번호(8자리 이상)
    "numOfRows": "10",  # 검색건수 (최대 1000)
    "pageNo": "1",  # 페이지 번호
    "domain": "https://kyungdong.cloud",
})

request = Request(url + query_params)
request.get_method = lambda: "GET"
request.add_header("Referer", "https://kyungdong.cloud")

try:
    response_body = urlopen(request).read()
except HTTPError as e:
    response_body = e.read()

print(response_body.decode("utf-8"))
