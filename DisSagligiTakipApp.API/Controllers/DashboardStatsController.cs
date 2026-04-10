using Microsoft.AspNetCore.Mvc;
using DisSagligiTakipApp.Service.Abstract;
using DisSagligiTakipApp.Data;
using DisSagligiTakipApp.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace DisSagligiTakipApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardStatsController : ControllerBase
    {
        private readonly IDailyRecordService _dailyRecordService;
        private readonly AppDbContext _context;

        public DashboardStatsController(IDailyRecordService dailyRecordService, AppDbContext context)
        {
            _dailyRecordService = dailyRecordService;
            _context = context;
        }

        
        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] int userId)
        {
            var record = await _dailyRecordService.GetTodayRecordAsync(userId);

            if (record == null)
            {
                return Ok(new
                {
                    brushCount  = 0,
                    flossed     = false,
                    mouthwash   = false,
                    healthScore = 0,
                    streak      = 0,
                    weeklyData  = new int[] { 0, 0, 0, 0, 0, 0, 0 }
                });
            }

            return Ok(new
            {
                brushCount  = record.BrushCount,
                flossed     = record.Flossed,
                mouthwash   = record.Mouthwash,
                healthScore = record.HealthScore,
                streak      = record.Streak,
                weeklyData  = record.WeeklyData ?? new int[] { 0, 0, 0, 0, 0, 0, 0 }
            });
        }

        
        [HttpPost("brush")]
        public async Task<IActionResult> RecordBrush([FromBody] BrushRequest request)
        {
            await _dailyRecordService.RecordBrushingAsync(request.UserId);
            return Ok(new { success = true });
        }

        [HttpPost("floss")]
        public async Task<IActionResult> RecordFloss([FromBody] FlossRequest request)
        {
            var record = await _context.DailyRecords
                .FirstOrDefaultAsync(r => r.UserId == request.UserId && r.Date == DateTime.Today);

            if (record == null)
            {
                _context.DailyRecords.Add(new DailyRecord
                {
                    UserId    = request.UserId,
                    Date      = DateTime.Today,
                    Flossed   = request.Flossed,
                    Mouthwash = false,
                    BrushCount = 0
                });
            }
            else
            {
                record.Flossed = request.Flossed;
                _context.DailyRecords.Update(record);
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        
        [HttpPost("mouthwash")]
        public async Task<IActionResult> RecordMouthwash([FromBody] MouthwashRequest request)
        {
            var record = await _context.DailyRecords
                .FirstOrDefaultAsync(r => r.UserId == request.UserId && r.Date == DateTime.Today);

            if (record == null)
            {
                _context.DailyRecords.Add(new DailyRecord
                {
                    UserId     = request.UserId,
                    Date       = DateTime.Today,
                    Mouthwash  = request.Mouthwash,
                    Flossed    = false,
                    BrushCount = 0
                });
            }
            else
            {
                record.Mouthwash = request.Mouthwash;
                _context.DailyRecords.Update(record);
            }

            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }
    }

    public class BrushRequest    { public int UserId { get; set; } }
    public class FlossRequest    { public int UserId { get; set; } public bool Flossed    { get; set; } }
    public class MouthwashRequest{ public int UserId { get; set; } public bool Mouthwash  { get; set; } }
}