using OfficeCaseFiles.Api.Contracts;

namespace OfficeCaseFiles.Api.Tests;

public sealed class HealthResponseTests
{
    [Fact]
    public void Create_ReturnsStableServiceIdentity()
    {
        var response = HealthResponse.Create();

        Assert.Equal("ok", response.Status);
        Assert.Equal("office-case-files-api", response.Service);
        Assert.InRange(response.Utc, DateTimeOffset.UtcNow.AddSeconds(-2), DateTimeOffset.UtcNow.AddSeconds(2));
    }
}
