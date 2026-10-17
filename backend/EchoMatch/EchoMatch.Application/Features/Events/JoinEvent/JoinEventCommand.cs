using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;

namespace EchoMatch.Application.Features.Events.JoinEvent
{
    public record JoinEventCommand(Guid EventId) : ICommand<JoinEventResultDto>;
}