using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Application.Features.Events.Common;
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

            // Кількість бачать усі, імена — лише ті, хто йде: куди людина
            // збирається, її справа, доки вона не зустрінеться з рештою
            var (@event, _) = await _eventRepository
                .RequireApprovedParticipantAsync(request.EventId, myProfileId, cancellationToken);

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