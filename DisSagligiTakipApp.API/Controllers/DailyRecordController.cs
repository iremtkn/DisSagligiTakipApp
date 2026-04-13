using DisSagligiTakipApp.Service.Abstract;
using Microsoft.AspNetCore.Mvc;

namespace DisSagligiTakipApp.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DailyRecordController : ControllerBase
{
    private readonly IDailyRecordService _dailyRecordService;

    public DailyRecordController(IDailyRecordService dailyRecordService)
    {
        _dailyRecordService = dailyRecordService;
    }

    [HttpGet("last7days/{userId}")]
    public IActionResult GetLast7Days(int userId)
    {
        var records = _dailyRecordService.GetLast7Days(userId);
        return Ok(records);
    }

    [HttpGet("today/{userId}")]
    public IActionResult GetToday(int userId)
    {
        var record = _dailyRecordService.GetToday(userId);
        var streak = _dailyRecordService.GetStreak(userId);

        if (record == null)
        {
            return Ok(new
            {
                userId,
                date       = DateTime.Today,
                brushCount = 0,
                flossed    = false,
                mouthwash  = false,
                streak
            });
        }

        return Ok(new
        {
            record.UserId,
            record.Date,
            brushCount = record.BrushCount,
            flossed    = record.Flossed,
            mouthwash  = record.Mouthwash,
            streak
        });
    }

    [HttpPost("upsert")]
    public IActionResult Upsert([FromBody] UpsertDailyRecordRequest request)
    {
        try
        {
            var record = _dailyRecordService.Upsert(
                request.UserId,
                request.BrushCount,
                request.Flossed,
                request.Mouthwash
            );

            var streak = _dailyRecordService.GetStreak(request.UserId);

            return Ok(new
            {
                record.UserId,
                record.Date,
                brushCount = record.BrushCount,
                flossed    = record.Flossed,
                mouthwash  = record.Mouthwash,
                streak
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class UpsertDailyRecordRequest
{
    public int  UserId     { get; set; }
    public int  BrushCount { get; set; }
    public bool Flossed    { get; set; }
    public bool Mouthwash  { get; set; }
}