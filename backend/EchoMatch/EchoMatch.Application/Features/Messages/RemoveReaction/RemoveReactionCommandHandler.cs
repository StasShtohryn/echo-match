using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using MediatR;

namespace EchoMatch.Application.Features.Messages.RemoveReaction
{
    public class RemoveReactionCommandHandler : IRequestHandler<RemoveReactionCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly IChatNotifier _chatNotifier;
        private readonly ICurrentUserService _currentUserService;

        public RemoveReactionCommandHandler(
            IProfileRepository profileRepository,
            IMatchRepository matchRepository,
            IMessageRepository messageRepository,
            IChatNotifier chatNotifier,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _matchRepository = matchRepository;
            _messageRepository = messageRepository;
            _chatNotifier = chatNotifier;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(RemoveReactionCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            _ = await _matchRepository.GetForParticipantAsync(request.MatchId, myProfileId, cancellationToken)
                ?? throw new NotFoundException("Метч не знайдено.");

            var reaction = await _messageRepository
                .GetReactionAsync(request.MessageId, myProfileId, cancellationToken)
                ?? throw new NotFoundException("Реакції не знайдено.");

            reaction.Remove(DateTime.UtcNow);

            await _messageRepository.SaveChangesAsync(cancellationToken);

            // Type == null означає «реакцію знято»
            await _chatNotifier.ReactionChangedAsync(
                new ChatReactionEvent(request.MatchId, request.MessageId, myProfileId, null),
                cancellationToken);

            return Unit.Value;
        }
    }
}