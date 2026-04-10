using DisSagligiTakipApp.Core.Entities;
using DisSagligiTakipApp.Data;
using DisSagligiTakipApp.Service.Abstract;
using Microsoft.EntityFrameworkCore;

namespace DisSagligiTakipApp.Service.Concrete;

public class DailyRecordService : IDailyRecordService
{
    private readonly AppDbContext _context;

    public DailyRecordService(AppDbContext context)
    {
        _context = context;
    }

    public List<DailyRecord> GetLast7Days(int userId)
    {
        var sevenDaysAgo = DateTime.Today.AddDays(-6);

        return _context.DailyRecords
            .Where(r => r.UserId == userId && r.Date >= sevenDaysAgo)
            .OrderBy(r => r.Date)
            .ToList();
    }

    public DailyRecord? GetToday(int userId)
    {
        return _context.DailyRecords
            .FirstOrDefault(r => r.UserId == userId && r.Date == DateTime.Today);
    }

    public DailyRecord Upsert(int userId, int brushCount, bool flossed, bool mouthwash)
    {
        var record = GetToday(userId);

        if (record == null)
        {
            record = new DailyRecord
            {
                UserId     = userId,
                Date       = DateTime.Today,
                BrushCount = brushCount,
                Flossed    = flossed,
                Mouthwash  = mouthwash
            };
            _context.DailyRecords.Add(record);
        }
        else
        {
            record.BrushCount = brushCount;
            record.Flossed    = flossed;
            record.Mouthwash  = mouthwash;
            _context.DailyRecords.Update(record);
        }

        _context.SaveChanges();
        return record;
    }

    public async Task<DailyRecord?> GetTodayRecordAsync(int userId)
    {
        var record = await _context.DailyRecords
            .FirstOrDefaultAsync(r => r.UserId == userId && r.Date == DateTime.Today);

        if (record == null) return null;

        
        record.HealthScore = (record.BrushCount * 20)
                           + (record.Flossed   ? 20 : 0)
                           + (record.Mouthwash ? 20 : 0);

        
        var sevenDaysAgo = DateTime.Today.AddDays(-6);
        var weekRecords  = await _context.DailyRecords
            .Where(r => r.UserId == userId && r.Date >= sevenDaysAgo)
            .OrderBy(r => r.Date)
            .ToListAsync();

        record.WeeklyData = Enumerable.Range(0, 7)
            .Select(i => {
                var day = DateTime.Today.AddDays(i - 6);
                return weekRecords.FirstOrDefault(r => r.Date == day)?.BrushCount ?? 0;
            })
            .ToArray();

        
        int streak    = 0;
        var checkDate = DateTime.Today;
        while (await _context.DailyRecords
                   .AnyAsync(r => r.UserId == userId && r.Date == checkDate))
        {
            streak++;
            checkDate = checkDate.AddDays(-1);
        }
        record.Streak = streak;

        return record;
    }

    public async Task RecordBrushingAsync(int userId)
    {
        var record = await _context.DailyRecords
            .FirstOrDefaultAsync(r => r.UserId == userId && r.Date == DateTime.Today);

        if (record == null)
        {
            _context.DailyRecords.Add(new DailyRecord
            {
                UserId     = userId,
                Date       = DateTime.Today,
                BrushCount = 1,
                Flossed    = false,
                Mouthwash  = false
            });
        }
        else if (record.BrushCount < 3)
        {
            record.BrushCount++;
            _context.DailyRecords.Update(record);
        }

        await _context.SaveChangesAsync();
    }
}