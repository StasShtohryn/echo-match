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

            // Порядок — за останньою активністю, а не за датою метчу: це список
            // чатів, і розмова, у якій щойно написали, має бути зверху.
            // Сортування в пам'яті, бо список усіх метчів людини й так невеликий
            return matches
                .OrderByDescending(m => m.LastMessageSentAt ?? m.CreatedAt)
                .ThenByDescending(m => m.CreatedAt)
                .Select(m => new MatchDto(
                    m.Id,
                    DateTime.SpecifyKind(m.CreatedAt, DateTimeKind.Utc),
                    m.MySeenAt is null,
                    new MatchPartnerDto(
                        m.PartnerProfileId,
                        m.PartnerName,
                        UserProfile.AgeOn(m.PartnerBirthDate, today),
                        m.PartnerPhotoUrl),
                    m.LastMessageText is null || m.LastMessageSentAt is null
                        ? null
                        : new MatchLastMessageDto(
                            m.LastMessageText,
                            DateTime.SpecifyKind(m.LastMessageSentAt.Value, DateTimeKind.Utc),
                            m.LastMessageSenderProfileId == myProfileId),
                    m.UnreadCount))
                .ToList();

        }
    }
}