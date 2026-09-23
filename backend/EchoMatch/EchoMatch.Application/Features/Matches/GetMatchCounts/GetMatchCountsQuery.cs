using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Matches.GetMatchCounts
{
    public record GetMatchCountsQuery : IQuery<MatchCountsDto>;
}