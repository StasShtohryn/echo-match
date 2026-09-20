using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Discovery.GetFeed
{
    public record GetDiscoveryFeedQuery(int Limit) : IQuery<DiscoveryFeedDto>;
}