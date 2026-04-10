namespace DisSagligiTakipApp.Core.Entities;
using System.ComponentModel.DataAnnotations.Schema;

public class DailyRecord
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime Date { get; set; }

    public int BrushCount { get; set; } = 0;

    public bool Flossed { get; set; } = false;

    public bool Mouthwash { get; set; } = false;

    [NotMapped]
    public int HealthScore { get; set; }

    [NotMapped]
    public int Streak { get; set; }

    [NotMapped]
    public int[]? WeeklyData { get; set; }
}