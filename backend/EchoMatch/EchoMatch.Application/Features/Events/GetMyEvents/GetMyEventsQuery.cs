using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Events.GetMyEvents
{
    public record GetMyEventsQuery : IQuery<IReadOnlyList<EventMineDto>>;
}