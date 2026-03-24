# showcase/python/showcase.py

## showcase.python.showcase.BaseVector

Brief: Base Python showcase type used to demonstrate documented inheritance chains.

Details:
This class keeps the Python sample valid and small while still exercising type documentation lookup.

---

## showcase.python.showcase.ShowcaseVector

Brief: Dataclass-backed Python showcase vector type.

Details:
Hover the class or its method to verify that mirrored markdown docs resolve correctly for Python symbols in this repository.

Inheritance:
- BaseVector

---

## showcase.python.showcase.ShowcaseVector.length(self) -> float

Brief: Returns the absolute length of the Python showcase vector.

Details:
Use this method to validate hover and definition behavior for documented Python instance methods.

Returns:
Absolute numeric magnitude.

---

## showcase.python.showcase.normalize_showcase(value: float) -> float

Brief: Normalizes a numeric input in the Python showcase module.

Details:
Hover the declaration or the call site inside `demo_usage` to verify definition-backed markdown lookup.

Params:
- `value`: Input number to normalize.

Returns:
Absolute numeric value.

---

## showcase.python.showcase.demo_usage() -> float

Brief: Executes a small Python call path that touches the documented showcase symbols.

Details:
This function exists so the showcase file has a stable call site for manual hover and definition checks.

Returns:
Normalized magnitude from the showcase vector.

---
