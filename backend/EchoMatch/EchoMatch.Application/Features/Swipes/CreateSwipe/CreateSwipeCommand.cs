using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Features.Swipes.CreateSwipe
{
    // Direction nullable, TargetProfileId — ні: Guid.Empty ніколи не є
    // допустимим ідентифікатором, а Like — цілком допустимий напрям.
    public record CreateSwipeCommand(
        Guid TargetProfileId,
        SwipeDirection? Direction) : ICommand<SwipeResultDto>;
}