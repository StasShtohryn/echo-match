using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Messages.MarkMessagesRead
{
    public record MarkMessagesReadCommand(Guid MatchId) : ICommand<Unit>;
}