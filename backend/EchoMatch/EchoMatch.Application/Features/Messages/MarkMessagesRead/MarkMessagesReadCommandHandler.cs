using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using MediatR;

namespace EchoMatch.Application.Features.Messages.MarkMessagesRead
{
    public class MarkMessagesReadCommandHandler : IRequestHandler<MarkMessagesReadCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly IChatNotifier _chatNotifier;
        private readonly ICurrentUserService _currentUserService;

        public MarkMessagesReadCommandHandler(
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

        public async Task<Unit> Handle(MarkMessagesReadCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var match = await _matchRepository
                .GetForParticipantAsync(request.MatchId, myProfileId, cancellationToken)
                ?? throw new NotFoundException("Метч не знайдено.");

            // Позначка зсувається на «зараз», а не на час останнього повідомлення:
            // прочитаним стає все, що вже є в розмові
            var readAt = DateTime.UtcNow;
            match.MarkReadBy(myProfileId, readAt);

            await _matchRepository.SaveChangesAsync(cancellationToken);

            // Співрозмовник одразу бачить галочки
            await _chatNotifier.MessagesReadAsync(
                new ChatReadEvent(request.MatchId, myProfileId, DateTime.SpecifyKind(readAt, DateTimeKind.Utc)),
                cancellationToken);

            return Unit.Value;
        }
    }
}