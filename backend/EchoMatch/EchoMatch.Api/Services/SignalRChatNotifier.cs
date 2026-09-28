using EchoMatch.Api.Hubs;
using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace EchoMatch.Api.Services
{
    public class SignalRChatNotifier : IChatNotifier
    {
        private readonly IHubContext<ChatHub> _hub;

        public SignalRChatNotifier(IHubContext<ChatHub> hub)
        {
            _hub = hub;
        }

        public Task MessageSentAsync(ChatMessageEvent message, CancellationToken cancellationToken)
        {
            // Автор теж у групі: його інші пристрої так синхронізуються, а клієнт
            // відкидає повідомлення, яке вже має, за id
            return _hub.Clients
                .Group(ChatHub.GroupFor(message.MatchId))
                .SendAsync("MessageReceived", message, cancellationToken);
        }

        public Task MessagesReadAsync(ChatReadEvent read, CancellationToken cancellationToken)
        {
            return _hub.Clients
                .Group(ChatHub.GroupFor(read.MatchId))
                .SendAsync("MessagesRead", read, cancellationToken);
        }

        public Task ReactionChangedAsync(ChatReactionEvent reaction, CancellationToken cancellationToken)
        {
            return _hub.Clients
                .Group(ChatHub.GroupFor(reaction.MatchId))
                .SendAsync("ReactionChanged", reaction, cancellationToken);
        }
    }
}