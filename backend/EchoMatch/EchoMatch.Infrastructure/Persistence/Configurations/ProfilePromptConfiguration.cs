

using EchoMatch.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EchoMatch.Infrastructure.Persistence.Configurations
{
    public class ProfilePromptConfiguration : IEntityTypeConfiguration<ProfilePrompt>
    {
        public void Configure(EntityTypeBuilder<ProfilePrompt> builder)
        {
            builder.ToTable("ProfilePrompts");

            builder.HasKey(p => p.Id);

            builder.Property(i => i.Code).IsRequired().HasMaxLength(50);
            builder.HasIndex(i => i.Code).IsUnique();

            builder.Property(p => p.Question).IsRequired().HasMaxLength(150);
            builder.HasIndex(p => p.Question).IsUnique();


            builder.HasData(
                new ProfilePrompt { Id = 1, Code = "key_to_my_heart", Question = "Ключ до мого серця…" },
                new ProfilePrompt { Id = 2, Code = "simple_pleasures", Question = "Мої прості радощі…" },
                new ProfilePrompt { Id = 3, Code = "win_me_over", Question = "Найкращий спосіб мене підкорити…" },
                new ProfilePrompt { Id = 4, Code = "looking_for", Question = "Я шукаю…" },
                new ProfilePrompt { Id = 5, Code = "bucket_list_first", Question = "Перший пункт у моєму списку мрій…" },
                new ProfilePrompt { Id = 6, Code = "controversial_opinion", Question = "Моя найсуперечливіша думка…" },
                new ProfilePrompt { Id = 7, Code = "geek_out", Question = "Можу говорити годинами про…" },
                new ProfilePrompt { Id = 8, Code = "typical_sunday", Question = "Моя типова неділя…" },
                new ProfilePrompt { Id = 9, Code = "first_date_wishlist", Question = "Ідеальне перше побачення…" },
                new ProfilePrompt { Id = 10, Code = "two_truths_and_a_lie", Question = "Дві правди і брехня" },
                new ProfilePrompt { Id = 11, Code = "talking_to_my_pet", Question = "Розповідаю своєму улюбленцю про…" },
                new ProfilePrompt { Id = 12, Code = "why_hasnt_someone_invented", Question = "Чому досі ніхто не винайшов…" },
                new ProfilePrompt { Id = 13, Code = "same_type_of_weird", Question = "Ми однаково дивні, якщо…" },
                new ProfilePrompt { Id = 14, Code = "hot_take", Question = "Неочевидна думка…" },
                new ProfilePrompt { Id = 15, Code = "hoping_you", Question = "Сподіваюся, що ти…" },
                new ProfilePrompt { Id = 16, Code = "dating_me_is_like", Question = "Зустрічатися зі мною — це як…" });
            }
    }
}
