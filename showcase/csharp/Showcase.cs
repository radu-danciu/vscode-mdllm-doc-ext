using System;
using System.Threading.Tasks;

namespace Showcase.Services {

public sealed class Calculator {
    public string Format(string label) {
        return $"showcase:{label}";
    }

    public Task<string> DescribeAsync(Guid id) {
        return Task.FromResult(Format(id.ToString("N")));
    }
}

public static class ShowcaseUsage {
    public static async Task<string> RunAsync() {
        var calculator = new Calculator();
        calculator.Format("csharp");
        return await calculator.DescribeAsync(Guid.Empty);
    }
}

}
