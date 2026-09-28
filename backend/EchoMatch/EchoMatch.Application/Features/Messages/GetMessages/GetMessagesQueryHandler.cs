using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using MediatR;

namespace EchoMatch.Application.Features.Messages.GetMessages
{
    public class GetMessagesQueryHandler : IRequestHandler<GetMessagesQuery, MessagePageDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IMatchRepository _matchRepository;
        private readonly IMessageRepository _messageRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetMessagesQueryHandler(
            IProfileRepository profileRepository,
            IMatchRepository matchRepository,
            IMessageRepository messageRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _matchRepository = matchRepository;
            _messageRepository = messageRepository;
            _currentUserService = currentUserService;
        }

        public async Task<MessagePageDto> Handle(GetMessagesQuery request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var match = await _matchRepository
                .GetForParticipantAsync(request.MatchId, myProfileId, cancellationToken)
                ?? throw new NotFoundException("Метч не знайдено.");

            var messages = await _messageRepository
                .GetPageAsync(request.MatchId, myProfileId, request.Before, request.Limit, cancellationToken);

            var items = messages
                .Select(m => new MessageDto(
                    m.Id,
                    m.Sequence,
                    m.SenderProfileId,
                    m.SenderProfileId == myProfileId,
                    m.Text,
                    DateTime.SpecifyKind(m.SentAt, DateTimeKind.Utc),
                    m.MyReaction,
                    m.PartnerReaction))
                .ToList();

            var partnerLastReadAt = match.LastReadAtBy(match.OtherProfileId(myProfileId));

            return new MessagePageDto(
                items,
                partnerLastReadAt is null
                    ? null
                    : DateTime.SpecifyKind(partnerLastReadAt.Value, DateTimeKind.Utc));
        }
    }
}