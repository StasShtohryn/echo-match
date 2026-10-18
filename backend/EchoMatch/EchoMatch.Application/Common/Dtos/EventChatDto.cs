using System.Diagnostics.CodeAnalysis;

namespace EchoMatch.Application.Common.Dtos
{
    public record EventMessageSenderDto(Guid ProfileId, string DisplayName, string? MainPhotoUrl);

    public record EventMessageDto(
        Guid Id,
        long Sequence,
        EventMessageSenderDto Sender,
        bool IsMine,
        string Text,
        DateTime SentAt);

    // Позначки всіх прийнятих учасників, крім мене. Одна галочка в групі нічого
    // не означає, тому клієнт сам рахує, скільки людей дочитали до повідомлення:
    // тих, чия позначка не раніша за його SentAt
    public record EventReadMarkDto(Guid ProfileId, DateTime? LastReadAt);

    public record EventMessagePageDto(IReadOnlyList<EventMessageDto> Items, IReadOnlyList<EventReadMarkDto> ReadMarks);

    public record EventLastMessageDto(string Text, DateTime SentAt, string SenderDisplayName, bool IsMine);

    // Подія в моєму списку: картка плюс стан чату. Для заявки, що ще чекає
    // рішення, чат закритий, тож LastMessage порожній, а UnreadCount — нуль
    public record EventMineDto : EventCardDto
    {
        [SetsRequiredMembers]
        public EventMineDto(EventCardDto card) : base(card)
        {
        }

        public DateTime? CancelledAt { get; init; }
        public EventLastMessageDto? LastMessage { get; init; }
        public int UnreadCount { get; init; }
    }
}