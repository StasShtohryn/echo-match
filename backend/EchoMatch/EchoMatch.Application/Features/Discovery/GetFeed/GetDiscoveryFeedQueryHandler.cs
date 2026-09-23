using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Application.Common.Models;
using EchoMatch.Domain.Entities;
using EchoMatch.Domain.Enums;
using EchoMatch.Domain.ValueObjects;
using MediatR;

namespace EchoMatch.Application.Features.Discovery.GetFeed
{
    public class GetDiscoveryFeedQueryHandler : IRequestHandler<GetDiscoveryFeedQuery, DiscoveryFeedDto>
    {
        // Скільки кандидатів брати з бази на кожне місце в стрічці: частину
        // відсіє точна перевірка відстані, яку база не рахує
        private const int CandidatePoolFactor = 3;

        private readonly IProfileRepository _profileRepository;
        private readonly IDiscoveryRepository _discoveryRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetDiscoveryFeedQueryHandler(
            IProfileRepository profileRepository,
            IDiscoveryRepository discoveryRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _discoveryRepository = discoveryRepository;
            _currentUserService = currentUserService;
        }

        public async Task<DiscoveryFeedDto> Handle(GetDiscoveryFeedQuery request, CancellationToken cancellationToken)
        {
            var me = await _profileRepository
                .GetByUserIdWithPhotosAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            if (me.Readiness is not ProfileReadiness.Ready)
            {
                return DiscoveryFeedDto.Empty(me.Readiness switch
                {
                    ProfileReadiness.Hidden => DiscoveryStatus.ProfileHidden,
                    ProfileReadiness.PhotoRequired => DiscoveryStatus.PhotoRequired,
                    _ => DiscoveryStatus.PreferencesRequired
                });
            }

            var preferences = me.Preferences!;

            if (me.Location is null)
            {
                return DiscoveryFeedDto.Empty(DiscoveryStatus.LocationRequired);
            }

            var now = DateTime.UtcNow;
            var (earliest, latest) = preferences.BirthDateRange(DateOnly.FromDateTime(now));

            var criteria = new DiscoveryCriteria(
                me.Id,
                preferences.AcceptedGenders(),
                DiscoveryPreferences.ShowMeValuesAccepting(me.Gender),
                earliest,
                latest,
                me.Age,
                preferences.MaxDistanceKm is { } radiusKm ? me.Location.BoundingBox(radiusKm) : null,
                now - Swipe.DislikeExpiry);

            var found = await _discoveryRepository
                .FindCandidatesAsync(criteria, request.Limit * CandidatePoolFactor, cancellationToken);

            var picked = new List<(Guid Id, int? DistanceKm)>();

            foreach (var candidate in found)
            {
                double? distance = candidate.Latitude is not null
                    ? me.Location.DistanceKmTo(new GeoLocation(candidate.Latitude.Value, candidate.Longitude!.Value))
                    : null;

                var limit = preferences.EffectiveDistanceLimit(candidate.MaxDistanceKm);

                if (limit is not null && (distance is null || distance > limit))
                {
                    continue;
                }

                // Округлення вгору до кілометра: точна відстань разом із кількома
                // переміщеннями дозволяє вирахувати, де людина живе
                int? distanceKm = distance is null ? null : (int)Math.Max(1, Math.Ceiling(distance.Value));

                picked.Add((candidate.Id, distanceKm));

                if (picked.Count == request.Limit)
                {
                    break;
                }
            }

            if (picked.Count == 0)
            {
                return DiscoveryFeedDto.Empty(DiscoveryStatus.NoCandidates);
            }

            var profiles = (await _profileRepository
                    .GetManyWithDetailsAsync(picked.Select(p => p.Id).ToList(), cancellationToken))
                .ToDictionary(p => p.Id);

            var cards = new List<DiscoveryCandidateDto>(picked.Count);

            foreach (var (id, distanceKm) in picked)
            {
                if (profiles.TryGetValue(id, out var profile))
                {
                    cards.Add(new DiscoveryCandidateDto(profile.ToPublicProfileDto(), distanceKm));
                }
            }

            return cards.Count == 0
                ? DiscoveryFeedDto.Empty(DiscoveryStatus.NoCandidates)
                : new DiscoveryFeedDto(DiscoveryStatus.Ready, cards);
        }
    }
}