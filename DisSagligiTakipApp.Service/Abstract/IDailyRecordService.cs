using DisSagligiTakipApp.Core.Entities;

namespace DisSagligiTakipApp.Service.Abstract;

public interface IDailyRecordService
{
    List<DailyRecord> GetLast7Days(int userId);
    DailyRecord? GetToday(int userId);
    DailyRecord Upsert(int userId, int brushCount, bool flossed, bool mouthwash);
    int GetStreak(int userId);

    Task<DailyRecord?> GetTodayRecordAsync(int userId);
    Task RecordBrushingAsync(int userId);
}