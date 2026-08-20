
using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class LanguageConfiguration : IEntityTypeConfiguration<Language>
    {
        public void Configure(EntityTypeBuilder<Language> builder)
        {
            builder.ToTable("Languages");

            builder.HasKey(l => l.Id);

            builder.Property(l => l.Name).IsRequired().HasMaxLength(50);
            builder.Property(l => l.Code).IsRequired().HasMaxLength(5);

            builder.HasIndex(l => l.Code).IsUnique();


            builder.HasData(
                // Україна та сусіди
                new Language { Id = 1, Code = "uk", Name = "Українська" },
                new Language { Id = 2, Code = "pl", Name = "Польська" },
                new Language { Id = 3, Code = "sk", Name = "Словацька" },
                new Language { Id = 4, Code = "cs", Name = "Чеська" },
                new Language { Id = 5, Code = "hu", Name = "Угорська" },
                new Language { Id = 6, Code = "ro", Name = "Румунська" },
                new Language { Id = 7, Code = "bg", Name = "Болгарська" },
                new Language { Id = 8, Code = "be", Name = "Білоруська" },

                // Балтія
                new Language { Id = 9, Code = "lt", Name = "Литовська" },
                new Language { Id = 10, Code = "lv", Name = "Латвійська" },
                new Language { Id = 11, Code = "et", Name = "Естонська" },

                // Західна та Північна Європа
                new Language { Id = 12, Code = "en", Name = "Англійська" },
                new Language { Id = 13, Code = "de", Name = "Німецька" },
                new Language { Id = 14, Code = "fr", Name = "Французька" },
                new Language { Id = 15, Code = "es", Name = "Іспанська" },
                new Language { Id = 16, Code = "it", Name = "Італійська" },
                new Language { Id = 17, Code = "pt", Name = "Португальська" },
                new Language { Id = 18, Code = "nl", Name = "Нідерландська" },
                new Language { Id = 19, Code = "sv", Name = "Шведська" },
                new Language { Id = 20, Code = "no", Name = "Норвезька" },
                new Language { Id = 21, Code = "da", Name = "Данська" },
                new Language { Id = 22, Code = "fi", Name = "Фінська" },
                new Language { Id = 23, Code = "el", Name = "Грецька" },

                // Балкани
                new Language { Id = 24, Code = "hr", Name = "Хорватська" },
                new Language { Id = 25, Code = "sr", Name = "Сербська" },
                new Language { Id = 26, Code = "sl", Name = "Словенська" },
                new Language { Id = 27, Code = "sq", Name = "Албанська" },
                new Language { Id = 28, Code = "mk", Name = "Македонська" },

                // Кавказ і Центральна Азія
                new Language { Id = 29, Code = "ka", Name = "Грузинська" },
                new Language { Id = 30, Code = "hy", Name = "Вірменська" },
                new Language { Id = 31, Code = "az", Name = "Азербайджанська" },
                new Language { Id = 32, Code = "kk", Name = "Казахська" },
                new Language { Id = 33, Code = "uz", Name = "Узбецька" },

                // Близький Схід
                new Language { Id = 34, Code = "tr", Name = "Турецька" },
                new Language { Id = 35, Code = "ar", Name = "Арабська" },
                new Language { Id = 36, Code = "he", Name = "Іврит" },
                new Language { Id = 37, Code = "fa", Name = "Перська" },

                // Азія
                new Language { Id = 38, Code = "hi", Name = "Гінді" },
                new Language { Id = 39, Code = "zh", Name = "Китайська" },
                new Language { Id = 40, Code = "ja", Name = "Японська" },
                new Language { Id = 41, Code = "ko", Name = "Корейська" },
                new Language { Id = 42, Code = "vi", Name = "В'єтнамська" },
                new Language { Id = 43, Code = "th", Name = "Тайська" },
                new Language { Id = 44, Code = "id", Name = "Індонезійська" });
        }
    }
}
