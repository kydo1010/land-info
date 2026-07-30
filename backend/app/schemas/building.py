from .common import CamelModel


class BrTitleItem(CamelModel):
    """건축HUB 표제부 조회(getBrTitleInfo) 응답 원본 필드 (8-1 참조, 8-9에서 필드 확장).

    plat_area 등 면적/비율/층수 필드는 실제 호출 결과 문자열이 아니라 JSON 숫자(float/int)로
    내려온다 — 실제 호출로 확인(2026-07-29). float/int로 선언하면 pydantic이 문자열로 오는
    경우도 함께 받아준다.

    등급/코드성 문자열 필드(engr_grade 등)는 값이 없으면 빈 문자열이 아니라 공백 하나(" ")로
    내려온다 — 8-9 실제 호출(강남파이낸스센터)로 확인. `_fmt_text()`가 strip 후 처리한다.
    """

    strct_cd_nm: str
    main_purps_cd_nm: str
    plat_area: float
    arch_area: float
    tot_area: float
    bc_rat: float
    vl_rat: float
    grnd_flr_cnt: int
    ugrnd_flr_cnt: int
    use_apr_day: str  # YYYYMMDD

    bld_nm: str = ""
    plat_plc: str = ""
    new_plat_plc: str = ""
    ho_cnt: int = 0
    fmly_cnt: int = 0
    hhld_cnt: int = 0
    heit: float = 0
    roof_cd_nm: str = ""
    atch_bld_cnt: int = 0
    atch_bld_area: float = 0
    vl_rat_estm_tot_area: float = 0
    ride_use_elvt_cnt: int = 0
    emgen_use_elvt_cnt: int = 0
    pms_day: str = ""
    stcns_day: str = ""
    rserthqk_dsgn_apply_yn: str = ""
    rserthqk_ablty: str = ""
    engr_grade: str = ""
    gn_bld_grade: str = ""
    itg_bld_grade: str = ""
    indr_auto_area: float = 0
    indr_auto_utcnt: int = 0
    indr_mech_area: float = 0
    indr_mech_utcnt: int = 0
    oudr_auto_area: float = 0
    oudr_auto_utcnt: int = 0
    oudr_mech_area: float = 0
    oudr_mech_utcnt: int = 0


class BrFlrOulnItem(CamelModel):
    """건축HUB 층별개요 조회(getBrFlrOulnInfo) 응답 원본 필드 (8-1 참조)."""

    flr_gb_cd_nm: str
    flr_no_nm: str
    strct_cd_nm: str
    main_purps_cd_nm: str
    area: float
    main_atch_gb_cd_nm: str = ""


class BrBasisOulnItem(CamelModel):
    """건축HUB 기본개요 조회(getBrBasisOulnInfo) 응답 원본 필드 (8-9 참조).

    표제부에는 없는 건물ID(bldg_id)와 지역·지구·구역 코드명이 여기 있다 — 실제 호출로 확인.
    """

    bldg_id: str = ""
    jiyuk_cd_nm: str = ""
    jigu_cd_nm: str = ""
    guyuk_cd_nm: str = ""


class BrRecapTitleItem(CamelModel):
    """건축HUB 총괄표제부 조회(getBrRecapTitleInfo) 응답 원본 필드 (8-9 참조).

    여러 동으로 이루어진 대지에서만 존재하는 레코드 — 단일 동 건물(예: 강남파이낸스센터)은
    totalCount 0으로 내려온다는 것을 실제 호출로 확인했다. 그 경우 표제부 자체의 동일한
    이름을 가진 필드(단일 동 기준 주차 현황)로 대체한다 — `to_building_record()` 참조.
    """

    indr_auto_area: float = 0
    indr_auto_utcnt: int = 0
    indr_mech_area: float = 0
    indr_mech_utcnt: int = 0
    oudr_auto_area: float = 0
    oudr_auto_utcnt: int = 0
    oudr_mech_area: float = 0
    oudr_mech_utcnt: int = 0


