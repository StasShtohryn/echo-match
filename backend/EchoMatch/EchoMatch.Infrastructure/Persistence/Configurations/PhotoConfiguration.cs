using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class PhotoConfiguration : IEntityTypeConfiguration<Photo>
    {
        public void Configure(EntityTypeBuilder<Photo> builder)
        {
            builder.ToTable("Photos");

            builder.HasKey(p => p.Id);

            builder.HasOne(p => p.UserProfile)
                .WithMany(profile => profile.Photos)
                .HasForeignKey(p => p.UserProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(p => p.Url).IsRequired().HasMaxLength(500);
            builder.Property(p => p.PublicId).IsRequired().HasMaxLength(200);

            builder.HasIndex(p => new { p.UserProfileId, p.Order });
        }
    }
}
