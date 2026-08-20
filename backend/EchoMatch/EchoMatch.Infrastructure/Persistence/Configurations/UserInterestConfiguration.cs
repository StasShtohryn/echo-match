using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class UserInterestConfiguration : IEntityTypeConfiguration<UserInterest>
    {
        public void Configure(EntityTypeBuilder<UserInterest> builder)
        {
            builder.ToTable("UserInterests");

            builder.HasKey(ui => new { ui.UserProfileId, ui.InterestId });

            builder.HasOne(ui => ui.UserProfile)
                .WithMany(profile => profile.Interests)
                .HasForeignKey(ui => ui.UserProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ui => ui.Interest)
                .WithMany(i => i.UserInterests)
                .HasForeignKey(ui => ui.InterestId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(ui => !ui.UserProfile.IsDeleted);
        }
    }
}
