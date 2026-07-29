from fastapi import APIRouter, Query

from ..clients import juso_client
from ..schemas.address import AddressCandidate, to_candidate
from ..schemas.envelope import Envelope

router = APIRouter(prefix="/api/address", tags=["address"])


@router.get("/search")
async def search_address(q: str = Query(min_length=1)) -> Envelope[list[AddressCandidate]]:
    items = await juso_client.search_address(q)
    return Envelope(data=[to_candidate(item) for item in items])
