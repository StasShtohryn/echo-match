using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Events.RejectJoinRequest
{
    public record RejectJoinRequestCommand(Guid EventId, Guid ProfileId) : ICommand<Unit>;
}