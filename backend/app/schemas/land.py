from .common import CamelModel


class LadfrlItem(CamelModel):
    """토지·임야정보 API(VWorld ladfrlList) 응답 원본 필드 (8-1 참조).

    "이용상황"에 해당하는 필드는 문서에서 확인되지 않아 여기 포함하지 않는다
    (planning.md 11장 참조 — F-02에서 제외하기로 결정됨).
    """

    lndcgr_code: str
    lndcgr_code_nm: str
    lndpcl_ar: str
    posesn_se_code: str
    posesn_se_code_nm: str


class LandRecord(CamelModel):
    """F-02 토지대장 열람에 그대로 대응 — frontend normalizeLand()와 동일한 모양."""

    jimok: str
    area: str
    area_pyeong: str
    owner: str


def to_land_record(item: LadfrlItem) -> LandRecord:
    area_sqm = float(item.lndpcl_ar)
    pyeong = area_sqm * 0.3025
    return LandRecord(
        jimok=item.lndcgr_code_nm,
        area=f"{area_sqm:,.1f}㎡" if area_sqm % 1 else f"{area_sqm:,.0f}㎡",
        area_pyeong=f"약 {pyeong:,.1f}평",
        owner=item.posesn_se_code_nm,
    )
