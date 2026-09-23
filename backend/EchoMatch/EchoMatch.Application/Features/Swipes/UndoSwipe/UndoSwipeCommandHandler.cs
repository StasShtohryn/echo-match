using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using MediatR;

namespace EchoMatch.Application.Features.Swipes.UndoSwipe
{
    public class UndoSwipeCommandHandler : IRequestHandler<UndoSwipeCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly ISwipeRepository _swipeRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly ICurrentUserService _currentUserService;

        public UndoSwipeCommandHandler(
            IProfileRepository profileRepository,
            ISwipeRepository swipeRepository,
            IMatchRepository matchRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _swipeRepository = swipeRepository;
            _matchRepository = matchRepository;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(UndoSwipeCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var swipe = await _swipeRepository
                .GetAsync(myProfileId, request.TargetProfileId, cancellationToken)
                ?? throw new NotFoundException("Свайп не знайдено.");

            // Скасувати лайк, що вже став метчем, означало б розірвати метч —
            // це окрема дія, а не відкат
            if (await _matchRepository.ExistsForPairAsync(myProfileId, request.TargetProfileId, cancellationToken))
            {
                throw new ConflictException("Уже є метч — лайк скасувати не можна.");
            }

            swipe.Undo(DateTime.UtcNow);

            await _swipeRepository.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}