using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Matches.Unmatch
{
    public record UnmatchCommand(Guid MatchId) : ICommand<Unit>;
}