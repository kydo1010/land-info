from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """.env 값을 읽어온다 (planning.md 6장: 백엔드 기술 스택 / 8-1: 인증키 통합)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # 토지·임야정보 · 토지이용계획 · 개별공시지가 · Geocoder 4종 공용 (8-1 참조).
    vworld_api_key: str = ""
    building_api_key: str = ""
    # 도로명주소(juso.go.kr)는 VWorld와 별개 포털이라 별도 승인키가 필요함 (8-3 실제 호출 테스트로 확인, 11장 "즉시 조치 필요").
    # 아직 발급 전이라 비어 있을 수 있다 — juso_client는 비어있으면 호출 전에 명확한 오류를 낸다.
    juso_api_key: str = ""
    frontend_origin: str = "http://localhost:5173"


@lru_cache
def get_settings() -> Settings:
    return Settings()
