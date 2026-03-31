namespace DisSagligiTakipApp.Core.Entities;

public class Activity
{
    public int Id { get; set; }
    public DateTime Date { get; set; } 
    public string Time { get; set; } = string.Empty; 
    public int Duration { get; set; } 
    public bool IsApplied { get; set; } 


    public int GoalId { get; set; }
    public Goal Goal { get; set; } = null!;
}