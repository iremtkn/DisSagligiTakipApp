using DisSagligiTakipApp.Core.Entities;
using DisSagligiTakipApp.Service.Abstract;
using Microsoft.AspNetCore.Mvc;
using System;
using Serilog;

namespace DisSagligiTakipApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public IActionResult Register(User user)
        {
            try
            {
                _userService.Register(user, user.Password);
                return Ok(new { message = "Kayıt başarıyla tamamlandı!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest model)
        {
            var user = _userService.GetByEmail(model.Email);
            if (user == null)
                return Ok(new { success = false, message = "E-posta adresi bulunamadı." });

            var authenticatedUser = _userService.Login(model.Email, model.Password);
            if (authenticatedUser == null)
                return Ok(new { success = false, message = "Hatalı şifre." });

            return Ok(new { success = true, user = authenticatedUser });
        }

        [HttpGet("check-user")]
        public IActionResult CheckUser([FromQuery] string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return Ok(new { exists = false });

            var user = _userService.GetByEmail(email);
            return Ok(new { exists = user != null });
        }

        [HttpGet("test-hata")]
        public IActionResult TestHata()
        {
        try {
        int a = 10;
        int b = 0;
        int sonuc = a / b; 
        return Ok(sonuc);
        }
        catch (Exception ex)
        {
        Log.Error(ex, "Kritik bir hata oluştu: Diş Sağlığı Uygulaması Test Hatası!");
        throw; 
        }
        }

        [HttpPost("reset-password")]
        public IActionResult ResetPassword([FromBody] ResetPasswordRequest model)
        {
            try
            {
                _userService.ResetPassword(model.Email, model.NewPassword);
                return Ok(new { message = "Şifreniz başarıyla güncellendi." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class LoginRequest { public string Email { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }
    public class ResetPasswordRequest { public string Email { get; set; } = string.Empty; public string NewPassword { get; set; } = string.Empty; }
}
