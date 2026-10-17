using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using MediatR;

namespace EchoMatch.Application.Features.Events.GetEvent
{
    public class GetEventQueryHandler : IRequestHandler<GetEventQuery, EventDetailsDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly ICurrentUserService _currentUserService;

        public GetEventQueryHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _currentUserService = currentUserService;
        }

        public async Task<EventDetailsDto> Handle(GetEventQuery request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var details = await _eventRepository.GetDetailsAsync(request.EventId, myProfileId, cancellationToken)
                ?? throw new NotFoundException("Подію не знайдено.");

            // Скасовану подію бачать лише ті, кого вона стосувалась: їм треба
            // дізнатися про скасування, решті — нічого
            if (details.CancelledAt is not null && details.Card.MyStatus is null)
            {
                throw new NotFoundException("Подію не знайдено.");
            }

            return details.ToDetailsDto();
        }
    }
}