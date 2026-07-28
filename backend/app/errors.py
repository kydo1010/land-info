"""공공 API 오류를 서비스 표준 오류로 변환한다 (planning.md 9장 공통 규약).

외부 API의 원본 오류 코드/메시지는 여기서 절대 그대로 응답에 노출하지 않는다 — 서버 로그에는
남기되(무엇이 문제인지 나중에 진단할 수 있도록), 클라이언트에는 정해진 표준 메시지만 내려준다.
"""

import logging

logger = logging.getLogger("land_info.external_api")


class ExternalAPIError(Exception):
    """공공 API 호출이 실패했을 때 Client 레이어가 던지는 공통 예외."""

    def __init__(self, *, service: str, external_code: str, external_message: str, status_code: int):
        self.service = service
        self.external_code = external_code
        self.external_message = external_message
        self.status_code = status_code
        super().__init__(f"[{service}] {external_code}: {external_message}")


# planning.md 8-1에 문서화된 VWorld 계열 공통 오류 코드 (도로명주소·건축HUB은 코드 체계가 달라
# 각 client에서 자체적으로 판단한다 — 실제 문서 확인된 것만 여기에 매핑해둔다).
_VWORLD_STATUS_BY_CODE = {
    "PARAM_REQUIRED": 400,
    "INVALID_TYPE": 400,
    "INVALID_RANGE": 400,
    "INVALID_KEY": 401,
    "INCORRECT_KEY": 401,
    "UNAVAILABLE_KEY": 403,
    "OVER_REQUEST_LIMIT": 429,
    "SYSTEM_ERROR": 502,
    "UNKNOWN_ERROR": 502,
}

_USER_MESSAGE_BY_STATUS = {
    400: "요청이 올바르지 않습니다.",
    401: "외부 데이터 서비스 인증에 실패했습니다.",
    403: "외부 데이터 서비스 이용 권한이 없습니다.",
    429: "외부 데이터 서비스 호출 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.",
    502: "외부 데이터 서비스에서 오류가 발생했습니다.",
}


def vworld_error(*, service: str, code: str, message: str) -> ExternalAPIError:
    """VWorld 계열(토지·임야정보/개별공시지가/토지이용계획/Geocoder) 오류 코드를 매핑한다."""
    status_code = _VWORLD_STATUS_BY_CODE.get(code, 502)
    logger.warning("VWorld API error service=%s code=%s message=%s", service, code, message)
    return ExternalAPIError(service=service, external_code=code, external_message=message, status_code=status_code)


def generic_error(*, service: str, code: str, message: str, status_code: int = 502) -> ExternalAPIError:
    """도로명주소(juso.go.kr)·건축HUB(data.go.kr)처럼 별도 코드 체계를 쓰는 API용 범용 오류.

    각 API의 오류 코드 전체 의미는 planning.md에 조사되지 않았으므로, "성공이 아니면 오류"로만
    판단하고 세부 코드는 로그에만 남긴다.
    """
    logger.warning("External API error service=%s code=%s message=%s", service, code, message)
    return ExternalAPIError(service=service, external_code=code, external_message=message, status_code=status_code)


def user_message_for(status_code: int) -> str:
    return _USER_MESSAGE_BY_STATUS.get(status_code, "알 수 없는 오류가 발생했습니다.")
