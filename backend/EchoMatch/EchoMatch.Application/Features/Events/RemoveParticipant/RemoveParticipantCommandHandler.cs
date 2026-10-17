using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Features.Events.Common;
using EchoMatch.Domain.Enums;
using MediatR;

namespace EchoMatch.Application.Features.Events.RemoveParticipant
{
    public class RemoveParticipantCommandHandler : IRequestHandler<RemoveParticipantCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly ICurrentUserService _currentUserService;

        public RemoveParticipantCommandHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(RemoveParticipantCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var @event = (await _eventRepository.GetByIdAsync(request.EventId, cancellationToken)).RequireActive();
            @event.RequireOrganizer(myProfileId);

            if (@event.IsOrganizedBy(request.ProfileId))
            {
                throw new ConflictException("Організатора не можна прибрати з власної події.");
            }

            var participation = await _eventRepository
                .GetParticipationAsync(@event.Id, request.ProfileId, cancellationToken);

            if (participation?.Status != EventParticipantStatus.Approved)
            {
                throw new NotFoundException("Учасника не знайдено.");
            }

            // Відхилений, а не видалений: інакше вигнаний одразу записався б знову
            participation.Reject();

            await _eventRepository.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}