using EchoMatch.Application.Common.Dtos;
using EchoMatch.Domain.ValueObjects;

namespace EchoMatch.Application.Common.Mappings
{
    public static class DiscoveryPreferencesMappings
    {
        public static DiscoveryPreferencesDto ToDto(this DiscoveryPreferences preferences) => new(
            preferences.ShowMe,
            preferences.MinAge,
            preferences.MaxAge,
            preferences.MaxDistanceKm);
    }
}