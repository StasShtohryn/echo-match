using EchoMatch.Domain.Enums;
using EchoMatch.Domain.ValueObjects;

namespace EchoMatch.Application.Common.Models
{
    public record DiscoveryCriteria(
        Guid ViewerProfileId,
        IReadOnlyList<Gender> AcceptedGenders,
        IReadOnlyList<InterestedIn> ShowMeAcceptingViewer,
        DateOnly EarliestBirthDate,
        DateOnly LatestBirthDate,
        int ViewerAge,
        bool ViewerHasLocation,
        GeoBounds? Bounds,
        DateTime SwipeCutoff);
}