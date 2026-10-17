using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Events.RemoveParticipant
{
    public record RemoveParticipantCommand(Guid EventId, Guid ProfileId) : ICommand<Unit>;
}