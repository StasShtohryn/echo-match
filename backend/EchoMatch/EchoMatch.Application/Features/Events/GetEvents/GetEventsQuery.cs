using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Events.GetEvents
{
    public record GetEventsQuery(
        int? CategoryId,
        string? City,
        string? Search,
        DateTime? From,
        DateTime? To,
        int Page,
        int Limit) : IQuery<EventsPageDto>;
}