from .common import CamelModel


class LandUseItem(CamelModel):
    """토지이용계획 API(VWorld getLandUseAttr) 응답 항목 원본 필드 (8-1 참조).

    응답이 이 item의 배열 하나로 내려오고 용도지역/용도지구/규제가 모두 섞여 있다. 이걸
    구분하는 코드 체계는 조사되지 않아, 배열의 첫 번째 항목을 "용도지역"으로, 나머지를
    "규제 목록"으로 다루기로 했다 (11장 참조 — frontend normalize.js와 동일한 규칙).
    """

    prpos_area_dstrc_code: str
    prpos_area_dstrc_code_nm: str
    cnflc_at: str
    cnflc_at_nm: str


class RuleRow(CamelModel):
    no: str
    name: str
    kind: str  # 해당 | 저촉 | 접함


class LandUseRecord(CamelModel):
    """F-05 토지이용계획 조회에 그대로 대응 — frontend normalizeZone()과 동일한 모양."""

    use: str
    rules: list[RuleRow]


def to_land_use_record(items: list[LandUseItem]) -> LandUseRecord:
    zone_item, *reg_items = items
    return LandUseRecord(
        use=zone_item.prpos_area_dstrc_code_nm,
        rules=[
            RuleRow(no=str(i + 1).zfill(2), name=it.prpos_area_dstrc_code_nm, kind=it.cnflc_at_nm)
            for i, it in enumerate(reg_items)
        ],
    )
