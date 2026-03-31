using DisSagligiTakipApp.Core.Entities;

namespace DisSagligiTakipApp.Service.Abstract
{
    public interface IUserService
    {
        void Register(User user, string password);
        User? Login(string email, string password);
        User? GetByEmail(string email);
        User? GetById(int id);
        void ResetPassword(string email, string newPassword);
        void UpdateProfile(int userId, string firstName, string lastName, DateTime birthDate, string email, string newPassword);
        string Decrypt(string encryptedPassword); 
    }
}