namespace DisSagligiTakipApp.Core.Entities;

public class DailyRecord
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime Date { get; set; }

    public int BrushCount { get; set; } = 0;

    public bool Flossed { get; set; } = false;

    public bool Mouthwash { get; set; } = false;
}