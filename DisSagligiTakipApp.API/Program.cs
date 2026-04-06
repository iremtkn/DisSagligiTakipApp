using Microsoft.EntityFrameworkCore;
using DisSagligiTakipApp.Data;
using DisSagligiTakipApp.Service.Abstract;
using DisSagligiTakipApp.Service.Concrete;
using Microsoft.Extensions.Caching.Distributed;
using Serilog;
using Serilog.Sinks.Elasticsearch;
using System.Reflection;
using Serilog.Exceptions;

var builder = WebApplication.CreateBuilder(args);

var elasticUri = builder.Configuration["ElasticConfiguration:Uri"];

if (!string.IsNullOrEmpty(elasticUri))
{
    Log.Logger = new LoggerConfiguration()
        .Enrich.FromLogContext()
        .Enrich.WithExceptionDetails() 
        .WriteTo.Console() 
        .WriteTo.Elasticsearch(new ElasticsearchSinkOptions(new Uri(elasticUri)) 
        {
            AutoRegisterTemplate = true,
            IndexFormat = $"dis-sagligi-log-{DateTime.UtcNow:yyyy-MM}" 
        })
        .CreateLogger();

    builder.Host.UseSerilog();
}

builder.WebHost.UseSentry(options =>
{
    options.Dsn = builder.Configuration["Sentry:Dsn"];
    options.Debug = true;
    options.TracesSampleRate = 1.0;
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var redisConn = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrEmpty(redisConn))
{
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConn; 
        options.InstanceName = "DisSagligi_";
    });
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<IUserService>(sp => new UserService(sp.GetRequiredService<AppDbContext>()));
builder.Services.AddScoped<IDailyRecordService, DailyRecordService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowReactApp");
app.UseStaticFiles();
app.UseAuthorization();
app.MapControllers();

app.Run();