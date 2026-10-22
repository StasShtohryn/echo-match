using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.Enums;
using MediatR;

namespace EchoMatch.Application.Features.Events.LeaveEvent
{
    public class LeaveEventCommandHandler : IRequestHandler<LeaveEventCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IEventNotifier _eventNotifier;
        private readonly ICurrentUserService _currentUserService;

        public LeaveEventCommandHandler(
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

        public async Task<Unit> Handle(LeaveEventCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            // Вийти можна і зі скасованої події: людина прибирає її зі своїх
            var @event = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken)
                ?? throw new NotFoundException("Подію не знайдено.");

            if (@event.IsOrganizedBy(myProfileId))
            {
                throw new ConflictException("Організатор не може вийти з власної події — її можна скасувати.");
            }

            var participation = await _eventRepository.GetParticipationAsync(@event.Id, myProfileId, cancellationToken)
                ?? throw new NotFoundException("Ви не записані на цю подію.");

            // Інакше відмову можна було б стерти й одразу подати заявку знову
            if (participation.Status == EventParticipantStatus.Rejected)
            {
                throw new ConflictException("Організатор уже вирішив щодо вашої участі.");
            }

            var wasGoing = participation.Status == EventParticipantStatus.Approved;

            participation.Leave(DateTime.UtcNow);

            await _eventRepository.SaveChangesAsync(cancellationToken);

            // Відкликану заявку бачив лише організатор, і він побачить її
            // зникнення, коли наступного разу відкриє список заявок
            if (wasGoing)
            {
                // Я вже не серед прийнятих, тож додаюся сам: мої інші вкладки
                // теж мають закрити чат
                var audience = (await _eventRepository
                    .GetMemberUserIdsAsync(@event.Id, includePending: false, cancellationToken)).ToList();

                audience.Add(_currentUserService.UserId);

                await _eventNotifier.ParticipantLeftAsync(
                    audience,
                    new EventParticipantLeftEvent(@event.Id, myProfileId),
                    cancellationToken);
            }

            return Unit.Value;
        }
    }
}