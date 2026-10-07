using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Matches.GetCompatibility
{
    public record GetMatchCompatibilityQuery(Guid MatchId) : IQuery<MatchCompatibilityDto>;
}