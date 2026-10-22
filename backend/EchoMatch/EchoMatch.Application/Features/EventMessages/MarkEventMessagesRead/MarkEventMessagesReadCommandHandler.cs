using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Features.Events.Common;
using MediatR;

namespace EchoMatch.Application.Features.EventMessages.MarkEventMessagesRead
{
    public class MarkEventMessagesReadCommandHandler : IRequestHandler<MarkEventMessagesReadCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IEventNotifier _eventNotifier;
        private readonly ICurrentUserService _currentUserService;

        public MarkEventMessagesReadCommandHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            IEventNotifier eventNotifier,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _eventNotifier = eventNotifier;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(MarkEventMessagesReadCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var (_, participation) = await _eventRepository
                .RequireApprovedParticipantAsync(request.EventId, myProfileId, cancellationToken);

            // Як і в метчі: позначка зсувається на «зараз», тож прочитаним
            // стає все, що вже є в розмові
            var readAt = DateTime.UtcNow;
            participation.MarkRead(readAt);

            await _eventRepository.SaveChangesAsync(cancellationToken);

            // Решта одразу бачить, що лічильник «прочитали N» виріс
            var audience = await _eventRepository
                .GetMemberUserIdsAsync(request.EventId, includePending: false, cancellationToken);

            await _eventNotifier.MessagesReadAsync(
                audience,
                new EventMessagesReadEvent(request.EventId, myProfileId, DateTime.SpecifyKind(readAt, DateTimeKind.Utc)),
                cancellationToken);

            return Unit.Value;
        }
    }
}