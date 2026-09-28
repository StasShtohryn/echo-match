using EchoMatch.Application.Common.Dtos;

namespace EchoMatch.Application.Common.Interfaces
{
    // Живі повідомлення лишаються деталлю доставки: Application знає лише, що
    // про подію треба сповістити, і нічого не знає про SignalR
    public interface IChatNotifier
    {
        Task MessageSentAsync(ChatMessageEvent message, CancellationToken cancellationToken);

        Task MessagesReadAsync(ChatReadEvent read, CancellationToken cancellationToken);
        Task ReactionChangedAsync(ChatReactionEvent reaction, CancellationToken cancellationToken);
    }
}