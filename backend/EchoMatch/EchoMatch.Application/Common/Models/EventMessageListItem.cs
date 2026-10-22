namespace EchoMatch.Application.Common.Models
{
    // Автор указаний повністю: людей у розмові більше двох, і клієнт без
    // імені й фото не покаже, хто що написав
    public record EventMessageListItem(
        Guid Id,
        long Sequence,
        Guid SenderProfileId,
        string SenderName,
        string? SenderPhotoUrl,
        string Text,
        DateTime SentAt);
}