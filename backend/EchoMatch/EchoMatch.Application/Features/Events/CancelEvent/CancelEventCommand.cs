using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Events.CancelEvent
{
    public record CancelEventCommand(Guid EventId) : ICommand<Unit>;
}