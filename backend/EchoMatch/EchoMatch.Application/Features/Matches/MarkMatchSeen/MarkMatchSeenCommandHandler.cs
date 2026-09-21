using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using MediatR;

namespace EchoMatch.Application.Features.Matches.MarkMatchSeen
{
    public class MarkMatchSeenCommandHandler : IRequestHandler<MarkMatchSeenCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly ICurrentUserService _currentUserService;

        public MarkMatchSeenCommandHandler(
            IProfileRepository profileRepository,
            IMatchRepository matchRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _matchRepository = matchRepository;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(MarkMatchSeenCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var match = await _matchRepository.GetByIdAsync(request.MatchId, cancellationToken);

            // Чужий метч відповідає 404, а не 403, щоб не розкривати, що він існує
            if (match is null || !match.Involves(myProfileId))
            {
                throw new NotFoundException("Метч не знайдено.");
            }

            match.MarkSeenBy(myProfileId, DateTime.UtcNow);

            await _matchRepository.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}