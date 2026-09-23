using OfficeCaseFiles.Api.Contracts;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapGet("/api/v1/health", () => Results.Ok(HealthResponse.Create()))
    .WithName("GetHealth")
    .Produces<HealthResponse>();

app.Run();

public partial class Program;
