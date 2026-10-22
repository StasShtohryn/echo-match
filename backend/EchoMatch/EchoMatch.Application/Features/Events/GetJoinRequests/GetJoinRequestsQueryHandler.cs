using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Application.Features.Events.Common;
using EchoMatch.Domain.Enums;
using MediatR;

namespace EchoMatch.Application.Features.Events.GetJoinRequests
{
    public class GetJoinRequestsQueryHandler
        : IRequestHandler<GetJoinRequestsQuery, IReadOnlyList<EventJoinRequestDto>>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetJoinRequestsQueryHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _currentUserService = currentUserService;
        }

        public async Task<IReadOnlyList<EventJoinRequestDto>> Handle(
            GetJoinRequestsQuery request,
            CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var @event = (await _eventRepository.GetByIdAsync(request.EventId, cancellationToken)).RequireActive();
            @event.RequireOrganizer(myProfileId);

            var requests = await _eventRepository
                .GetMembersAsync(@event.Id, EventParticipantStatus.Pending, cancellationToken);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            // Найдавніші першими: хто раніше попросився, той раніше отримає відповідь
            return requests
                .OrderBy(r => r.JoinedAt)
                .Select(r => r.ToJoinRequestDto(today))
                .ToList();
        }
    }
}