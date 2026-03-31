using DisSagligiTakipApp.Core.Entities;
using DisSagligiTakipApp.Data;
using Microsoft.AspNetCore.Mvc;

namespace DisSagligiTakipApp.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NoteController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public NoteController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet("user/{userId}")]
    public IActionResult GetByUser(int userId)
    {
        var notes = _context.Notes
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedDate)
            .Select(n => new {
                n.Id,
                n.Description,
                n.ImagePath,
                createdDate = n.CreatedDate.ToString("yyyy-MM-dd HH:mm"),
                n.UserId
            })
            .ToList();
        return Ok(notes);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] int userId, [FromForm] string description, IFormFile? image)
    {
        if (string.IsNullOrWhiteSpace(description))
            return BadRequest(new { message = "Açıklama boş bırakılamaz." });

        string? imagePath = null;

        if (image != null && image.Length > 0)
        {
            var allowed = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var ext = Path.GetExtension(image.FileName).ToLowerInvariant();
            if (!allowed.Contains(ext))
                return BadRequest(new { message = "Sadece .jpg, .jpeg, .png, .gif, .webp formatları desteklenir." });

            var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
                await image.CopyToAsync(stream);

            imagePath = $"/uploads/{fileName}";
        }

        var note = new Note
        {
            Description = description,
            ImagePath = imagePath,
            CreatedDate = DateTime.Now,
            UserId = userId
        };

        _context.Notes.Add(note);
        _context.SaveChanges();

        return Ok(new {
            note.Id,
            note.Description,
            note.ImagePath,
            createdDate = note.CreatedDate.ToString("yyyy-MM-dd HH:mm"),
            note.UserId
        });
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var note = _context.Notes.FirstOrDefault(n => n.Id == id);
        if (note == null) return NotFound();

        if (!string.IsNullOrEmpty(note.ImagePath))
        {
            var filePath = Path.Combine(_env.WebRootPath ?? "wwwroot", note.ImagePath.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
                System.IO.File.Delete(filePath);
        }

        _context.Notes.Remove(note);
        _context.SaveChanges();
        return Ok(new { message = "Not silindi." });
    }
}