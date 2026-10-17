using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Application.Features.Events.Common;
using EchoMatch.Domain.Entities;
using MediatR;

namespace EchoMatch.Application.Features.Events.CreateEvent
{
    public class CreateEventCommandHandler : IRequestHandler<CreateEventCommand, EventDetailsDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly ICurrentUserService _currentUserService;

        public CreateEventCommandHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _currentUserService = currentUserService;
        }

        public async Task<EventDetailsDto> Handle(CreateEventCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            if (!await _eventRepository.CategoryExistsAsync(request.CategoryId, cancellationToken))
            {
                throw new NotFoundException("Категорію не знайдено.");
            }

            var @event = new Event { OrganizerProfileId = myProfileId };
            request.ApplyTo(@event);
            @event.EnrolOrganizer();

            await _eventRepository.AddAsync(@event, cancellationToken);
            await _eventRepository.SaveChangesAsync(cancellationToken);

            var details = await _eventRepository.GetDetailsAsync(@event.Id, myProfileId, cancellationToken);
            return details!.ToDetailsDto();
        }
    }
}