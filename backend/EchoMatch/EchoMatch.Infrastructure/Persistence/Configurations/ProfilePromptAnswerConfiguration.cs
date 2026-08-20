

using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class ProfilePromptAnswerConfiguration : IEntityTypeConfiguration<ProfilePromptAnswer>
    {
        public void Configure(EntityTypeBuilder<ProfilePromptAnswer> builder)
        {
            builder.ToTable("ProfilePromptAnswers");

            builder.HasKey(a => a.Id);

            builder.HasOne(a => a.UserProfile)
                .WithMany(profile => profile.PromptAnswers)
                .HasForeignKey(a => a.UserProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(a => a.ProfilePrompt)
                .WithMany(p => p.Answers)
                .HasForeignKey(a => a.ProfilePromptId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Property(a => a.Answer).IsRequired().HasMaxLength(300);

            builder.HasIndex(a => new { a.UserProfileId, a.ProfilePromptId }).IsUnique();
        }
    }
}
