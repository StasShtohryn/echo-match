using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class EventCategoryConfiguration : IEntityTypeConfiguration<EventCategory>
    {
        public void Configure(EntityTypeBuilder<EventCategory> builder)
        {
            builder.ToTable("EventCategories");

            builder.HasKey(c => c.Id);

            builder.Property(c => c.Code).IsRequired().HasMaxLength(50);
            builder.HasIndex(c => c.Code).IsUnique();

            builder.Property(c => c.Name).IsRequired().HasMaxLength(50);
            builder.HasIndex(c => c.Name).IsUnique();

            builder.HasData(
                new EventCategory { Id = 1, Code = "party", Name = "Вечірки" },
                new EventCategory { Id = 2, Code = "sport", Name = "Спорт" },
                new EventCategory { Id = 3, Code = "music", Name = "Музика й концерти" },
                new EventCategory { Id = 4, Code = "food", Name = "Їжа та напої" },
                new EventCategory { Id = 5, Code = "outdoors", Name = "Природа й прогулянки" },
                new EventCategory { Id = 6, Code = "games", Name = "Ігри та настолки" },
                new EventCategory { Id = 7, Code = "culture", Name = "Культура й мистецтво" },
                new EventCategory { Id = 8, Code = "learning", Name = "Лекції та навчання" },
                new EventCategory { Id = 9, Code = "networking", Name = "Нетворкінг" });
        }
    }
}