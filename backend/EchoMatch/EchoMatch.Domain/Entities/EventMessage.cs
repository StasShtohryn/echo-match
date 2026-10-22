using EchoMatch.Domain.Common;

namespace EchoMatch.Domain.Entities
{
    // Окремо від Message: та прив'язана до метчу обов'язковим ключем і
    // кластерним індексом, а переробляти найактивнішу таблицю заради іншого
    // виду розмови означало б чіпати кожен наявний запит чату
    public class EventMessage : BaseEntity
    {
        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;

        public Guid SenderProfileId { get; set; }
        public UserProfile SenderProfile { get; set; } = null!;

        // Обмеження довжини спільне з Message.MaxTextLength
        public string Text { get; set; } = string.Empty;

        // Курсор для гортання, як Message.Sequence
        public long Sequence { get; private set; }
    }
}