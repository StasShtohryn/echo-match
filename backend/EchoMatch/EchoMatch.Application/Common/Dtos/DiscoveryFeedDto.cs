namespace EchoMatch.Application.Common.Dtos
{
    public enum DiscoveryStatus
    {
        Ready,
        NoCandidates,
        ProfileHidden,
        PhotoRequired,
        PreferencesRequired,
        LocationRequired
    }

    public record DiscoveryCandidateDto(PublicProfileDto Profile, int? DistanceKm);

    public record DiscoveryFeedDto(DiscoveryStatus Status, IReadOnlyList<DiscoveryCandidateDto> Candidates)
    {
        public static DiscoveryFeedDto Empty(DiscoveryStatus status) => new(status, []);
    }
}