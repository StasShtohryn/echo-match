using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Messages.SendMessage
{
    // Тіло запиту: сам метч приходить з маршруту
    public record SendMessageRequest(string? Text);

    public record SendMessageCommand(Guid MatchId, string? Text) : ICommand<MessageDto>;
}