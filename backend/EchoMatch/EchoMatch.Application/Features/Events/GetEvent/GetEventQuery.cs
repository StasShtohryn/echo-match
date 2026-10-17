using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Events.GetEvent
{
    public record GetEventQuery(Guid EventId) : IQuery<EventDetailsDto>;
}