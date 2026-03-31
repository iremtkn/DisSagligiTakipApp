namespace DisSagligiTakipApp.Core.Entities;

public class Note
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty; 
    public string? ImagePath { get; set; } 
    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}