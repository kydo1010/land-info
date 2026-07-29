# python 샘플 코드
# 개별공시지가속성조회 (필지 단위, getIndvdLandPriceAttr)
# 참고: https://www.vworld.kr/dtna/dtna_apiSvcFc_s001.do (개별공시지가, apiNum=25) — 8-8 참조.
# 기존 getIndvdLandPrice(ldCode 기준, 법정동 단위)와 달리 pnu로 필지 단위 조회가 된다.
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from _common import load_env_key

url = "https://api.vworld.kr/ned/data/getIndvdLandPriceAttr"
query_params = "?" + urlencode({
    "format": "json",  # 응답결과 형식(xml 또는 json)
    "key": load_env_key("VWORLD_API_KEY"),
    "pnu": "1168010100107370000",  # 고유번호(8자리 이상) — 필지 식별자
    "numOfRows": "100",  # 검색건수 (최대 1000) — stdrYear를 생략하면 연도별 전체 이력이 내려옴
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
