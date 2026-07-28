from .common import CamelModel


class BrTitleItem(CamelModel):
    """건축HUB 표제부 조회(getBrTitleInfo) 응답 원본 필드 (8-1 참조)."""

    strct_cd_nm: str
    main_purps_cd_nm: str
    plat_area: str
    arch_area: str
    tot_area: str
    bc_rat: str
    vl_rat: str
    grnd_flr_cnt: str
    ugrnd_flr_cnt: str
    use_apr_day: str  # YYYYMMDD


class BrFlrOulnItem(CamelModel):
    """건축HUB 층별개요 조회(getBrFlrOulnInfo) 응답 원본 필드 (8-1 참조)."""

    flr_gb_cd_nm: str
    flr_no_nm: str
    strct_cd_nm: str
    main_purps_cd_nm: str
    area: str


class FloorRow(CamelModel):
    floor: str
    purpose: str
    struct: str
    area: str


class BuildingRecord(CamelModel):
    """F-03 건축물대장 열람에 그대로 대응 — frontend normalizeBuilding()과 동일한 모양.

    해당 필지에 건축물이 없으면(getBrTitleInfo가 totalCount 0) status="empty"이고
    나머지 필드는 전부 None — 9장 공통 규약대로 "정상이지만 데이터 없음"은 오류가 아니다.
    """

    status: str  # "ok" | "empty"
    struct: str | None = None
    purpose: str | None = None
    site_area: str | None = None
    build_area: str | None = None
    bcr: str | None = None
    far: str | None = None
    approved: str | None = None
    floor_summary: str | None = None
    floors: list[FloorRow] = []


def _fmt_date(yyyymmdd: str) -> str:
    return f"{yyyymmdd[0:4]}-{yyyymmdd[4:6]}-{yyyymmdd[6:8]}"


def _fmt_area(v: str) -> str:
    n = float(v)
    return f"{n:,.2f}㎡" if n % 1 else f"{n:,.0f}㎡"


def empty_building_record() -> BuildingRecord:
    return BuildingRecord(status="empty")


def to_building_record(title: BrTitleItem, floors: list[BrFlrOulnItem]) -> BuildingRecord:
    return BuildingRecord(
        status="ok",
        struct=title.strct_cd_nm,
        purpose=title.main_purps_cd_nm,
        site_area=_fmt_area(title.plat_area),
        build_area=_fmt_area(title.arch_area),
        bcr=f"{title.bc_rat}%",
        far=f"{title.vl_rat}%",
        approved=_fmt_date(title.use_apr_day),
        floor_summary=f"지하 {title.ugrnd_flr_cnt}층 / 지상 {title.grnd_flr_cnt}층 · 연면적 {_fmt_area(title.tot_area)}",
        floors=[
            FloorRow(
                floor=f"{f.flr_gb_cd_nm} {f.flr_no_nm}",
                purpose=f.main_purps_cd_nm,
                struct=f.strct_cd_nm,
                area=f"{float(f.area):,.2f}",
            )
            for f in floors
        ],
    )
