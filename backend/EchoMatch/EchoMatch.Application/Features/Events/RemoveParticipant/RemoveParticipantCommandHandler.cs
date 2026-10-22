using EchoMatch.Application.Common.Dtos;
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
        private readonly IEventNotifier _eventNotifier;
        private readonly ICurrentUserService _currentUserService;

        public RemoveParticipantCommandHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            IEventNotifier eventNotifier,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _eventNotifier = eventNotifier;
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

            // Решта бачить, що людини більше немає, а сам вигнаний — що чат
            // треба закрити: прийнятим він уже не є, тому додається окремо
            var audience = (await _eventRepository
                .GetMemberUserIdsAsync(@event.Id, includePending: false, cancellationToken)).ToList();

            if (await _profileRepository.GetUserIdAsync(request.ProfileId, cancellationToken) is { } removedUserId)
            {
                audience.Add(removedUserId);
            }

            await _eventNotifier.ParticipantLeftAsync(
                audience,
                new EventParticipantLeftEvent(@event.Id, request.ProfileId),
                cancellationToken);

            return Unit.Value;
        }
    }
}