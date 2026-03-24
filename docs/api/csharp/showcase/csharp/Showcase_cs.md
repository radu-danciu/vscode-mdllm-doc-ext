## showcase/csharp/Showcase.cs

### `Showcase.Services.Calculator`

Brief: Small C# showcase service used to demonstrate documented type and method lookup.

Details:
Hover the class or its methods to verify mirrored markdown behavior for repo-local C# symbols.

---

### `string Showcase.Services.Calculator.Format(string label)`

Brief: Formats a showcase label inside the C# sample.

Details:
Use this method to validate declaration-site and call-site markdown lookup for documented C# methods.

Params:

- `label`: Display label to format.

Returns:
Formatted showcase text.

---

### `Task<string> Showcase.Services.Calculator.DescribeAsync(Guid id)`

Brief: Builds an asynchronous showcase description from an identifier.

Details:
This method demonstrates documented async-style C# method signatures in the external markdown format.

Params:

- `id`: Identifier rendered into the description.

Returns:
Asynchronously produced showcase text.

---

### `Showcase.Services.ShowcaseUsage`

Brief: Static C# showcase type that provides a stable call path for manual checks.

Details:
The sample keeps the file valid and gives the extension a place to resolve call-site documentation back to the documented calculator methods.

---

### `Task<string> Showcase.Services.ShowcaseUsage.RunAsync()`

Brief: Executes the C# showcase flow by calling the documented calculator members.

Details:
Hover this method or the calls inside it to verify definition-backed markdown lookup in a valid C# file.

Returns:
Asynchronously produced showcase text.

---
