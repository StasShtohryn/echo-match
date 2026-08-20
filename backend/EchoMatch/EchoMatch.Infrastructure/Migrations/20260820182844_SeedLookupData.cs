using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace EchoMatch.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedLookupData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "ProfilePrompts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "Interests",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.InsertData(
                table: "Interests",
                columns: new[] { "Id", "Code", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, "travel", true, "Подорожі" },
                    { 2, "coffee", true, "Кава" },
                    { 3, "music", true, "Музика" },
                    { 4, "movies", true, "Кіно" },
                    { 5, "fitness", true, "Фітнес" },
                    { 6, "cooking", true, "Кулінарія" },
                    { 7, "photography", true, "Фотографія" },
                    { 8, "reading", true, "Читання" },
                    { 9, "gaming", true, "Відеоігри" },
                    { 10, "hiking", true, "Походи" },
                    { 11, "dancing", true, "Танці" },
                    { 12, "yoga", true, "Йога" },
                    { 13, "art", true, "Мистецтво" },
                    { 14, "running", true, "Біг" },
                    { 15, "cycling", true, "Велоспорт" },
                    { 16, "swimming", true, "Плавання" },
                    { 17, "football", true, "Футбол" },
                    { 18, "basketball", true, "Баскетбол" },
                    { 19, "skiing", true, "Лижі" },
                    { 20, "wine", true, "Вино" },
                    { 21, "foodie", true, "Гастрономія" },
                    { 22, "pets", true, "Домашні улюбленці" },
                    { 23, "volunteering", true, "Волонтерство" },
                    { 24, "startups", true, "Стартапи" }
                });

            migrationBuilder.InsertData(
                table: "Languages",
                columns: new[] { "Id", "Code", "IsActive", "Name" },
                values: new object[,]
                {
                    { 1, "uk", true, "Українська" },
                    { 2, "pl", true, "Польська" },
                    { 3, "sk", true, "Словацька" },
                    { 4, "cs", true, "Чеська" },
                    { 5, "hu", true, "Угорська" },
                    { 6, "ro", true, "Румунська" },
                    { 7, "bg", true, "Болгарська" },
                    { 8, "be", true, "Білоруська" },
                    { 9, "lt", true, "Литовська" },
                    { 10, "lv", true, "Латвійська" },
                    { 11, "et", true, "Естонська" },
                    { 12, "en", true, "Англійська" },
                    { 13, "de", true, "Німецька" },
                    { 14, "fr", true, "Французька" },
                    { 15, "es", true, "Іспанська" },
                    { 16, "it", true, "Італійська" },
                    { 17, "pt", true, "Португальська" },
                    { 18, "nl", true, "Нідерландська" },
                    { 19, "sv", true, "Шведська" },
                    { 20, "no", true, "Норвезька" },
                    { 21, "da", true, "Данська" },
                    { 22, "fi", true, "Фінська" },
                    { 23, "el", true, "Грецька" },
                    { 24, "hr", true, "Хорватська" },
                    { 25, "sr", true, "Сербська" },
                    { 26, "sl", true, "Словенська" },
                    { 27, "sq", true, "Албанська" },
                    { 28, "mk", true, "Македонська" },
                    { 29, "ka", true, "Грузинська" },
                    { 30, "hy", true, "Вірменська" },
                    { 31, "az", true, "Азербайджанська" },
                    { 32, "kk", true, "Казахська" },
                    { 33, "uz", true, "Узбецька" },
                    { 34, "tr", true, "Турецька" },
                    { 35, "ar", true, "Арабська" },
                    { 36, "he", true, "Іврит" },
                    { 37, "fa", true, "Перська" },
                    { 38, "hi", true, "Гінді" },
                    { 39, "zh", true, "Китайська" },
                    { 40, "ja", true, "Японська" },
                    { 41, "ko", true, "Корейська" },
                    { 42, "vi", true, "В'єтнамська" },
                    { 43, "th", true, "Тайська" },
                    { 44, "id", true, "Індонезійська" }
                });

            migrationBuilder.InsertData(
                table: "ProfilePrompts",
                columns: new[] { "Id", "Code", "IsActive", "Question" },
                values: new object[,]
                {
                    { 1, "key_to_my_heart", true, "Ключ до мого серця…" },
                    { 2, "simple_pleasures", true, "Мої прості радощі…" },
                    { 3, "win_me_over", true, "Найкращий спосіб мене підкорити…" },
                    { 4, "looking_for", true, "Я шукаю…" },
                    { 5, "bucket_list_first", true, "Перший пункт у моєму списку мрій…" },
                    { 6, "controversial_opinion", true, "Моя найсуперечливіша думка…" },
                    { 7, "geek_out", true, "Можу говорити годинами про…" },
                    { 8, "typical_sunday", true, "Моя типова неділя…" },
                    { 9, "first_date_wishlist", true, "Ідеальне перше побачення…" },
                    { 10, "two_truths_and_a_lie", true, "Дві правди і брехня" },
                    { 11, "talking_to_my_pet", true, "Розповідаю своєму улюбленцю про…" },
                    { 12, "why_hasnt_someone_invented", true, "Чому досі ніхто не винайшов…" },
                    { 13, "same_type_of_weird", true, "Ми однаково дивні, якщо…" },
                    { 14, "hot_take", true, "Неочевидна думка…" },
                    { 15, "hoping_you", true, "Сподіваюся, що ти…" },
                    { 16, "dating_me_is_like", true, "Зустрічатися зі мною — це як…" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProfilePrompts_Code",
                table: "ProfilePrompts",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Interests_Code",
                table: "Interests",
                column: "Code",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProfilePrompts_Code",
                table: "ProfilePrompts");

            migrationBuilder.DropIndex(
                name: "IX_Interests_Code",
                table: "Interests");

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "Interests",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 17);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 18);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 19);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 20);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 21);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 22);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 23);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 24);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 25);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 26);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 28);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 39);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 40);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 41);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 42);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 43);

            migrationBuilder.DeleteData(
                table: "Languages",
                keyColumn: "Id",
                keyValue: 44);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 12);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 13);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 14);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 15);

            migrationBuilder.DeleteData(
                table: "ProfilePrompts",
                keyColumn: "Id",
                keyValue: 16);

            migrationBuilder.DropColumn(
                name: "Code",
                table: "ProfilePrompts");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "Interests");
        }
    }
}
