using DisSagligiTakipApp.Service.Abstract;
using Microsoft.AspNetCore.Mvc;

namespace DisSagligiTakipApp.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProfileController : ControllerBase
{
    private readonly IUserService _userService;

    public ProfileController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("{userId}")]
    public IActionResult GetProfile(int userId)
    {
        var user = _userService.GetById(userId);
        if (user == null) return NotFound(new { message = "Kullanıcı bulunamadı." });

        return Ok(new
        {
            user.Id,
            user.FirstName,
            user.LastName,
            user.Email,
            BirthDate = user.BirthDate.ToString("yyyy-MM-dd"),
        });
    }

    [HttpPut("update")]
    public IActionResult UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            _userService.UpdateProfile(
                request.UserId,
                request.FirstName,
                request.LastName,
                request.BirthDate,
                request.Email,
                request.NewPassword ?? ""
            );

            var updatedUser = _userService.GetById(request.UserId);
            return Ok(new
            {
                message = "Profil başarıyla güncellendi.",
                user = new
                {
                    updatedUser!.Id,
                    updatedUser.FirstName,
                    updatedUser.LastName,
                    updatedUser.Email,
                    BirthDate = updatedUser.BirthDate.ToString("yyyy-MM-dd"),
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("check-email")]
    public IActionResult CheckEmail([FromQuery] string email, [FromQuery] int userId)
    {
        var existing = _userService.GetByEmail(email);
        if (existing == null || existing.Id == userId)
            return Ok(new { available = true });

        return Ok(new { available = false });
    }
}

public class UpdateProfileRequest
{
    public int UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public string? NewPassword { get; set; }
}