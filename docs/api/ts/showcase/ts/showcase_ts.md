# showcase/ts/showcase.ts

## ShowcaseRenderer

Brief: Interface used by the TypeScript showcase to demonstrate type-level documentation lookup.

Details:
Hovering the interface or its method shows how mirrored markdown works for repository-local TypeScript type forms.

---

## ShowcaseRenderer.render(title: string) -> string

Brief: Contract method used by the TypeScript showcase renderer.

Details:
Use this entry to verify interface-method hover and markdown navigation behavior.

Params:
- `title`: Display label rendered by the showcase implementation.

Returns:
Formatted label text.

---

## ShowcaseStatus

Brief: Simple TypeScript type alias used to verify alias hover coverage in the showcase workspace.

Details:
This entry exists so the showcase demonstrates external docs for aliases as well as classes and functions.

---

## ShowcaseVector

Brief: Concrete TypeScript showcase type that implements the renderer contract.

Details:
Hover the class name or its call sites to validate mirrored markdown lookup against a real repo-local TypeScript file.

Inheritance:
- ShowcaseRenderer

---

## ShowcaseVector.magnitude() -> number

Brief: Returns the absolute vector magnitude in the TypeScript showcase.

Details:
Use this method to verify declaration-site and call-site hover behavior for documented TypeScript class members.

Returns:
Absolute numeric magnitude.

---

## ShowcaseVector.render(title: string) -> string

Brief: Renders the TypeScript showcase label with the computed magnitude.

Details:
This method demonstrates a documented class member that also satisfies an interface contract.

Params:
- `title`: Display label rendered by the showcase instance.

Returns:
Combined label and magnitude string.

---

## normalizeShowcase(value: number) -> number

Brief: Normalizes a numeric input in the TypeScript showcase file.

Details:
Hover the declaration or the local call site at the bottom of the file to confirm the extension resolves the same markdown entry.

Params:
- `value`: Input number to normalize.

Returns:
Absolute numeric value.

---
