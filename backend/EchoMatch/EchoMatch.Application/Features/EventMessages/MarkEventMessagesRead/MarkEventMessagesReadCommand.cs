using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.EventMessages.MarkEventMessagesRead
{
    public record MarkEventMessagesReadCommand(Guid EventId) : ICommand<Unit>;
}