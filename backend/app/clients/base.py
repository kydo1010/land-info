import httpx

from ..errors import generic_error

# 10장 비기능요구사항: 공공 API 호출에 타임아웃을 두고, 초과 시 오류 상태로 전환한다.
DEFAULT_TIMEOUT = httpx.Timeout(8.0)


async def get_json(url: str, params: dict, *, service: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            response = await client.get(url, params=params)
    except httpx.TimeoutException as exc:
        raise generic_error(service=service, code="TIMEOUT", message=str(exc), status_code=504) from exc
    except httpx.HTTPError as exc:
        raise generic_error(service=service, code="NETWORK_ERROR", message=str(exc), status_code=502) from exc

    if response.status_code >= 400:
        raise generic_error(
            service=service,
            code=f"HTTP_{response.status_code}",
            message=response.text[:500],
            status_code=502,
        )
    return response.json()
