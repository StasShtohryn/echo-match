using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class SwipeConfiguration : IEntityTypeConfiguration<Swipe>
    {
        public void Configure(EntityTypeBuilder<Swipe> builder)
        {
            builder.ToTable("Swipes", table =>
                table.HasCheckConstraint("CK_Swipes_NotSelf", "[SwiperProfileId] <> [TargetProfileId]"));

            builder.HasKey(s => s.Id);

            builder.HasOne(s => s.SwiperProfile)
                .WithMany()
                .HasForeignKey(s => s.SwiperProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.TargetProfile)
                .WithMany()
                .HasForeignKey(s => s.TargetProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            // Один активний свайп на пару. Фільтр лишає можливість свайпнути
            // знову після скасування, коли старий рядок помічений видаленим.
            builder.HasIndex(s => new { s.SwiperProfileId, s.TargetProfileId })
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");

        }
    }
}