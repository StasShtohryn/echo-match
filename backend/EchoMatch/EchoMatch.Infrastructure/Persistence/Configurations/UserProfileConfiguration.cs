using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
    {
        public void Configure(EntityTypeBuilder<UserProfile> builder)
        {
            builder.ToTable("UserProfiles");

            builder.HasKey(p => p.Id);

            builder.HasOne(p => p.User)
                .WithOne(u => u.Profile)
                .HasForeignKey<UserProfile>(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(p => p.UserId).IsUnique();

            builder.Property(p => p.DisplayName).IsRequired().HasMaxLength(50);

            builder.Property(p => p.Bio).HasMaxLength(500);
            builder.Property(p => p.Occupation).HasMaxLength(100);
            builder.Property(p => p.Company).HasMaxLength(100);
            builder.Property(p => p.School).HasMaxLength(100);
            builder.Property(p => p.InstagramHandle).HasMaxLength(30);
            builder.Property(p => p.SpotifyHandle).HasMaxLength(50);

            builder.OwnsOne(p => p.Location, location =>
            {
                location.Property(l => l.Latitude).HasColumnName("Latitude");
                location.Property(l => l.Longitude).HasColumnName("Longitude");
            });

            builder.Ignore(p => p.Age);
            builder.Ignore(p => p.Zodiac);

            builder.HasIndex(p => new { p.Gender, p.DateOfBirth });
            builder.HasIndex(p => p.LastActiveAt);
        }
    }
}
