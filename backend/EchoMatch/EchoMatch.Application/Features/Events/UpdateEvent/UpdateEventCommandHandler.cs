using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Application.Features.Events.Common;
using MediatR;

namespace EchoMatch.Application.Features.Events.UpdateEvent
{
    public class UpdateEventCommandHandler : IRequestHandler<UpdateEventCommand, EventDetailsDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly ICurrentUserService _currentUserService;

        public UpdateEventCommandHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _currentUserService = currentUserService;
        }

        public async Task<EventDetailsDto> Handle(UpdateEventCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var @event = (await _eventRepository.GetByIdAsync(request.EventId, cancellationToken)).RequireActive();
            @event.RequireOrganizer(myProfileId);

            if (@event.HasStarted(DateTime.UtcNow))
            {
                throw new ConflictException("Подія вже почалась — змінювати її запізно.");
            }

            if (request.CategoryId != @event.CategoryId
                && !await _eventRepository.CategoryExistsAsync(request.CategoryId, cancellationToken))
            {
                throw new NotFoundException("Категорію не знайдено.");
            }

            // Під тим самим замком, що й запис: інакше місця можна було б урізати
            // в ту мить, коли хтось займає останнє
            await using var seats = await _eventRepository.LockSeatsAsync(@event.Id, cancellationToken);

            var approved = await _eventRepository.CountApprovedAsync(@event.Id, cancellationToken);

            if (request.Capacity < approved)
            {
                throw new ConflictException($"Уже прийнято учасників: {approved}. Місць не може бути менше.");
            }

            request.ApplyTo(@event);

            await _eventRepository.SaveChangesAsync(cancellationToken);
            await seats.CommitAsync(cancellationToken);

            var details = await _eventRepository.GetDetailsAsync(@event.Id, myProfileId, cancellationToken);
            return details!.ToDetailsDto();
        }
    }
}