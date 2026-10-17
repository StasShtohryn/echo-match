using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class EventParticipantConfiguration : IEntityTypeConfiguration<EventParticipant>
    {
        public void Configure(EntityTypeBuilder<EventParticipant> builder)
        {
            builder.ToTable("EventParticipants");

            builder.HasKey(p => p.Id);

            // Без події участь не має сенсу
            builder.HasOne(p => p.Event)
                .WithMany(e => e.Participants)
                .HasForeignKey(p => p.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(p => p.Profile)
                .WithMany()
                .HasForeignKey(p => p.ProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            // Одна чинна участь на пару «подія — людина». Хто вийшов, звільняє
            // пару; відхилений лишається чинним рядком і пару тримає
            builder.HasIndex(p => new { p.EventId, p.ProfileId })
                .IsUnique()
                .HasFilter("[IsDeleted] = 0");
        }
    }
}