class BrWclfItem(CamelModel):
    """건축HUB 오수정화시설 조회(getBrWclfInfo) 응답 원본 필드 (8-9 참조)."""

    mode_cd_nm: str = ""
    capa_psper: float = 0
    capa_lube: float = 0


class FloorRow(CamelModel):
    floor: str
    purpose: str
    struct: str
    area: str
    category: str


class Certification(CamelModel):
    name: str
    grade: str


class SewageInfo(CamelModel):
    type: str
    capacity: str


class ParkingInfo(CamelModel):
    indoor_auto_count: str
    indoor_auto_area: str
    indoor_mech_count: str
    indoor_mech_area: str
    outdoor_auto_count: str
    outdoor_auto_area: str
    outdoor_mech_count: str
    outdoor_mech_area: str


class BuildingRecord(CamelModel):
    """F-03 건축물대장 열람에 그대로 대응 — frontend normalizeBuilding()과 동일한 모양.

    해당 필지에 건축물이 없으면(getBrTitleInfo가 totalCount 0) status="empty"이고
    나머지 필드는 전부 None — 9장 공통 규약대로 "정상이지만 데이터 없음"은 오류가 아니다.

    건축관계자·소유자·변동사항·주차장의 인근/면제/전기차·급수설비(저수조)·특수구조/지하수위/
    기초형식/구조설계해석법/관리계획수립여부는 건축HUB 어떤 오퍼레이션에도 필드가 없어
    (8-9 참조) 이 레코드에 없다 — 프론트에서 해당 행/섹션을 아예 렌더링하지 않는다.
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

    unique_no: str | None = None
    building_id: str | None = None
    name: str | None = None
    household_summary: str | None = None
    site_location: str | None = None
    jibun: str | None = None
    road_address: str | None = None
    zoning_region: str | None = None
    zoning_district: str | None = None
    zoning_area: str | None = None
    vl_rat_area: str | None = None
    height: str | None = None
    roof: str | None = None
    annex_summary: str | None = None
    elevator_ride: str | None = None
    elevator_emergency: str | None = None
    permit_day: str | None = None
    start_day: str | None = None
    seismic_applied: str | None = None
    seismic_capacity: str | None = None
    certifications: list[Certification] = []
    sewage: SewageInfo | None = None
    parking: ParkingInfo | None = None


def _fmt_date(yyyymmdd: str) -> str:
    return f"{yyyymmdd[0:4]}-{yyyymmdd[4:6]}-{yyyymmdd[6:8]}"


def _fmt_date_opt(yyyymmdd: str) -> str:
    yyyymmdd = yyyymmdd.strip()
    return _fmt_date(yyyymmdd) if len(yyyymmdd) == 8 else "-"


def _fmt_area(v: float) -> str:
    return f"{v:,.2f}㎡" if v % 1 else f"{v:,.0f}㎡"


def _fmt_text(v: str) -> str:
    v = v.strip()
    return v if v else "-"


def _fmt_count(v: int) -> str:
    return f"{v:,}대"


def _fmt_seismic_yn(code: str) -> str:
    return {"1": "적용", "0": "비적용"}.get(code.strip(), "-")


def _fmt_jibun(bun: str, ji: str) -> str:
    bun_n = str(int(bun))
    ji_n = str(int(ji)) if ji else "0"
    return f"{bun_n}-{ji_n}" if ji_n != "0" else bun_n


def _unique_no(sigungu_cd: str, bjdong_cd: str, plat_gb_cd: str, bun: str, ji: str) -> str:
    return f"{sigungu_cd}{bjdong_cd}-{plat_gb_cd}-{bun}{ji}"


def empty_building_record() -> BuildingRecord:
    return BuildingRecord(status="empty")


def to_building_record(
    sigungu_cd: str,
    bjdong_cd: str,
    plat_gb_cd: str,
    bun: str,
    ji: str,
    title: BrTitleItem,
    basis: BrBasisOulnItem | None,
    floors: list[BrFlrOulnItem],
    recap: BrRecapTitleItem | None,
    wclf: BrWclfItem | None,
) -> BuildingRecord:
    parking_source = recap if recap is not None else title
    certifications = [
        Certification(name=name, grade=grade)
        for name, grade in (
            ("에너지효율등급", _fmt_text(title.engr_grade)),
            ("녹색건축인증", _fmt_text(title.gn_bld_grade)),
            ("지능형건축물인증", _fmt_text(title.itg_bld_grade)),
        )
        if grade != "-"
    ]
    sewage = (
        SewageInfo(
            type=_fmt_text(wclf.mode_cd_nm),
            capacity=f"{wclf.capa_psper:,.0f}인용" if wclf.capa_psper else f"{wclf.capa_lube:,.0f}㎥",
        )
        if wclf is not None
        else None
    )
    return BuildingRecord(
        status="ok",
        struct=title.strct_cd_nm,
        purpose=title.main_purps_cd_nm,
        site_area=_fmt_area(title.plat_area),
        build_area=_fmt_area(title.arch_area),
        bcr=f"{title.bc_rat:,.2f}%",
        far=f"{title.vl_rat:,.2f}%",
        approved=_fmt_date(title.use_apr_day),
        floor_summary=f"지하 {title.ugrnd_flr_cnt}층 / 지상 {title.grnd_flr_cnt}층 · 연면적 {_fmt_area(title.tot_area)}",
        floors=[
            FloorRow(
                floor=f.flr_no_nm if f.flr_no_nm.startswith("지") else f"{f.flr_gb_cd_nm} {f.flr_no_nm}",
                purpose=f.main_purps_cd_nm,
                struct=f.strct_cd_nm,
                area=f"{f.area:,.2f}",
                category=_fmt_text(f.main_atch_gb_cd_nm),
            )
            for f in floors
        ],
        unique_no=_unique_no(sigungu_cd, bjdong_cd, plat_gb_cd, bun, ji),
        building_id=basis.bldg_id.strip() if basis and basis.bldg_id.strip() else None,
        name=_fmt_text(title.bld_nm),
        household_summary=f"{title.ho_cnt}호/{title.fmly_cnt}가구/{title.hhld_cnt}세대",
        site_location=_fmt_text(title.plat_plc),
        jibun=_fmt_jibun(bun, ji),
        road_address=_fmt_text(title.new_plat_plc),
        zoning_region=_fmt_text(basis.jiyuk_cd_nm) if basis else "-",
        zoning_district=_fmt_text(basis.jigu_cd_nm) if basis else "-",
        zoning_area=_fmt_text(basis.guyuk_cd_nm) if basis else "-",
        vl_rat_area=_fmt_area(title.vl_rat_estm_tot_area),
        height=f"{title.heit:,.2f}m" if title.heit else "-",
        roof=_fmt_text(title.roof_cd_nm),
        annex_summary=f"{title.atch_bld_cnt}동 {_fmt_area(title.atch_bld_area)}" if title.atch_bld_cnt else "-",
        elevator_ride=_fmt_count(title.ride_use_elvt_cnt),
        elevator_emergency=_fmt_count(title.emgen_use_elvt_cnt),
        permit_day=_fmt_date_opt(title.pms_day),
        start_day=_fmt_date_opt(title.stcns_day),
        seismic_applied=_fmt_seismic_yn(title.rserthqk_dsgn_apply_yn),
        seismic_capacity=_fmt_text(title.rserthqk_ablty),
        certifications=certifications,
        sewage=sewage,
        parking=ParkingInfo(
            indoor_auto_count=_fmt_count(parking_source.indr_auto_utcnt),
            indoor_auto_area=_fmt_area(parking_source.indr_auto_area),
            indoor_mech_count=_fmt_count(parking_source.indr_mech_utcnt),
            indoor_mech_area=_fmt_area(parking_source.indr_mech_area),
            outdoor_auto_count=_fmt_count(parking_source.oudr_auto_utcnt),
            outdoor_auto_area=_fmt_area(parking_source.oudr_auto_area),
            outdoor_mech_count=_fmt_count(parking_source.oudr_mech_utcnt),
            outdoor_mech_area=_fmt_area(parking_source.oudr_mech_area),
        ),
    )
