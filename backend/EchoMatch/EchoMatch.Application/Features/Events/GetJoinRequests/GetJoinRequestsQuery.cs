using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Events.GetJoinRequests
{
    public record GetJoinRequestsQuery(Guid EventId) : IQuery<IReadOnlyList<EventJoinRequestDto>>;
}