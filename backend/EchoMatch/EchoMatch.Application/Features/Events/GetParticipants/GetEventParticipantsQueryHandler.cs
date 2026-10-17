using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Domain.Enums;
using MediatR;

namespace EchoMatch.Application.Features.Events.GetParticipants
{
    public class GetEventParticipantsQueryHandler
        : IRequestHandler<GetEventParticipantsQuery, IReadOnlyList<EventParticipantDto>>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetEventParticipantsQueryHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _currentUserService = currentUserService;
        }

        public async Task<IReadOnlyList<EventParticipantDto>> Handle(
            GetEventParticipantsQuery request,
            CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var @event = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken)
                ?? throw new NotFoundException("Подію не знайдено.");

            var mine = await _eventRepository.GetParticipationAsync(@event.Id, myProfileId, cancellationToken);

            if (@event.CancelledAt is not null && mine is null)
            {
                throw new NotFoundException("Подію не знайдено.");
            }

            // Кількість бачать усі, імена — лише ті, хто йде: куди людина
            // збирається, її справа, доки вона не зустрінеться з рештою
            if (mine?.Status != EventParticipantStatus.Approved)
            {
                throw new ForbiddenException("Учасників бачать лише ті, хто йде на подію.");
            }

            var members = await _eventRepository
                .GetMembersAsync(@event.Id, EventParticipantStatus.Approved, cancellationToken);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            return members
                .OrderByDescending(m => @event.IsOrganizedBy(m.ProfileId))
                .ThenBy(m => m.JoinedAt)
                .Select(m => m.ToParticipantDto(@event.OrganizerProfileId, today))
                .ToList();
        }
    }
}