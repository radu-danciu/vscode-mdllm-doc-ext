## src/Foo/Bar.cs

### `Project.Services.UserService`

Brief: Example documented C# type for fixture-based tests.

Details:
Used to validate class documentation lookup and inheritance extraction.

Inheritance:

- `BaseService`
- `IDisposable`

---

### `Task<string> Project.Services.UserService.GetNameAsync(Guid id)`

Brief: Example documented C# method for fixture-based tests.

Details:
Used to validate hover previews and definition routing for namespaced methods.

Params:

- `id`: User identifier.

Returns:
The user name.

---

### `string Project.Services.UserService.Undocumented(Guid id)`

Brief: Secondary C# fixture method used to keep the sample service fully documented.

Details:
The repository still uses this symbol for alternate workflow coverage, but the fixture code itself now remains fully self-documented.

Params:

- `id`: User identifier.

Returns:
String form of the identifier.

---
