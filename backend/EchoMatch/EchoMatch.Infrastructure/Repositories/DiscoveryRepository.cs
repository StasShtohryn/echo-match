using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Enums;
using EchoMatch.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace EchoMatch.Infrastructure.Repositories
{
    public class DiscoveryRepository : IDiscoveryRepository
    {
        private readonly AppDbContext _context;

        public DiscoveryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<DiscoveryCandidate>> FindCandidatesAsync(
            DiscoveryCriteria criteria,
            int take,
            CancellationToken cancellationToken)
        {
            var viewerId = criteria.ViewerProfileId;
            var acceptedGenders = criteria.AcceptedGenders;
            var showMeAcceptingViewer = criteria.ShowMeAcceptingViewer;
            var earliestBirthDate = criteria.EarliestBirthDate;
            var latestBirthDate = criteria.LatestBirthDate;
            var viewerAge = criteria.ViewerAge;
            var viewerHasLocation = criteria.ViewerHasLocation;
            var swipeCutoff = criteria.SwipeCutoff;

            var query = _context.UserProfiles
                .AsNoTracking()
                .Where(p => p.Id != viewerId)
                .Where(p => !p.IsPrivate && p.Photos.Any() && p.Preferences != null)
                .Where(p => acceptedGenders.Contains(p.Gender))
                .Where(p => showMeAcceptingViewer.Contains(p.Preferences!.ShowMe))
                .Where(p => p.DateOfBirth >= earliestBirthDate && p.DateOfBirth <= latestBirthDate)
                .Where(p => p.Preferences!.MinAge <= viewerAge && p.Preferences!.MaxAge >= viewerAge)
                .Where(p => p.Preferences!.MaxDistanceKm == null || (viewerHasLocation && p.Location != null))
                .Where(p => !_context.Swipes.Any(s =>
                    s.SwiperProfileId == viewerId
                    && s.TargetProfileId == p.Id
                    && (s.Direction == SwipeDirection.Like || s.DecidedAt > swipeCutoff)));

            if (criteria.Bounds is { } bounds)
            {
                query = query.Where(p => p.Location != null
                    && p.Location.Latitude >= bounds.MinLatitude
                    && p.Location.Latitude <= bounds.MaxLatitude
                    && p.Location.Longitude >= bounds.MinLongitude
                    && p.Location.Longitude <= bounds.MaxLongitude);
            }

            return await query
                .OrderBy(p => Guid.NewGuid())
                .Take(take)
                .Select(p => new DiscoveryCandidate(
                    p.Id,
                    p.Location != null ? (double?)p.Location.Latitude : null,
                    p.Location != null ? (double?)p.Location.Longitude : null,
                    p.Preferences!.MaxDistanceKm))
                .ToListAsync(cancellationToken);
        }
    }
}