using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using MediatR;

namespace EchoMatch.Application.Features.Matches.Unmatch
{
    public class UnmatchCommandHandler : IRequestHandler<UnmatchCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly IChatNotifier _chatNotifier;
        private readonly ICurrentUserService _currentUserService;

        public UnmatchCommandHandler(
            IProfileRepository profileRepository,
            IMatchRepository matchRepository,
            IChatNotifier chatNotifier,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _matchRepository = matchRepository;
            _chatNotifier = chatNotifier;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(UnmatchCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var match = await _matchRepository
                .GetForParticipantAsync(request.MatchId, myProfileId, cancellationToken)
                ?? throw new NotFoundException("Метч не знайдено.");

            match.Unmatch(DateTime.UtcNow);

            await _matchRepository.SaveChangesAsync(cancellationToken);

            // Свайпи навмисно лишаються чинними: стрічка виключає всіх, щодо кого
            // є лайк, тож після розриву пара більше не побачить одне одного
            await _chatNotifier.UnmatchedAsync(
                new ChatUnmatchedEvent(request.MatchId, myProfileId),
                cancellationToken);

            return Unit.Value;
        }
    }
}