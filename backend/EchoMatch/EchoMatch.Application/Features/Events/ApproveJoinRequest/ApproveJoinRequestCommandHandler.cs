using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Application.Features.Events.Common;
using EchoMatch.Domain.Enums;
using MediatR;

namespace EchoMatch.Application.Features.Events.ApproveJoinRequest
{
    public class ApproveJoinRequestCommandHandler : IRequestHandler<ApproveJoinRequestCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IEventNotifier _eventNotifier;
        private readonly ICurrentUserService _currentUserService;

        public ApproveJoinRequestCommandHandler(
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

        public async Task<Unit> Handle(ApproveJoinRequestCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var @event = (await _eventRepository.GetByIdAsync(request.EventId, cancellationToken)).RequireActive();
            @event.RequireOrganizer(myProfileId);

            // Той самий замок, що й у записі на відкриту подію: погодження теж
            // займає місце
            await using var seats = await _eventRepository.LockSeatsAsync(@event.Id, cancellationToken);

            var participation = await _eventRepository
                .GetParticipationAsync(@event.Id, request.ProfileId, cancellationToken);

            if (participation?.Status != EventParticipantStatus.Pending)
            {
                throw new NotFoundException("Заявку не знайдено.");
            }

            if (!@event.HasRoomFor(await _eventRepository.CountApprovedAsync(@event.Id, cancellationToken)))
            {
                throw new ConflictException("Місць більше немає.");
            }

            participation.Approve();

            await _eventRepository.SaveChangesAsync(cancellationToken);
            await seats.CommitAsync(cancellationToken);

            if (await _profileRepository.GetUserIdAsync(request.ProfileId, cancellationToken) is { } requesterUserId)
            {
                await _eventNotifier.RequestDecidedAsync(
                    requesterUserId,
                    new EventRequestDecidedEvent(@event.Id, EventParticipantStatus.Approved),
                    cancellationToken);
            }

            var member = await _eventRepository.GetMemberAsync(@event.Id, request.ProfileId, cancellationToken);
            var audience = await _eventRepository
                .GetMemberUserIdsAsync(@event.Id, includePending: false, cancellationToken);

            await _eventNotifier.ParticipantJoinedAsync(audience, member!.ToJoinedEvent(@event.Id), cancellationToken);

            return Unit.Value;
        }
    }
}