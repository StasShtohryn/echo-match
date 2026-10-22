using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using EchoMatch.Application.Features.Events.Common;
using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Features.Events.CreateEvent
{
    public record CreateEventCommand(
        string Title,
        string? Description,
        int CategoryId,
        DateTime StartsAt,
        DateTime? EndsAt,
        string City,
        string? PlaceName,
        int? Capacity,
        EventJoinPolicy? JoinPolicy) : ICommand<EventDetailsDto>, IEventFields;
}