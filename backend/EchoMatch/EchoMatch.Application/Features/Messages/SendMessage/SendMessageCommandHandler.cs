using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Entities;
using MediatR;

namespace EchoMatch.Application.Features.Messages.SendMessage
{
    public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, MessageDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly IChatNotifier _chatNotifier;
        private readonly ICurrentUserService _currentUserService;

        public SendMessageCommandHandler(
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

        public async Task<MessageDto> Handle(SendMessageCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            // Чужий метч і метч із видаленим співрозмовником однаково дають 404:
            // існування першого не розкривається, писати в другий нікому
            _ = await _matchRepository.GetForParticipantAsync(request.MatchId, myProfileId, cancellationToken)
                ?? throw new NotFoundException("Метч не знайдено.");

            var message = new Message
            {
                MatchId = request.MatchId,
                SenderProfileId = myProfileId,
                Text = request.Text!.Trim()
            };

            await _messageRepository.AddAsync(message, cancellationToken);
            await _messageRepository.SaveChangesAsync(cancellationToken);

            var sentAt = DateTime.SpecifyKind(message.CreatedAt, DateTimeKind.Utc);

            // Сповіщення після збереження: жива доставка не має жодного впливу
            // на те, чи повідомлення записане
            await _chatNotifier.MessageSentAsync(
                new ChatMessageEvent(
                    message.MatchId,
                    message.Id,
                    message.Sequence,
                    message.SenderProfileId,
                    message.Text,
                    sentAt),
                cancellationToken);

            return new MessageDto(
                message.Id,
                message.Sequence,
                message.SenderProfileId,
                true,
                message.Text,
                sentAt,
                null,
                null);
        }
    }
}