using EchoMatch.Api.Hubs;
using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace EchoMatch.Api.Services
{
    // Події адресуються людям, а не групі SignalR: група тримала б вигнаного
    // учасника підписаним, доки він не перепідключиться, і він далі отримував
    // би чат, з якого його щойно прибрали. Список адресатів щоразу свіжий
    public class SignalREventNotifier : IEventNotifier
    {
        private readonly IHubContext<ChatHub> _hub;

        public SignalREventNotifier(IHubContext<ChatHub> hub)
        {
            _hub = hub;
        }

        public Task MessageSentAsync(
            IReadOnlyCollection<Guid> userIds,
            EventMessageReceivedEvent message,
            CancellationToken cancellationToken) =>
            SendToUsersAsync(userIds, "EventMessageReceived", message, cancellationToken);

        public Task MessagesReadAsync(
            IReadOnlyCollection<Guid> userIds,
            EventMessagesReadEvent read,
            CancellationToken cancellationToken) =>
            SendToUsersAsync(userIds, "EventMessagesRead", read, cancellationToken);

        public Task ParticipantJoinedAsync(
            IReadOnlyCollection<Guid> userIds,
            EventParticipantJoinedEvent joined,
            CancellationToken cancellationToken) =>
            SendToUsersAsync(userIds, "EventParticipantJoined", joined, cancellationToken);

        public Task ParticipantLeftAsync(
            IReadOnlyCollection<Guid> userIds,
            EventParticipantLeftEvent left,
            CancellationToken cancellationToken) =>
            SendToUsersAsync(userIds, "EventParticipantLeft", left, cancellationToken);

        public Task JoinRequestedAsync(
            Guid organizerUserId,
            EventJoinRequestedEvent request,
            CancellationToken cancellationToken) =>
            SendToUsersAsync([organizerUserId], "EventJoinRequested", request, cancellationToken);

        public Task RequestDecidedAsync(
            Guid requesterUserId,
            EventRequestDecidedEvent decision,
            CancellationToken cancellationToken) =>
            SendToUsersAsync([requesterUserId], "EventRequestDecided", decision, cancellationToken);

        public Task CancelledAsync(
            IReadOnlyCollection<Guid> userIds,
            EventCancelledEvent cancelled,
            CancellationToken cancellationToken) =>
            SendToUsersAsync(userIds, "EventCancelled", cancelled, cancellationToken);

        // SignalR знаходить з'єднання користувача за claim NameIdentifier
        // з токена, тобто за Id користувача, а не профілю
        private Task SendToUsersAsync(
            IReadOnlyCollection<Guid> userIds,
            string method,
            object payload,
            CancellationToken cancellationToken)
        {
            if (userIds.Count == 0)
            {
                return Task.CompletedTask;
            }

            return _hub.Clients
                .Users(userIds.Select(id => id.ToString()).Distinct().ToList())
                .SendAsync(method, payload, cancellationToken);
        }
    }
}