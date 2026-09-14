using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using EchoMatch.Domain.ValueObjects;
using MediatR;

namespace EchoMatch.Application.Features.Profiles.UpdatePreferences
{
    public class UpdatePreferencesCommandHandler
        : IRequestHandler<UpdatePreferencesCommand, DiscoveryPreferencesDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly ICurrentUserService _currentUserService;

        public UpdatePreferencesCommandHandler(
            IProfileRepository profileRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _currentUserService = currentUserService;
        }

        public async Task<DiscoveryPreferencesDto> Handle(
            UpdatePreferencesCommand request,
            CancellationToken cancellationToken)
        {
            var profile = await _profileRepository
                .GetByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            profile.Preferences = new DiscoveryPreferences(
                request.ShowMe!.Value,
                request.MinAge,
                request.MaxAge,
                request.MaxDistanceKm);

            await _profileRepository.SaveChangesAsync(cancellationToken);

            return profile.Preferences.ToDto();
        }
    }
}