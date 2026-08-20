

using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class UserLanguageConfiguration : IEntityTypeConfiguration<UserLanguage>
    {
        public void Configure(EntityTypeBuilder<UserLanguage> builder)
        {
            builder.ToTable("UserLanguages");

            builder.HasKey(ul => new { ul.UserProfileId, ul.LanguageId });

            builder.HasOne(ul => ul.UserProfile)
                .WithMany(profile => profile.Languages)
                .HasForeignKey(ul => ul.UserProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(ul => ul.Language)
                .WithMany(l => l.UserLanguages)
                .HasForeignKey(ul => ul.LanguageId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(ul => !ul.UserProfile.IsDeleted);
        }
    }
}
