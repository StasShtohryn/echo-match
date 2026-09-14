
using EchoMatch.Domain.Enums;

namespace EchoMatch.Application.Common.Dtos
{
    public record DiscoveryPreferencesDto(
        InterestedIn ShowMe,
        int MinAge,
        int MaxAge,
        int? MaxDistanceKm);
}
