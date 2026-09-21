using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using MediatR;

namespace EchoMatch.Application.Features.Matches.GetMatches
{
    public class GetMatchesQueryHandler : IRequestHandler<GetMatchesQuery, IReadOnlyList<MatchDto>>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetMatchesQueryHandler(
            IProfileRepository profileRepository,
            IMatchRepository matchRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _matchRepository = matchRepository;
            _currentUserService = currentUserService;
        }

        public async Task<IReadOnlyList<MatchDto>> Handle(GetMatchesQuery request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var matches = await _matchRepository.GetForProfileAsync(myProfileId, cancellationToken);
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            return matches
                .Select(m => new MatchDto(
                    m.Id,
                    DateTime.SpecifyKind(m.CreatedAt, DateTimeKind.Utc),
                    m.MySeenAt is null,
                    new MatchPartnerDto(
                        m.PartnerProfileId,
                        m.PartnerName,
                        UserProfile.AgeOn(m.PartnerBirthDate, today),
                        m.PartnerPhotoUrl)))
                .ToList();
        }
    }
}