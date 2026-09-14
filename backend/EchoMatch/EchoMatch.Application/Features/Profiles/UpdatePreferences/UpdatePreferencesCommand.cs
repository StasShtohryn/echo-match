using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Messaging;
using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Features.Profiles.UpdatePreferences
{
    // ShowMe nullable навмисно: пропущене в JSON поле інакше стало б Men,
    // першим значенням енума, і відрізнити «не надіслав» від «обрав» було б неможливо.
    public record UpdatePreferencesCommand(
        InterestedIn? ShowMe,
        int MinAge,
        int MaxAge,
        int? MaxDistanceKm) : ICommand<DiscoveryPreferencesDto>;
}