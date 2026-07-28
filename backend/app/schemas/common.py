from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """프론트엔드(JS)와 동일한 camelCase 키로 내려주기 위한 공통 베이스.

    파이썬 쪽은 snake_case로 쓰고, JSON으로 나갈 때만 camelCase로 바뀐다 —
    frontend/src/data/normalize.js가 만드는 모양과 최대한 똑같이 맞춰서,
    나중에 mock을 이 API 응답으로 교체할 때 프론트 컴포넌트를 거의 안 건드리게 하려는 목적.
    """

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
