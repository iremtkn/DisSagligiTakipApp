using DisSagligiTakipApp.Core.Entities;
using DisSagligiTakipApp.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DisSagligiTakipApp.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ActivityController : ControllerBase
{
    private readonly AppDbContext _context;

    public ActivityController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("last7days/{userId}")]
    public IActionResult GetLast7Days(int userId)
    {
        var sevenDaysAgo = DateTime.Today.AddDays(-6);

        var activities = _context.Activities
            .Include(a => a.Goal)
            .Where(a => a.Goal.UserId == userId && a.Date >= sevenDaysAgo)
            .OrderByDescending(a => a.Date)
            .Select(a => new {
                a.Id,
                date = a.Date.ToString("yyyy-MM-dd"),
                a.Time,
                a.Duration,
                a.IsApplied,
                a.GoalId,
                goalTitle = a.Goal.Title
            })
            .ToList();

        return Ok(activities);
    }

    [HttpPost]
    public IActionResult Create([FromBody] CreateActivityRequest req)
    {
        var goal = _context.Goals.FirstOrDefault(g => g.Id == req.GoalId);
        if (goal == null) return NotFound(new { message = "Hedef bulunamadı." });

        var activity = new Activity
        {
            Date = req.Date,
            Time = req.Time,
            Duration = req.Duration,
            IsApplied = req.IsApplied,
            GoalId = req.GoalId
        };
        _context.Activities.Add(activity);
        _context.SaveChanges();

        return Ok(new {
            activity.Id,
            date = activity.Date.ToString("yyyy-MM-dd"),
            activity.Time,
            activity.Duration,
            activity.IsApplied,
            activity.GoalId,
            goalTitle = goal.Title
        });
    }

    [HttpGet("goal/{goalId}")]
    public IActionResult GetByGoal(int goalId)
    {
        var activities = _context.Activities
            .Where(a => a.GoalId == goalId)
            .OrderByDescending(a => a.Date)
            .Select(a => new {
                a.Id,
                date = a.Date.ToString("yyyy-MM-dd"),
                a.Time,
                a.Duration,
                a.IsApplied,
                a.GoalId
            })
            .ToList();
        return Ok(activities);
    }
}

public class CreateActivityRequest
{
    public int GoalId { get; set; }
    public DateTime Date { get; set; }
    public string Time { get; set; } = string.Empty;
    public int Duration { get; set; }
    public bool IsApplied { get; set; }
}