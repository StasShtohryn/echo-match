using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Domain.ValueObjects;
using MediatR;

namespace EchoMatch.Application.Features.Profiles.UpdateLocation
{
    public class UpdateLocationCommandHandler : IRequestHandler<UpdateLocationCommand, Unit>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly ICurrentUserService _currentUserService;

        public UpdateLocationCommandHandler(
            IProfileRepository profileRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _currentUserService = currentUserService;
        }

        public async Task<Unit> Handle(UpdateLocationCommand request, CancellationToken cancellationToken)
        {
            var profile = await _profileRepository
                .GetByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            profile.Location = new GeoLocation(request.Latitude!.Value, request.Longitude!.Value);
            profile.LastLocationUpdatedAt = DateTime.UtcNow;

            await _profileRepository.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}