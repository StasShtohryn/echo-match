using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Events.GetParticipants
{
    public record GetEventParticipantsQuery(Guid EventId) : IQuery<IReadOnlyList<EventParticipantDto>>;
}