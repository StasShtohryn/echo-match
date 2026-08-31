using EchoMatch.Application.Common.Dtos;
using EchoMatch.Application.Common.Exceptions;
using EchoMatch.Application.Common.Interfaces;
using EchoMatch.Application.Common.Mappings;
using MediatR;


namespace EchoMatch.Application.Features.Profiles.UpdateProfile
{
    public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, MyProfileDto>
    {
        private readonly IProfileRepository _profileRepository;
        private readonly ICurrentUserService _currentUserService;

        public UpdateProfileCommandHandler(
            IProfileRepository profileRepository,
            ICurrentUserService currentUserService)
        {
            _profileRepository = profileRepository;
            _currentUserService = currentUserService;
        }

        public async Task<MyProfileDto> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
        {
            var profile = await _profileRepository.GetByUserIdAsync(_currentUserService.UserId, cancellationToken)
                ?? throw new NotFoundException("Профіль ще не створено.");

            profile.DisplayName = request.DisplayName;
            profile.Gender = request.Gender;

            profile.Orientation = request.Orientation;
            profile.Bio = request.Bio;
            profile.Occupation = request.Occupation;
            profile.Company = request.Company;
            profile.School = request.School;
            profile.HeightCm = request.HeightCm;

            profile.LookingFor = request.LookingFor;

            profile.FamilyPlans = request.FamilyPlans;
            profile.Communication = request.Communication;
            profile.LoveLanguage = request.LoveLanguage;
            profile.Pets = request.Pets;
            profile.Drinking = request.Drinking;
            profile.Smoking = request.Smoking;
            profile.Workout = request.Workout;

            profile.InstagramHandle = request.InstagramHandle;
            profile.SpotifyHandle = request.SpotifyHandle;

            await _profileRepository.SaveChangesAsync(cancellationToken);

            return profile.ToMyProfileDto();
        }
    }
}
