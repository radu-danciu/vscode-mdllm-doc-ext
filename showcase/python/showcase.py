from dataclasses import dataclass


class BaseVector:
    pass


@dataclass
class ShowcaseVector(BaseVector):
    value: float

    def length(self) -> float:
        return abs(self.value)


def normalize_showcase(value: float) -> float:
    return abs(value)


def demo_usage() -> float:
    vector = ShowcaseVector(-2.0)
    return normalize_showcase(vector.length())
