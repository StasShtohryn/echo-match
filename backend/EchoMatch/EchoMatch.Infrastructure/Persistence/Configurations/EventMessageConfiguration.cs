using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class EventMessageConfiguration : IEntityTypeConfiguration<EventMessage>
    {
        public void Configure(EntityTypeBuilder<EventMessage> builder)
        {
            builder.ToTable("EventMessages");

            // Та сама схема, що й у Messages: ключ не кластерний, а фізичний
            // порядок задає пара (EventId, Sequence)
            builder.HasKey(m => m.Id)
                .IsClustered(false);

            builder.Property(m => m.Sequence)
                .ValueGeneratedOnAdd();

            builder.Property(m => m.Text)
                .IsRequired()
                .HasMaxLength(Message.MaxTextLength);

            builder.HasOne(m => m.Event)
                .WithMany()
                .HasForeignKey(m => m.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(m => m.SenderProfile)
                .WithMany()
                .HasForeignKey(m => m.SenderProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(m => new { m.EventId, m.Sequence })
                .IsUnique()
                .IsClustered();
        }
    }
}