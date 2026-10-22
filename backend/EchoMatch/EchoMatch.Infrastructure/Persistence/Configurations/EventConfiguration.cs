using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class EventConfiguration : IEntityTypeConfiguration<Event>
    {
        public void Configure(EntityTypeBuilder<Event> builder)
        {
            builder.ToTable("Events", table =>
            {
                table.HasCheckConstraint(
                    "CK_Events_Capacity",
                    $"[Capacity] IS NULL OR [Capacity] BETWEEN {Event.MinCapacity} AND {Event.MaxCapacity}");

                table.HasCheckConstraint(
                    "CK_Events_EndsAfterStart",
                    "[EndsAt] IS NULL OR [EndsAt] > [StartsAt]");
            });

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Title).IsRequired().HasMaxLength(Event.MaxTitleLength);
            builder.Property(e => e.Description).HasMaxLength(Event.MaxDescriptionLength);
            builder.Property(e => e.City).IsRequired().HasMaxLength(Event.MaxCityLength);
            builder.Property(e => e.PlaceName).HasMaxLength(Event.MaxPlaceNameLength);
            builder.Property(e => e.CoverUrl).HasMaxLength(500);
            builder.Property(e => e.CoverPublicId).HasMaxLength(200);

            builder.HasOne(e => e.OrganizerProfile)
                .WithMany()
                .HasForeignKey(e => e.OrganizerProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.Category)
                .WithMany()
                .HasForeignKey(e => e.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            // Список подій завжди шукає нескасовані, найближчі першими
            builder.HasIndex(e => e.StartsAt)
                .HasFilter("[IsDeleted] = 0 AND [CancelledAt] IS NULL");
        }
    }
}