using DisSagligiTakipApp.Core.Entities;
using DisSagligiTakipApp.Data;
using DisSagligiTakipApp.Service.Abstract;
using System;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace DisSagligiTakipApp.Service.Concrete
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;
        private const string SecurityKey = "DisSagligi2026_Key!";

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public User? GetByEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return null;
            return _context.Users.AsEnumerable().FirstOrDefault(u =>
                u.Email.Trim().Equals(email.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        public User? GetById(int id)
        {
            return _context.Users.FirstOrDefault(u => u.Id == id);
        }

        public void ResetPassword(string email, string newPassword)
        {
            var user = GetByEmail(email);
            if (user == null) throw new Exception("Kullanıcı bulunamadı.");
            user.Password = Encrypt(newPassword);
            _context.Users.Update(user);
            _context.SaveChanges();
        }

        public void UpdateProfile(int userId, string firstName, string lastName, DateTime birthDate, string email, string newPassword)
        {
            var user = GetById(userId);
            if (user == null) throw new Exception("Kullanıcı bulunamadı.");

            if (!user.Email.Trim().Equals(email.Trim(), StringComparison.OrdinalIgnoreCase))
            {
                var existing = GetByEmail(email);
                if (existing != null && existing.Id != userId)
                    throw new Exception("Bu e-posta adresi başka bir kullanıcıya kayıtlı.");
            }

            user.FirstName = firstName;
            user.LastName = lastName;
            user.BirthDate = birthDate;
            user.Email = email.Trim();

            if (!string.IsNullOrWhiteSpace(newPassword))
                user.Password = Encrypt(newPassword);

            _context.Users.Update(user);
            _context.SaveChanges();
        }

        public void Register(User user, string password)
        {
            var existingUser = GetByEmail(user.Email);
            if (existingUser != null)
                throw new Exception("Bu e-posta adresi zaten sisteme kayıtlı!");

            user.Password = Encrypt(password);
            _context.Users.Add(user);
            _context.SaveChanges();
            SendWelcomeMail(user.Email, user.FirstName);
        }

        public User? Login(string email, string password)
        {
            string encryptedPassword = Encrypt(password);
            var user = GetByEmail(email);
            if (user != null && user.Password == encryptedPassword)
                return user;
            return null;
        }

        private string Encrypt(string password)
        {
            var combinedText = password + SecurityKey;
            var bytes = Encoding.UTF8.GetBytes(combinedText);
            return Convert.ToBase64String(bytes);
        }

        public string Decrypt(string encryptedPassword)
        {
            var bytes = Convert.FromBase64String(encryptedPassword);
            var combinedText = Encoding.UTF8.GetString(bytes);
            return combinedText.Substring(0, combinedText.Length - SecurityKey.Length);
        }

        private void SendWelcomeMail(string email, string name)
        {
            try
            {
                var mail = new MailMessage();
                mail.From = new MailAddress("iiremnisatekin@gmail.com", "Diş Sağlığı Takip");
                mail.To.Add(email);
                mail.Subject = "Kayıt Başarılı!";
                mail.IsBodyHtml = true;
                mail.Body = $@"<html><body><h2>Merhaba {name}!</h2><p>Kaydın başarıyla tamamlandı.</p></body></html>";

                using (var smtp = new SmtpClient("smtp.gmail.com", 587))
                {
                    smtp.EnableSsl = true;
                    smtp.UseDefaultCredentials = false;
                    smtp.Credentials = new NetworkCredential("iiremnisatekin@gmail.com", "kjrzltlsvcooqxzh");
                    smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
                    smtp.Send(mail);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(">>> MAIL ERROR: " + ex.Message);
            }
        }
    }
}