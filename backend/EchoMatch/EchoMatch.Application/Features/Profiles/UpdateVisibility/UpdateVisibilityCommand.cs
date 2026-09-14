using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Profiles.UpdateVisibility
{
    // Nullable навмисно: пропущене поле інакше стало б false
    // і мовчки відкрило б прихований профіль.
    public record UpdateVisibilityCommand(bool? IsPrivate) : ICommand<Unit>;
}