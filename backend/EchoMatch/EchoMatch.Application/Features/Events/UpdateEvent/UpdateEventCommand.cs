using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using EchoMatch.Application.Features.Events.Common;
using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Features.Events.UpdateEvent
{
    // Тіло запиту: подія приходить з маршруту
    public record UpdateEventRequest(
        string Title,
        string? Description,
        int CategoryId,
        DateTime StartsAt,
        DateTime? EndsAt,
        string City,
        string? PlaceName,
        int? Capacity,
        EventJoinPolicy? JoinPolicy);

    public record UpdateEventCommand(
        Guid EventId,
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