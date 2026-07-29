# python 샘플 코드
# 도로명주소 검색
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from _common import load_env_key

url = "https://business.juso.go.kr/addrlink/addrLinkApi.do"
query_params = "?" + urlencode({
    "confmKey": load_env_key("JUSO_API_KEY"),
    "currentPage": "1",  # 페이지 번호
    "countPerPage": "10",  # 페이지당 출력 개수
    "keyword": "서울특별시 강남구 역삼동",  # 검색어
    "resultType": "json",  # 응답결과 형식(xml 또는 json)
})

request = Request(url + query_params)
request.get_method = lambda: "GET"

try:
    response_body = urlopen(request).read()
except HTTPError as e:
    response_body = e.read()

print(response_body.decode("utf-8"))
