using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using MediatR;

namespace EchoMatch.Application.Features.Matches.GetMatchCounts
{
    public class GetMatchCountsQueryHandler : IRequestHandler<GetMatchCountsQuery, MatchCountsDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetMatchCountsQueryHandler(
            IProfileRepository profileRepository,
            IMatchRepository matchRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _matchRepository = matchRepository;
            _currentUserService = currentUserService;
        }

        public async Task<MatchCountsDto> Handle(GetMatchCountsQuery request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            return await _matchRepository.CountForProfileAsync(myProfileId, cancellationToken);
        }
    }
}