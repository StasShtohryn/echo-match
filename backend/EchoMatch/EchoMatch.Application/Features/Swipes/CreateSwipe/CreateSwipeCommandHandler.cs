using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using EchoMatch.Domain.Enums;
using MediatR;

namespace EchoMatch.Application.Features.Swipes.CreateSwipe
{
    public class CreateSwipeCommandHandler : IRequestHandler<CreateSwipeCommand, SwipeResultDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly ISwipeRepository _swipeRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly ICurrentUserService _currentUserService;

        public CreateSwipeCommandHandler(
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

        public async Task<SwipeResultDto> Handle(CreateSwipeCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            if (myProfileId == request.TargetProfileId)
            {
                throw new ArgumentException("Не можна свайпнути власний профіль.");
            }

            if (!await _profileRepository.ExistsAsync(request.TargetProfileId, cancellationToken))
            {
                throw new NotFoundException("Профіль не знайдено.");
            }

            var direction = request.Direction!.Value;
            var now = DateTime.UtcNow;

            var existing = await _swipeRepository
                .GetAsync(myProfileId, request.TargetProfileId, cancellationToken);

            if (existing is null)
            {
                await _swipeRepository.AddAsync(
                    new Swipe
                    {
                        SwiperProfileId = myProfileId,
                        TargetProfileId = request.TargetProfileId,
                        Direction = direction,
                        DecidedAt = now
                    },
                    cancellationToken);
            }
            else if (existing.IsExpired(now))
            {
                existing.Direction = direction;
                existing.DecidedAt = now;
            }
            else
            {
                throw new ConflictException("Ви вже свайпнули цю людину.");
            }

            Match? match = null;

            if (direction == SwipeDirection.Like &&
                await _swipeRepository.HasLikeAsync(request.TargetProfileId, myProfileId, cancellationToken))
            {
                match = Match.Between(myProfileId, request.TargetProfileId);
                await _matchRepository.AddAsync(match, cancellationToken);
            }

            await _swipeRepository.SaveChangesAsync(cancellationToken);

            return new SwipeResultDto(match is not null, match?.Id);
        }
    }
}