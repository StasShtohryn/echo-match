using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Domain.Enums;
using MediatR;

namespace EchoMatch.Application.Features.Events.GetMyEvents
{
    public class GetMyEventsQueryHandler : IRequestHandler<GetMyEventsQuery, IReadOnlyList<EventMineDto>>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetMyEventsQueryHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _currentUserService = currentUserService;
        }

        public async Task<IReadOnlyList<EventMineDto>> Handle(GetMyEventsQuery request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var events = await _eventRepository.GetMineAsync(myProfileId, cancellationToken);

            // Як список чатів метчів: зверху та подія, де щойно щось сталося.
            // Для заявки, що чекає рішення, діяльність — сама заявка: чату вона
            // ще не бачить, і чуже повідомлення не повинно її підіймати
            return events
                .OrderByDescending(e => e.Card.MyStatus == EventParticipantStatus.Approved
                    ? e.LastMessageSentAt ?? e.JoinedAt
                    : e.JoinedAt)
                .ThenBy(e => e.Card.StartsAt)
                .Select(e => e.ToMineDto(myProfileId))
                .ToList();
        }
    }
}