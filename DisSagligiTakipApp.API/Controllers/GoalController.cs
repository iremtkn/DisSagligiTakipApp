using DisSagligiTakipApp.Core.Entities;
using DisSagligiTakipApp.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DisSagligiTakipApp.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GoalController : ControllerBase
{
    private readonly AppDbContext _context;

    public GoalController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetByUser(int userId)
    {
        var goals = _context.Goals
            .Where(g => g.UserId == userId)
            .Include(g => g.Activities)
            .Select(g => new {
                g.Id, g.Title, g.Description, g.Period, g.Priority, g.UserId,
                activityCount = g.Activities.Count
            })
            .ToList();
        return Ok(goals);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateGoalRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title))
            return BadRequest(new { message = "Başlık boş bırakılamaz." });

        var goal = new Goal
        {
            Title = req.Title,
            Description = req.Description,
            Period = req.Period,
            Priority = req.Priority,
            UserId = req.UserId
        };
        _context.Goals.Add(goal);
        _context.SaveChanges();
        return Ok(new { goal.Id, goal.Title, goal.Description, goal.Period, goal.Priority, goal.UserId, activityCount = 0 });
    }

    [HttpGet("{id}/has-activities")]
    public IActionResult HasActivities(int id)
    {
        var hasActivities = _context.Activities.Any(a => a.GoalId == id);
        return Ok(new { hasActivities });
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var goal = _context.Goals.Include(g => g.Activities).FirstOrDefault(g => g.Id == id);
        if (goal == null) return NotFound(new { message = "Hedef bulunamadı." });

        _context.Goals.Remove(goal);
        _context.SaveChanges();
        return Ok(new { message = "Hedef silindi." });
    }
}

public class CreateGoalRequest
{
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Period { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
}