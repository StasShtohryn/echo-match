using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Application.Features.Events.Common;
using EchoMatch.Domain.Entities;
using MediatR;

namespace EchoMatch.Application.Features.EventMessages.SendEventMessage
{
    public class SendEventMessageCommandHandler : IRequestHandler<SendEventMessageCommand, EventMessageDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IEventMessageRepository _eventMessageRepository;
        private readonly IEventNotifier _eventNotifier;
        private readonly ICurrentUserService _currentUserService;

        public SendEventMessageCommandHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            IEventMessageRepository eventMessageRepository,
            IEventNotifier eventNotifier,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _eventMessageRepository = eventMessageRepository;
            _eventNotifier = eventNotifier;
            _currentUserService = currentUserService;
        }

        public async Task<EventMessageDto> Handle(SendEventMessageCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var (@event, _) = await _eventRepository
                .RequireApprovedParticipantAsync(request.EventId, myProfileId, cancellationToken);

            // Читати скасовану подію учасники ще можуть, писати — ні
            if (@event.CancelledAt is not null)
            {
                throw new ConflictException("Подію скасовано — чат лише для читання.");
            }

            var message = new EventMessage
            {
                EventId = @event.Id,
                SenderProfileId = myProfileId,
                Text = request.Text!.Trim()
            };

            await _eventMessageRepository.AddAsync(message, cancellationToken);
            await _eventMessageRepository.SaveChangesAsync(cancellationToken);

            // Та сама проєкція, що й у сторінці історії: відповідь не відрізняється
            // від того, що клієнт побачить, коли перезавантажить чат
            var stored = (await _eventMessageRepository.GetItemAsync(message.Id, cancellationToken))!;

            // Сповіщення після збереження: жива доставка не впливає на те, чи
            // повідомлення записане. Автор теж серед адресатів — так
            // синхронізуються його інші вкладки, а клієнт відкидає дубль за id
            var audience = await _eventRepository
                .GetMemberUserIdsAsync(@event.Id, includePending: false, cancellationToken);

            await _eventNotifier.MessageSentAsync(audience, stored.ToReceivedEvent(@event.Id), cancellationToken);

            return stored.ToMessageDto(myProfileId);
        }
    }
}