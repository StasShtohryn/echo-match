using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Application.Features.Events.Common;
using EchoMatch.Domain.Enums;
using MediatR;

namespace EchoMatch.Application.Features.Events.JoinEvent
{
    public class JoinEventCommandHandler : IRequestHandler<JoinEventCommand, JoinEventResultDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IEventNotifier _eventNotifier;
        private readonly ICurrentUserService _currentUserService;

        public JoinEventCommandHandler(
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

        public async Task<JoinEventResultDto> Handle(JoinEventCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var @event = (await _eventRepository.GetByIdAsync(request.EventId, cancellationToken)).RequireActive();

            if (@event.IsOrganizedBy(myProfileId))
            {
                throw new ConflictException("Ви організатор цієї події.");
            }

            if (@event.HasStarted(DateTime.UtcNow))
            {
                throw new ConflictException("Подія вже почалась.");
            }

            // Замок береться на кожен запис, а не лише на відкриту подію: так
            // подвійне натискання стає в чергу й бачить уже надіслану заявку,
            // замість того щоб упертися в унікальний індекс помилкою 500
            await using var seats = await _eventRepository.LockSeatsAsync(@event.Id, cancellationToken);

            var existing = await _eventRepository.GetParticipationAsync(@event.Id, myProfileId, cancellationToken);

            if (existing is not null)
            {
                throw new ConflictException(existing.Status switch
                {
                    EventParticipantStatus.Pending => "Заявку вже надіслано.",
                    EventParticipantStatus.Approved => "Ви вже йдете на цю подію.",
                    _ => "Організатор відхилив вашу участь."
                });
            }

            // Заявки на подію з підтвердженням приймаються й без місць:
            // місце перевіряється, коли організатор погоджує
            if (@event.JoinPolicy == EventJoinPolicy.Open
                && !@event.HasRoomFor(await _eventRepository.CountApprovedAsync(@event.Id, cancellationToken)))
            {
                throw new ConflictException("Місць більше немає.");
            }

            var participant = @event.Join(myProfileId);

            await _eventRepository.SaveChangesAsync(cancellationToken);
            await seats.CommitAsync(cancellationToken);

            var me = await _eventRepository.GetMemberAsync(@event.Id, myProfileId, cancellationToken);

            if (participant.Status == EventParticipantStatus.Approved)
            {
                var audience = await _eventRepository
                    .GetMemberUserIdsAsync(@event.Id, includePending: false, cancellationToken);

                await _eventNotifier.ParticipantJoinedAsync(audience, me!.ToJoinedEvent(@event.Id), cancellationToken);
            }
            else if (await _profileRepository.GetUserIdAsync(@event.OrganizerProfileId, cancellationToken)
                     is { } organizerUserId)
            {
                // Про заявку дізнається лише той, хто її вирішує
                await _eventNotifier.JoinRequestedAsync(
                    organizerUserId,
                    new EventJoinRequestedEvent(@event.Id, myProfileId, me!.DisplayName),
                    cancellationToken);
            }

            return new JoinEventResultDto(participant.Status);
        }
    }
}