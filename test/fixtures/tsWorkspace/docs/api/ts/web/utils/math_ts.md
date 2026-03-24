## web/utils/math.ts

### `Vector`

Brief: Example documented TypeScript class for fixture-based tests.

Details:
Used to validate class hover and mirrored docs lookup.

Inheritance:

- `BaseVector`

---

### `Vector.length() -> number`

Brief: Example documented TypeScript method for fixture-based tests.

Details:
Used to validate hover previews and definition routing for methods.

Returns:
Vector length.

---

### `normalize(value: number) -> number`

Brief: Example documented TypeScript function for fixture-based tests.

Details:
Used to validate hover previews and definition routing for top-level functions.

Params:

- `value`: Input number.

Returns:
Normalized value.

---

### `BaseVector`

Brief: Base type used by the TypeScript fixture vector class.

Details:
This entry keeps the fixture workspace fully documented so type-level dogfood checks can resolve every symbol in the sample file.

---

### `undocumented(value: number) -> number`

Brief: Secondary TypeScript fixture function used to cover missing-doc edge cases without leaving the repository partially undocumented.

Details:
The symbol stays in the fixture so tests can exercise alternate flows, but it is now documented like the rest of the repository.

Params:

- `value`: Input number.

Returns:
Derived numeric value.

---
