using EchoMatch.Domain.Common;

namespace EchoMatch.Domain.Entities
{
    public class Message : BaseEntity
    {
        public const int MaxTextLength = 2000;

        // Розмова — це сам метч: без метчу писати нікому, а після розриву
        // листування перестає бути доступним разом із ним
        public Guid MatchId { get; set; }
        public Match Match { get; set; } = null!;

        // Зберігається лише автор: другий учасник завжди обчислюється з метчу
        public Guid SenderProfileId { get; set; }
        public UserProfile SenderProfile { get; set; } = null!;

        public string Text { get; set; } = string.Empty;

        // Наскрізний номер, який проставляє база. Гортати історію за часом не
        // можна: годинник має крок близько 15 мс, тож два повідомлення легко
        // отримують однаковий CreatedAt і курсор або губить їх, або застрягає
        public long Sequence { get; private set; }

    }
}