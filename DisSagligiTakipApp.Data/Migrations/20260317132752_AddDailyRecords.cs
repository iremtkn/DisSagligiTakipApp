using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DisSagligiTakipApp.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyRecords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DailyRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BrushCount = table.Column<int>(type: "int", nullable: false),
                    Flossed = table.Column<bool>(type: "bit", nullable: false),
                    Mouthwash = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DailyRecords_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Suggestions",
                columns: new[] { "Id", "Text" },
                values: new object[,]
                {
                    { 1, "Dişlerinizi günde en az 2 kez, 2'şer dakika boyunca fırçalayın." },
                    { 2, "Diş ipi kullanmak, diş fırçasının ulaşamadığı yerlerin %35'ini temizler." },
                    { 3, "Şekerli içecekler tüketimini azaltmak diş çürümesini önemli ölçüde engeller." },
                    { 4, "Gece yatmadan önce dişlerinizi fırçalamak, gece boyunca bakteri oluşumunu azaltır." },
                    { 5, "Diş fırçanızı her 3 ayda bir yenilemeyi unutmayın." },
                    { 6, "Meyve suyu yerine taze meyve tüketmek dişleri asit hasarından korur." },
                    { 7, "Florürlü diş macunu kullanmak diş minесini güçlendirir." },
                    { 8, "Ağız gargarası kullanmak, fırçalamanın ulaşamadığı bölgelerdeki bakterileri temizler." },
                    { 9, "Düzenli diş hekimi kontrolleri erken dönem problemlerin tespitini sağlar." },
                    { 10, "Su içmek ağız kuruluğunu önler ve asit dengesini korur." },
                    { 11, "Asitli içeceklerden sonra en az 30 dakika bekleyip dişlerinizi fırçalayın." },
                    { 12, "Diş gıcırdatma (bruksizm) varsa diş hekiminizden gece koruyucusu isteyin." }
                });

            migrationBuilder.CreateIndex(
                name: "IX_DailyRecords_UserId_Date",
                table: "DailyRecords",
                columns: new[] { "UserId", "Date" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DailyRecords");

            migrationBuilder.DeleteData(
                table: "Suggestions",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Suggestions",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Suggestions",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Suggestions",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Suggestions",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Suggestions",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Suggestions",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Suggestions",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Suggestions",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Suggestions",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Suggestions",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Suggestions",
                keyColumn: "Id",
                keyValue: 12);
        }
    }
}
