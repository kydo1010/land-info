from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import get_settings
from .errors import ExternalAPIError, user_message_for
from .routers import address, building
from .schemas.envelope import ErrorDetail

settings = get_settings()

app = FastAPI(title="land-info-backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.exception_handler(ExternalAPIError)
async def external_api_error_handler(request: Request, exc: ExternalAPIError) -> JSONResponse:
    """9장 공통 규약: 오류는 봉투의 error 필드 + HTTP 상태 코드로만 표현한다."""
    detail = ErrorDetail(code=exc.external_code, message=user_message_for(exc.status_code))
    return JSONResponse(status_code=exc.status_code, content={"data": None, "error": detail.model_dump()})


app.include_router(address.router)
app.include_router(building.router)
