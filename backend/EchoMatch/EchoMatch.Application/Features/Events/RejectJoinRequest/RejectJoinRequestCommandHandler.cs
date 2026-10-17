using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Features.Events.Common;
using EchoMatch.Domain.Enums;
using MediatR;

namespace EchoMatch.Application.Features.Events.RejectJoinRequest
{
    public class RejectJoinRequestCommandHandler : IRequestHandler<RejectJoinRequestCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly IEventRepository _eventRepository;
        private readonly ICurrentUserService _currentUserService;

        public RejectJoinRequestCommandHandler(
            IProfileRepository profileRepository,
            IEventRepository eventRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _eventRepository = eventRepository;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(RejectJoinRequestCommand request, CancellationToken cancellationToken)
        {
            var myProfileId = await _profileRepository
                .GetIdByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            var @event = (await _eventRepository.GetByIdAsync(request.EventId, cancellationToken)).RequireActive();
            @event.RequireOrganizer(myProfileId);

            var participation = await _eventRepository
                .GetParticipationAsync(@event.Id, request.ProfileId, cancellationToken);

            if (participation?.Status != EventParticipantStatus.Pending)
            {
                throw new NotFoundException("Заявку не знайдено.");
            }

            participation.Reject();

            await _eventRepository.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}