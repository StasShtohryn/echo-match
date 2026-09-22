using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Matches.GetMatches
{
    public record GetMatchesQuery : IQuery<IReadOnlyList<MatchDto>>;
}