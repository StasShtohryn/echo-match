using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Common.Dtos
{
    // Живі оновлення подій. Як і в чаті метчу, кожна подія — один об'єкт, і
    // IsMine тут немає: адресатів кілька, тож «моє чи чуже» кожен клієнт
    // визначає сам за ProfileId
    public record EventMessageReceivedEvent(
        Guid EventId,
        Guid Id,
        long Sequence,
        EventMessageSenderDto Sender,
        string Text,
        DateTime SentAt);

    public record EventMessagesReadEvent(Guid EventId, Guid ReaderProfileId, DateTime ReadAt);

    public record EventTypingEvent(Guid EventId, Guid ProfileId, string DisplayName);

    public record EventParticipantJoinedEvent(Guid EventId, Guid ProfileId, string DisplayName, string? MainPhotoUrl);

    // Вийшов сам або його прибрав організатор; клієнт того, кого прибрали,
    // за своїм ProfileId розуміє, що чат треба закрити
    public record EventParticipantLeftEvent(Guid EventId, Guid ProfileId);

    public record EventJoinRequestedEvent(Guid EventId, Guid ProfileId, string DisplayName);

    // Status — Approved або Rejected
    public record EventRequestDecidedEvent(Guid EventId, EventParticipantStatus Status);

    public record EventCancelledEvent(Guid EventId);
}