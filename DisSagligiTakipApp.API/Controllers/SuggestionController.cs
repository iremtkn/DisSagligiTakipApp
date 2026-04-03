using DisSagligiTakipApp.Data;
using Microsoft.AspNetCore.Mvc;

namespace DisSagligiTakipApp.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class SuggestionController : ControllerBase
{
    private readonly AppDbContext _context;
    private static readonly Random _random = new();

    public SuggestionController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("random")]
    public IActionResult GetRandom()
    {
        var suggestions = _context.Suggestions.ToList();
        if (suggestions.Count == 0)
            return Ok(new { text = "Dişlerinizi günde en az 2 kez fırçalamayı unutmayın!" });

        var random = suggestions[_random.Next(suggestions.Count)];
        return Ok(new { id = random.Id, text = random.Text });
    }

    [HttpGet("all")]
    public IActionResult GetAll()
    {
        return Ok(_context.Suggestions.ToList());
    }
}