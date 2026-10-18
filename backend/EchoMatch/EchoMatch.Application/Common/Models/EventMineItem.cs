namespace EchoMatch.Application.Common.Models
{
    // Подія з «моїх»: картка, моя участь і стан чату для мене.
    // JoinedAt — коли я записався чи подав заявку
    public record EventMineItem(
        EventListItem Card,
        DateTime? CancelledAt,
        DateTime JoinedAt,
        string? LastMessageText,
        DateTime? LastMessageSentAt,
        Guid? LastMessageSenderProfileId,
        string? LastMessageSenderName,
        int UnreadCount);
}