from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ErrorDetail(BaseModel):
    code: str
    message: str


class Envelope(BaseModel, Generic[T]):
    """9장 공통 규약: 모든 응답을 이 봉투로 통일한다.

    - 정상 + 데이터 있음: data=값, error=None (HTTP 200)
    - 정상 + 데이터 없음(예: 건축물 없음): data=None, error=None (HTTP 200)
    - 오류: data=None, error=상세 (HTTP 4xx/5xx) — 공공 API 원본 오류 메시지는
      절대 그대로 내려주지 않고 errors.py에서 서비스 표준 메시지로 변환한다.
    """

    data: T | None = None
    error: ErrorDetail | None = None
