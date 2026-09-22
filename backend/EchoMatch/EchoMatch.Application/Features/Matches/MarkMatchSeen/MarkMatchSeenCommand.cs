using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Matches.MarkMatchSeen
{
    public record MarkMatchSeenCommand(Guid MatchId) : ICommand<Unit>;
}