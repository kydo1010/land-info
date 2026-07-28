"""api-sample 테스트 스크립트 공용 유틸 — backend/.env에서 API 키를 읽어온다."""

from pathlib import Path

_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"


def load_env_key(name: str) -> str:
    for line in _ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        if key.strip() == name:
            return value.strip()
    raise RuntimeError(f"{name} not found in {_ENV_PATH}")
