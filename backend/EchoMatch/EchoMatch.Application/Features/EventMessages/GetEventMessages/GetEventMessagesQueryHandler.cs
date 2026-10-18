using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Application.Features.Events.Common;
using MediatR;

namespace EchoMatch.Application.Features.EventMessages.GetEventMessages
{
    public class GetEventMessagesQueryHandler : IRequestHandler<GetEventMessagesQuery, EventMessagePageDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IEventMessageRepository _eventMessageRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetEventMessagesQueryHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            IEventMessageRepository eventMessageRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _eventMessageRepository = eventMessageRepository;
            _currentUserService = currentUserService;
        }

        public async Task<EventMessagePageDto> Handle(GetEventMessagesQuery request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            await _eventRepository.RequireApprovedParticipantAsync(request.EventId, myProfileId, cancellationToken);

            var messages = await _eventMessageRepository
                .GetPageAsync(request.EventId, request.Before, request.Limit, cancellationToken);

            var readMarks = await _eventRepository
                .GetReadMarksAsync(request.EventId, myProfileId, cancellationToken);

            return new EventMessagePageDto(
                messages.Select(m => m.ToMessageDto(myProfileId)).ToList(),
                readMarks
                    .Select(r => new EventReadMarkDto(
                        r.ProfileId,
                        r.LastReadAt is { } readAt ? DateTime.SpecifyKind(readAt, DateTimeKind.Utc) : null))
                    .ToList());
        }
    }
}