using DisSagligiTakipApp.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace DisSagligiTakipApp.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Goal> Goals { get; set; }
    public DbSet<Activity> Activities { get; set; }
    public DbSet<Note> Notes { get; set; }
    public DbSet<Suggestion> Suggestions { get; set; }

    public DbSet<DailyRecord> DailyRecords { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<DailyRecord>()
            .HasIndex(r => new { r.UserId, r.Date })
            .IsUnique();

        modelBuilder.Entity<Suggestion>().HasData(
            new Suggestion { Id = 1,  Text = "Dişlerinizi günde en az 2 kez, 2'şer dakika boyunca fırçalayın." },
            new Suggestion { Id = 2,  Text = "Diş ipi kullanmak, diş fırçasının ulaşamadığı yerlerin %35'ini temizler." },
            new Suggestion { Id = 3,  Text = "Şekerli içecekler tüketimini azaltmak diş çürümesini önemli ölçüde engeller." },
            new Suggestion { Id = 4,  Text = "Gece yatmadan önce dişlerinizi fırçalamak, gece boyunca bakteri oluşumunu azaltır." },
            new Suggestion { Id = 5,  Text = "Diş fırçanızı her 3 ayda bir yenilemeyi unutmayın." },
            new Suggestion { Id = 6,  Text = "Meyve suyu yerine taze meyve tüketmek dişleri asit hasarından korur." },
            new Suggestion { Id = 7,  Text = "Florürlü diş macunu kullanmak diş minеsini güçlendirir." },
            new Suggestion { Id = 8,  Text = "Ağız gargarası kullanmak, fırçalamanın ulaşamadığı bölgelerdeki bakterileri temizler." },
            new Suggestion { Id = 9,  Text = "Düzenli diş hekimi kontrolleri erken dönem problemlerin tespitini sağlar." },
            new Suggestion { Id = 10, Text = "Su içmek ağız kuruluğunu önler ve asit dengesini korur." },
            new Suggestion { Id = 11, Text = "Asitli içeceklerden sonra en az 30 dakika bekleyip dişlerinizi fırçalayın." },
            new Suggestion { Id = 12, Text = "Diş gıcırdatma (bruksizm) varsa diş hekiminizden gece koruyucusu isteyin." }
        );
    }
}