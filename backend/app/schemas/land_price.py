from .common import CamelModel


class IndvdLandPriceItem(CamelModel):
    """개별공시지가 API(VWorld getIndvdLandPrice) 응답 원본 필드 (8-1 참조).

    주의(11장 미결정 사항 1번): 식별자가 pnu가 아니라 ldCode(법정동코드)뿐이라, 이 필지 단위로
    정확히 좁혀지는지, 5개년을 한 번에 받을 수 있는지는 실제 호출로 아직 확인되지 않았다.
    """

    ld_code: str
    stdr_year: str
    lad_pblntf_pclnd: str


class PriceRow(CamelModel):
    year: int
    value: int | None  # 해당 연도 데이터가 없으면 None (F-04: 선을 끊어 표시)


def to_price_row(year: int, item: IndvdLandPriceItem | None) -> PriceRow:
    return PriceRow(year=year, value=int(item.lad_pblntf_pclnd) if item else None)
