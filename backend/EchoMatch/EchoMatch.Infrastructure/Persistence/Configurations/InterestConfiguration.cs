

using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class InterestConfiguration : IEntityTypeConfiguration<Interest>
    {
        public void Configure(EntityTypeBuilder<Interest> builder)
        {
            builder.ToTable("Interests");

            builder.HasKey(i => i.Id);

            builder.Property(i => i.Code).IsRequired().HasMaxLength(50);
            builder.HasIndex(i => i.Code).IsUnique();

            builder.Property(i => i.Name).IsRequired().HasMaxLength(50);
            builder.HasIndex(i => i.Name).IsUnique();


            builder.HasData(
                new Interest { Id = 1, Code = "travel", Name = "Подорожі" },
                new Interest { Id = 2, Code = "coffee", Name = "Кава" },
                new Interest { Id = 3, Code = "music", Name = "Музика" },
                new Interest { Id = 4, Code = "movies", Name = "Кіно" },
                new Interest { Id = 5, Code = "fitness", Name = "Фітнес" },
                new Interest { Id = 6, Code = "cooking", Name = "Кулінарія" },
                new Interest { Id = 7, Code = "photography", Name = "Фотографія" },
                new Interest { Id = 8, Code = "reading", Name = "Читання" },
                new Interest { Id = 9, Code = "gaming", Name = "Відеоігри" },
                new Interest { Id = 10, Code = "hiking", Name = "Походи" },
                new Interest { Id = 11, Code = "dancing", Name = "Танці" },
                new Interest { Id = 12, Code = "yoga", Name = "Йога" },
                new Interest { Id = 13, Code = "art", Name = "Мистецтво" },
                new Interest { Id = 14, Code = "running", Name = "Біг" },
                new Interest { Id = 15, Code = "cycling", Name = "Велоспорт" },
                new Interest { Id = 16, Code = "swimming", Name = "Плавання" },
                new Interest { Id = 17, Code = "football", Name = "Футбол" },
                new Interest { Id = 18, Code = "basketball", Name = "Баскетбол" },
                new Interest { Id = 19, Code = "skiing", Name = "Лижі" },
                new Interest { Id = 20, Code = "wine", Name = "Вино" },
                new Interest { Id = 21, Code = "foodie", Name = "Гастрономія" },
                new Interest { Id = 22, Code = "pets", Name = "Домашні улюбленці" },
                new Interest { Id = 23, Code = "volunteering", Name = "Волонтерство" },
                new Interest { Id = 24, Code = "startups", Name = "Стартапи" });
        }
    }
}
