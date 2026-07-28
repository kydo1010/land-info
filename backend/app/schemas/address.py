from .common import CamelModel


class JusoAddressItem(CamelModel):
    """도로명주소 API(juso.go.kr) 응답 원본 필드 (8-1 참조)."""

    road_addr: str
    jibun_addr: str
    zip_no: str
    si_nm: str
    sgg_nm: str
    emd_nm: str
    adm_cd: str  # 행정구역코드 — 8-3 실제 호출 테스트로 10자리(법정동코드)임이 확인됨
    mt_yn: str  # 산여부 0:대지·1:산
    lnbr_mnnm: str  # 지번본번
    lnbr_slno: str  # 지번부번


class AddressCandidate(CamelModel):
    """검색 후보 하나 — 프론트 search 후보 목록에 그대로 대응."""

    road: str
    jibun: str
    zip_no: str
    pnu: str
    sigungu_cd: str
    bjdong_cd: str
    plat_gb_cd: str
    bun: str
    ji: str


def to_candidate(item: JusoAddressItem) -> AddressCandidate:
    """도로명주소 API 원본 응답에서 pnu와 건축HUB 식별자(5종)를 파생시킨다.

    8-1/8-3 참조: adm_cd(10자리) = sigunguCd(앞5) + bjdongCd(뒤5).
    pnu(19자리) = adm_cd(10) + mt_yn(1) + lnbr_mnnm(4자리, 0패딩) + lnbr_slno(4자리, 0패딩).
    """
    bun = item.lnbr_mnnm.zfill(4)
    ji = item.lnbr_slno.zfill(4)
    pnu = f"{item.adm_cd}{item.mt_yn}{bun}{ji}"
    return AddressCandidate(
        road=item.road_addr,
        jibun=item.jibun_addr,
        zip_no=item.zip_no,
        pnu=pnu,
        sigungu_cd=item.adm_cd[:5],
        bjdong_cd=item.adm_cd[5:10],
        plat_gb_cd=item.mt_yn,
        bun=bun,
        ji=ji,
    )
