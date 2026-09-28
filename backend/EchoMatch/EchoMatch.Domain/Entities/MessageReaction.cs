using EchoMatch.Domain.Common;
using EchoMatch.Domain.Enums;

namespace EchoMatch.Domain.Entities
{
    public class MessageReaction : BaseEntity
    {
        public Guid MessageId { get; set; }
        public Message Message { get; set; } = null!;

        public Guid ProfileId { get; set; }
        public UserProfile Profile { get; set; } = null!;

        public ReactionType Type { get; set; }

        // Зняття реакції, як і скасування свайпу: рядок лишається, але перестає
        // враховуватись, і фільтрований унікальний індекс звільняє пару
        public void Remove(DateTime utcNow)
        {
            IsDeleted = true;
            DeletedAt = utcNow;
        }
    }
}