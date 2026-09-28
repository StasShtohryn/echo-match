using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Common.Dtos
{
    // Sequence — курсор для гортання історії, клієнт передає його як before.
    // Реакції розведені на «мою» й «чужу»: у розмові двох людей їх більше
    // двох бути не може, і клієнту не треба нічого зіставляти самому
    public record MessageDto(
        Guid Id,
        long Sequence,
        Guid SenderProfileId,
        bool IsMine,
        string Text,
        DateTime SentAt,
        ReactionType? MyReaction,
        ReactionType? PartnerReaction);

    // PartnerLastReadAt дає клієнту галочки: повідомлення прочитане, якщо його
    // SentAt не пізніший за цю позначку
    public record MessagePageDto(IReadOnlyList<MessageDto> Items, DateTime? PartnerLastReadAt);
}