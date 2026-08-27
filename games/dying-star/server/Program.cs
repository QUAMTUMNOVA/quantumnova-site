using System.Text.Json.Serialization;
using DyingStar.Server.Contracts;
using DyingStar.Server.Data;
using DyingStar.Server.Domain;
using DyingStar.Server.Services;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddDbContext<GameDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Game")));
builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
    ConnectionMultiplexer.Connect(builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379"));
builder.Services.AddScoped<GameService>();
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

var app = builder.Build();
app.UseCors();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GameDbContext>();
    await db.Database.EnsureCreatedAsync();
}

app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "dying-star-server" }));

app.MapPost("/api/v1/session/guest", async (GameService game, CancellationToken ct) =>
{
    var session = await game.CreateGuestSessionAsync(ct);
    return Results.Ok(session);
});

app.MapGet("/api/v1/ark", async (
    HttpRequest request,
    GameService game,
    CancellationToken ct) =>
{
    var token = request.Headers["X-Player-Token"].FirstOrDefault();
    var ark = await game.GetArkAsync(token, ct);
    return ark is null
        ? Results.Unauthorized()
        : Results.Ok(ark);
});

app.MapPost("/api/v1/ark/buildings/{buildingType}/upgrade", async (
    string buildingType,
    UpgradeBuildingRequest requestBody,
    HttpRequest request,
    GameService game,
    CancellationToken ct) =>
{
    if (!Enum.TryParse<BuildingType>(buildingType, ignoreCase: true, out var parsedBuilding))
        return Results.BadRequest(new ErrorResponse("INVALID_BUILDING", "Unknown building type."));

    var token = request.Headers["X-Player-Token"].FirstOrDefault();
    var (response, error) = await game.UpgradeBuildingAsync(token, parsedBuilding, requestBody, ct);

    if (error is null) return Results.Ok(response);
    return error.Code == "UNAUTHENTICATED"
        ? Results.Unauthorized()
        : Results.BadRequest(error);
});

app.MapPost("/api/v1/ark/economy/collect", async (
    CollectProductionRequest requestBody,
    HttpRequest request,
    GameService game,
    CancellationToken ct) =>
{
    var token = request.Headers["X-Player-Token"].FirstOrDefault();
    var (response, error) = await game.CollectProductionAsync(token, requestBody, ct);

    if (error is null) return Results.Ok(response);
    return error.Code == "UNAUTHENTICATED"
        ? Results.Unauthorized()
        : Results.BadRequest(error);
});

app.Run();
