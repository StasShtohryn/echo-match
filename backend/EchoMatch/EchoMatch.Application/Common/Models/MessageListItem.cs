using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Common.Models
{
    // Повідомлення очима одного з учасників: реакції вже розведені на «мою»
    // й «чужу», бо в розмові двох людей їх більше двох бути не може
    public record MessageListItem(
        Guid Id,
        long Sequence,
        Guid SenderProfileId,
        string Text,
        DateTime SentAt,
        ReactionType? MyReaction,
        ReactionType? PartnerReaction);
}