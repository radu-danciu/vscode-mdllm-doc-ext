# showcase/cpp/showcase.hpp

## showcase::MagnitudeBase

Brief: Minimal C++ base template used by the showcase vector type.

Details:
This type keeps the sample self-contained so the file stays valid while still demonstrating documented inheritance.

---

## showcase::Vector

Brief: Small C++ showcase vector type used for hover and definition checks.

Details:
Hover the class, its method, or the call sites in `demoCall` to verify mirrored markdown lookup for C++ symbols.

Inheritance:
- MagnitudeBase<T>

---

## float showcase::Vector::length() const

Brief: Returns the absolute showcase vector length.

Details:
Use this entry to validate documented C++ method hovers and markdown navigation.

Returns:
Absolute numeric magnitude.

---

## inline float showcase::normalize(float value)

Brief: Normalizes a numeric input in the C++ showcase header.

Details:
Hover the declaration or the call inside `demoCall` to verify definition-backed markdown lookup for free functions.

Params:
- `value`: Input magnitude.

Returns:
Absolute numeric value.

---

## inline float showcase::demoCall()

Brief: Executes a small documented C++ call path inside the showcase header.

Details:
This helper keeps the sample self-contained and gives the extension a stable call site for manual checks.

Returns:
Normalized vector magnitude.

---
