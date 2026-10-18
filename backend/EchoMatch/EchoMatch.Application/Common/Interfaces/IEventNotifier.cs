using EchoMatch.Application.Common.Dtos;

namespace EchoMatch.Application.Common.Interfaces
{
    // Кому адресувати, вирішує хендлер: це правило доступу (заявник не бачить
    // чату, вигнаний більше не отримує повідомлень), а не деталь доставки.
    // Адресати — Id користувачів, бо саме за ними SignalR знаходить з'єднання
    public interface IEventNotifier
    {
        Task MessageSentAsync(
            IReadOnlyCollection<Guid> userIds,
            EventMessageReceivedEvent message,
            CancellationToken cancellationToken);

        Task MessagesReadAsync(
            IReadOnlyCollection<Guid> userIds,
            EventMessagesReadEvent read,
            CancellationToken cancellationToken);

        Task ParticipantJoinedAsync(
            IReadOnlyCollection<Guid> userIds,
            EventParticipantJoinedEvent joined,
            CancellationToken cancellationToken);

        Task ParticipantLeftAsync(
            IReadOnlyCollection<Guid> userIds,
            EventParticipantLeftEvent left,
            CancellationToken cancellationToken);

        Task JoinRequestedAsync(
            Guid organizerUserId,
            EventJoinRequestedEvent request,
            CancellationToken cancellationToken);

        Task RequestDecidedAsync(
            Guid requesterUserId,
            EventRequestDecidedEvent decision,
            CancellationToken cancellationToken);

        Task CancelledAsync(
            IReadOnlyCollection<Guid> userIds,
            EventCancelledEvent cancelled,
            CancellationToken cancellationToken);
    }
}