namespace DisSagligiTakipApp.Core.Entities;

public class User
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty; 
    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public List<Goal> Goals { get; set; } = new();
}

