using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Messages.RemoveReaction
{
    public record RemoveReactionCommand(Guid MatchId, Guid MessageId) : ICommand<Unit>;
}