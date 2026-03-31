namespace DisSagligiTakipApp.Core.Entities;

public class Goal
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public List<Activity> Activities { get; set; } = new();
}