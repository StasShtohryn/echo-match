namespace EchoMatch.Application.Common.Models
{
    public record DiscoveryCandidate(Guid Id, double? Latitude, double? Longitude, int? MaxDistanceKm);
}