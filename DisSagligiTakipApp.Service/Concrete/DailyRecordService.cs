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
                UserId = userId,
                Date = DateTime.Today,
                BrushCount = brushCount,
                Flossed = flossed,
                Mouthwash = mouthwash
            };
            _context.DailyRecords.Add(record);
        }
        else
        {
            record.BrushCount = brushCount;
            record.Flossed = flossed;
            record.Mouthwash = mouthwash;
            _context.DailyRecords.Update(record);
        }

        _context.SaveChanges();
        return record;
    }
}