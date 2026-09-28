using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class MessageConfiguration : IEntityTypeConfiguration<Message>
    {
        public void Configure(EntityTypeBuilder<Message> builder)
        {
            builder.ToTable("Messages");

            // Ключ лишається ключем, але фізичний порядок рядків задає не він:
            // випадковий Guid клав би кожне нове повідомлення в середину таблиці
            builder.HasKey(m => m.Id)
                .IsClustered(false);

            builder.Property(m => m.Sequence)
                .ValueGeneratedOnAdd();

            builder.Property(m => m.Text)
                .IsRequired()
                .HasMaxLength(Message.MaxTextLength);

            builder.HasOne(m => m.Match)
                .WithMany()
                .HasForeignKey(m => m.MatchId)
                .OnDelete(DeleteBehavior.Cascade);

            // Автора не можна видалити, доки лишилось його повідомлення:
            // профілі в нас і так лише позначаються видаленими
            builder.HasOne(m => m.SenderProfile)
                .WithMany()
                .HasForeignKey(m => m.SenderProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            // Повідомлення однієї розмови лежать фізично поруч і в порядку
            // надсилання — рівно так, як їх читають. Пара унікальна, тож SQL
            // Server не дописує прихований лічильник. Фільтра тут бути не може:
            // кластерний індекс — це сама таблиця, він містить усі рядки
            builder.HasIndex(m => new { m.MatchId, m.Sequence })
                .IsUnique()
                .IsClustered();
        }
    }
}