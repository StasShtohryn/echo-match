using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class MessageReactionConfiguration : IEntityTypeConfiguration<MessageReaction>
    {
        public void Configure(EntityTypeBuilder<MessageReaction> builder)
        {
            builder.ToTable("MessageReactions");

            builder.HasKey(r => r.Id);

            builder.HasOne(r => r.Message)
                .WithMany()
                .HasForeignKey(r => r.MessageId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(r => r.Profile)
                .WithMany()
                .HasForeignKey(r => r.ProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            // Одна чинна реакція на пару «повідомлення — людина»: заміна оновлює
            // рядок, зняття позначає видаленим і звільняє пару для нової
            builder.HasIndex(r => new { r.MessageId, r.ProfileId })
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");
        }
    }
}