using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using EchoMatch.Application.Common.Validation;

namespace EchoMatch.Application.Features.EventMessages.SendEventMessage
{
    // Тіло запиту: подія приходить з маршруту
    public record SendEventMessageRequest(string? Text);

    public record SendEventMessageCommand(Guid EventId, string? Text) : ICommand<EventMessageDto>, IMessageText;
}