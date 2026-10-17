using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Features.Events.Common;
using MediatR;

namespace EchoMatch.Application.Features.Events.CancelEvent
{
    public class CancelEventCommandHandler : IRequestHandler<CancelEventCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly ICurrentUserService _currentUserService;

        public CancelEventCommandHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(CancelEventCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            // Без RequireActive: повторне скасування нічого не змінює й не є помилкою
            var @event = await _eventRepository.GetByIdAsync(request.EventId, cancellationToken)
                ?? throw new NotFoundException("Подію не знайдено.");

            @event.RequireOrganizer(myProfileId);
            @event.Cancel(DateTime.UtcNow);

            await _eventRepository.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}