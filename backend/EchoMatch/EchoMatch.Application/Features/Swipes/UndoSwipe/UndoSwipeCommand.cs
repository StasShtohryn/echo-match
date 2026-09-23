using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Swipes.UndoSwipe
{
    public record UndoSwipeCommand(Guid TargetProfileId) : ICommand<Unit>;
}