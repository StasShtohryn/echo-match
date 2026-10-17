using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Events.ApproveJoinRequest
{
    public record ApproveJoinRequestCommand(Guid EventId, Guid ProfileId) : ICommand<Unit>;
}