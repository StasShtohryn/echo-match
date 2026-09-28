using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using MediatR;

namespace EchoMatch.Application.Features.Messages.SetReaction
{
    public class SetReactionCommandHandler : IRequestHandler<SetReactionCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly IChatNotifier _chatNotifier;
        private readonly ICurrentUserService _currentUserService;

        public SetReactionCommandHandler(
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

        public async Task<Unit> Handle(SetReactionCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            _ = await _matchRepository.GetForParticipantAsync(request.MatchId, myProfileId, cancellationToken)
                ?? throw new NotFoundException("Метч не знайдено.");

            var message = await _messageRepository.GetByIdAsync(request.MessageId, cancellationToken);

            // Повідомлення з іншої розмови — теж 404: інакше за відповідями можна
            // було б перевіряти, які id існують у чужих чатах
            if (message is null || message.MatchId != request.MatchId)
            {
                throw new NotFoundException("Повідомлення не знайдено.");
            }

            var existing = await _messageRepository
                .GetReactionAsync(request.MessageId, myProfileId, cancellationToken);

            if (existing is null)
            {
                await _messageRepository.AddReactionAsync(
                    new MessageReaction
                    {
                        MessageId = request.MessageId,
                        ProfileId = myProfileId,
                        Type = request.Type!.Value
                    },
                    cancellationToken);
            }
            else
            {
                // Заміна оновлює той самий рядок: реакція одна на людину
                existing.Type = request.Type!.Value;
            }

            await _messageRepository.SaveChangesAsync(cancellationToken);

            await _chatNotifier.ReactionChangedAsync(
                new ChatReactionEvent(request.MatchId, request.MessageId, myProfileId, request.Type),
                cancellationToken);

            return Unit.Value;
        }
    }
}