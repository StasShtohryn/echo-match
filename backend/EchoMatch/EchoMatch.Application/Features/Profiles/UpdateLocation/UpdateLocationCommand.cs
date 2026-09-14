using EchoMatch.Application.Common.Messaging;
using MediatR;

namespace EchoMatch.Application.Features.Profiles.UpdateLocation
{
    // Nullable навмисно: пропущене поле інакше стало б 0, а (0, 0) — реальна
    // точка в Гвінейській затоці, яку валідатор не відрізнив би від справжньої.
    public record UpdateLocationCommand(double? Latitude, double? Longitude) : ICommand<Unit>;
}