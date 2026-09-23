namespace OfficeCaseFiles.Api.Contracts;

public sealed record HealthResponse(string Status, string Service, DateTimeOffset Utc)
{
    public static HealthResponse Create() => new("ok", "office-case-files-api", DateTimeOffset.UtcNow);
}
